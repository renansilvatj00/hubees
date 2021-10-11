const express = require('express');
const router = express.Router();
const StayRepository = require('../repositories/stays');
const timeStampValidator = require('../helpers/timestamp-validator');

module.exports = function (middlewares) {

    router.use(middlewares.authMiddleware);

    router.get('/stays/:userId', middlewares.verifyUserExistsMiddleware, async (req, res) => {
        const payload = req.payload();

        try {
            const { userId } = req.params;

            const stays = await StayRepository.getAll(userId);
            payload.data.stays = stays;

            if (!stays.length) {
                payload.msg = 'Este usuário não possui estadias.';
            }

            res.status(payload.code).json(payload);
        } catch (error) {
            payload.msg = error.message;
            payload.success = false;
            res.status(payload.code).json(payload);
        }
    })

    router.post('/stays/:userId', middlewares.verifyUserExistsMiddleware, async (req, res) => {
        const payload = req.payload(['openedAtTimestamp']);

        try {
            const { userId } = req.params;
            const openedAtTimestamp = Number(req.body.openedAtTimestamp);

            if (!openedAtTimestamp) {
                payload.success = false;
                payload.form.openedAtTimestamp.error = true;
                payload.form.openedAtTimestamp.msg = 'Campo obrigatório';
            } else if (!timeStampValidator.isValidTimestamp(openedAtTimestamp)) {
                payload.success = false;
                payload.form.openedAtTimestamp.error = true;
                payload.form.openedAtTimestamp.msg = 'Timestamp inválido';
            } else if (timeStampValidator.isPastDate(openedAtTimestamp)) {
                payload.success = false;
                payload.form.openedAtTimestamp.error = true;
                payload.form.openedAtTimestamp.msg = 'Timestamp não pode ser anterior à 01/01/2021';
            } else if (timeStampValidator.isFutureDate(openedAtTimestamp)) {
                payload.success = false
                payload.form.openedAtTimestamp.error = true;
                payload.form.openedAtTimestamp.msg = 'Timestamp não pode ser uma data no futuro';
            }

            if (!payload.success) {
                payload.code = 400;
                throw new Error('Verifique todos os campos');
            }

            const openedStays = await StayRepository.getOpenedStays(userId);
            const closedStays = await StayRepository.getClosedStays(userId);

            if (openedStays.length) {
                payload.code = 400;
                throw new Error('Este usuário já tem uma estadia aberta');
            }

            if (closedStays.length) {
                payload.code = 400;
                throw new Error('Este usuário tem uma estadia que ainda não foi paga');
            }

            const stay = await StayRepository.create(userId, { openedAtTimestamp });

            payload.code = 201;
            payload.data.stay = stay;
            payload.msg = 'Estadia inserida com sucesso';

            res.status(payload.code).json(payload);
        } catch (error) {
            payload.msg = error.message;
            payload.success = false;
            res.status(payload.code).json(payload);
        }
    })

    router.get('/stays/:userId/stay', middlewares.verifyUserExistsMiddleware, async (req, res) => {
        const payload = req.payload();

        try {
            const { userId } = req.params;
            const openedStays = await StayRepository.getOpenedStays(userId);
            const closedStays = await StayRepository.getClosedStays(userId);
            const paidStays = await StayRepository.getPaidStays(userId);

            let stay = null;

            if (openedStays.length) {
                stay = openedStays[0];
            }

            if (closedStays.length) {
                stay = closedStays[0];
            }

            if (paidStays.length) {
                stay = paidStays[0];
            }

            if (!stay) {
                payload.code = 404;
                throw new Error('Nenhuma estadia encontrada');
            }

            payload.data.stay = stay;
            res.status(payload.code).json(payload);
        } catch (error) {
            payload.msg = error.message;
            payload.success = false;
            res.status(payload.code).json(payload);
        }
    })

    router.put('/stays/:userId/close', middlewares.verifyUserExistsMiddleware, async (req, res) => {
        const payload = req.payload(['closedAtTimestamp']);

        try {
            const { userId } = req.params;

            const openedStays = await StayRepository.getOpenedStays(userId);

            if (!openedStays.length) {
                payload.code = 400;
                throw new Error('Este usuário não tem estadia aberta');
            }

            const closedAtTimestamp = Number(req.body.closedAtTimestamp);

            if (!closedAtTimestamp) {
                payload.success = false;
                payload.form.closedAtTimestamp.error = true;
                payload.form.closedAtTimestamp.msg = 'Campo obrigatório';
            } else if (!timeStampValidator.isValidTimestamp(closedAtTimestamp)) {
                payload.success = false
                payload.form.closedAtTimestamp.error = true;
                payload.form.closedAtTimestamp.msg = 'Timestamp inválido';
            } else if (timeStampValidator.isPastDate(closedAtTimestamp)) {
                payload.success = false;
                payload.form.openedAtTimestamp.error = true;
                payload.form.openedAtTimestamp.msg = 'Timestamp não pode ser anterior à 01/01/2021';
            } else if (timeStampValidator.isFutureDate(closedAtTimestamp)) {
                payload.success = false;
                payload.form.closedAtTimestamp.error = true;
                payload.form.closedAtTimestamp.msg = 'Timestamp não pode ser uma data no futuro';
            } else {
                const openedAtTimestamp = new Date(openedStays[0].openedAt).getTime();

                if (openedAtTimestamp >= closedAtTimestamp) {
                    payload.success = false;
                    payload.form.closedAtTimestamp.error = true;
                    payload.form.closedAtTimestamp.msg = 'Timestamp de fechamento não pode ser menor ou igual que o timestamp de abertura';
                }
            }

            if (!payload.success) {
                payload.code = 400;
                throw new Error('Verifique todos os campos');
            }

            const stay = await StayRepository.close(userId, openedStays[0]._id, closedAtTimestamp);

            payload.msg = 'Estadia fechada com sucesso';

            payload.data.stay = stay;

            res.status(payload.code).json(payload);
        } catch (error) {
            payload.msg = error.message;
            payload.success = false;
            res.status(payload.code).json(payload);
        }
    })

    router.put('/stays/:userId/update', middlewares.verifyUserExistsMiddleware, async (req, res) => {

        const payload = req.payload(['newEntryTime']);

        try {
            const { userId } = req.params;

            const openedStays = await StayRepository.getOpenedStays(userId);

            if (!openedStays.length) {
                payload.code = 400;
                throw new Error('Este usuário não tem estadia aberta');
            }

            const { newEntryTime } = req.body;

            if (!newEntryTime) {
                payload.success = false;
                payload.form.newEntryTime.error = true;
                payload.form.newEntryTime.msg = 'Campo obrigatório';
            } else if (!timeStampValidator.isValidTimestamp(newEntryTime)) {
                payload.success = false;
                payload.form.newEntryTime.error = true;
                payload.form.newEntryTime.msg = 'Timestamp inválido';
            } else if (timeStampValidator.isPastDate(newEntryTime)) {
                payload.success = false;
                payload.form.newEntryTime.error = true;
                payload.form.newEntryTime.msg = 'Timestamp não pode ser anterior à 01/01/2021';
            } else if (timeStampValidator.isFutureDate(newEntryTime)) {
                payload.success = false
                payload.form.newEntryTime.error = true;
                payload.form.newEntryTime.msg = 'Timestamp não pode ser uma data no futuro';
            }

            if (!payload.success) {
                payload.code = 400;
                throw new Error('Verifique todos os campos');
            }

            const stay = await StayRepository.update(userId, openedStays[0]._id, newEntryTime);
            payload.data.stay = stay;

            payload.msg = 'Estadia atualizada com sucesso';

            res.status(payload.code).json(payload);
        } catch (error) {
            payload.msg = error.message;
            payload.success = false;
            res.status(payload.code).json(payload);
        }
    })

    router.put('/stays/:userId/pay', middlewares.verifyUserExistsMiddleware, async (req, res) => {

        const payload = req.payload(['paidAtTimestamp']);

        try {
            const { userId } = req.params;

            const closedStays = await StayRepository.getClosedStays(userId);

            if (!closedStays.length) {
                payload.code = 400;
                throw new Error('Este usuário não possui estadia fechada.');
            }

            const { paidAtTimestamp } = req.body;

            if (!paidAtTimestamp) {
                payload.success = false;
                payload.form.paidAtTimestamp.error = true
                payload.form.paidAtTimestamp.msg = 'Campo obrigatório';
            } else if (!timeStampValidator.isValidTimestamp(paidAtTimestamp)) {
                payload.success = false;
                payload.form.paidAtTimestamp.error = true
                payload.form.paidAtTimestamp.msg = 'Timestamp inválido';
            } else if (timeStampValidator.isPastDate(paidAtTimestamp)) {
                payload.success = false;
                payload.form.openedAtTimestamp.error = true;
                payload.form.openedAtTimestamp.msg = 'Timestamp não pode ser anterior à 01/01/2021';
            } else if (timeStampValidator.isFutureDate(paidAtTimestamp)) {
                payload.success = false;
                payload.form.paidAtTimestamp.error = true
                payload.form.paidAtTimestamp.msg = 'Timestamp não pode ser uma data no futuro';
            } else {
                const closedAtTimestamp = new Date(closedStays[0].closedAt).getTime()

                if (closedAtTimestamp >= paidAtTimestamp) {
                    payload.success = false;
                    payload.form.paidAtTimestamp.error = true
                    payload.form.paidAtTimestamp.msg = 'Timestamp de fechamento não pode ser menor ou igual que o timestamp de abertura';
                }
            }

            if (!payload.success) {
                payload.code = 400
                throw new Error('Verifique todos os campos')
            }

            const stay = await StayRepository.pay(userId, closedStays[0]._id, paidAtTimestamp)

            payload.msg = 'Estadia paga com sucesso';

            payload.data.stay = stay;

            res.status(payload.code).json(payload)
        } catch (error) {
            payload.msg = error.message;
            payload.success = false;
            res.status(payload.code).json(payload);
        }
    })

    router.put('/stays/:userId/confirmPayment/:stayId', middlewares.verifyUserExistsMiddleware, async (req, res) => {

        const payload = req.payload();

        try {
            const { userId, stayId } = req.params;

            const stay = await StayRepository.confirmPayment(userId, stayId)

            payload.msg = 'Pagamento confirmado com sucesso';

            payload.data.stay = stay;

            res.status(payload.code).json(payload)
        } catch (error) {
            payload.msg = error.message;
            payload.success = false;
            res.status(payload.code).json(payload);
        }
    })

    return router;
};