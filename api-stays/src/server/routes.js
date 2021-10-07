const express = require('express');
const router = express.Router();
const StayRepository = require('../repositories/stays');
const timeStampValidator = require('../helpers/timestamp-validator');

module.exports = function (middlewares) {

    router.use(middlewares.authMiddleware);

    router.get('/stays/:userId', async (req, res) => {

        const payload = req.payload();
        try {
            const { userId } = req.params;
            const stays = await StayRepository.getAll(userId);
            payload.data.stays = stays;

            if (!stays.length) {
                payload.code = 200;
                throw new Error('Este usuário não possui estadias.');
            }

            res.status(payload.code).json(payload);
        } catch (error) {
            payload.message = error.message;
            payload.success = false;
            res.status(payload.code).json(payload);
        }
    })

    router.post('/stays/:userId', async (req, res) => {

        const payload = req.payload(['openedAtTimestamp']);

        try {
            const { userId } = req.params;
            const { openedAtTimestamp } = req.body;

            if (!openedAtTimestamp) {
                payload.error = true;
                payload.form.openedAtTimestamp.error = true;
                payload.form.openedAtTimestamp.messages = 'Campo obrigatório';
            } else if (!timeStampValidator.isValidTimestamp(openedAtTimestamp)) {
                payload.error = true;
                payload.form.openedAtTimestamp.error = true;
                payload.form.openedAtTimestamp.messages = 'Timestamp inválido';
            } else if (timeStampValidator.isfutureDate(openedAtTimestamp)) {
                payload.error = true
                payload.form.openedAtTimestamp.error = true;
                payload.form.openedAtTimestamp.messages = 'Timestamp não pode ser uma data no futuro';
            }

            if (payload.error) {
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
            payload.messages = 'Estadia inserida com sucesso';

            res.status(payload.code).json(payload);
        } catch (error) {
            payload.message = error.message;
            payload.success = false;
            res.status(payload.code).json(payload);
        }
    })

    router.get('/stays/:userId/situationStays', async (req, res) => {

        const payload = req.payload();

        try {
            const { userId } = req.params;
            const openedStays = await StayRepository.getOpenedStays(userId);
            const closedStays = await StayRepository.getClosedStays(userId);
            const paidStays = await StayRepository.getPaidStays(userId);

            let stay = null;

            if (openedStays.length) {
                stay = openedStays[0];
                stay.status = 'Aberto';
            }

            if (closedStays.length) {
                stay = closedStays[0];
                stay.status = 'Fechado e não pago';
            }

            if (paidStays.length) {
                stay = paidStays[0];
                stay.status = 'Pago mas não confirmado';
            }

            if (!stay) {
                payload.code = 404;
                throw new Error('Nenhuma estadia encontrada');
            }

            payload.data.stay = stay;
            res.status(payload.code).json(payload);
        } catch (error) {
            payload.message = error.message;
            payload.success = false;
            res.status(payload.code).json(payload);
        }
    })

    router.put('/stays/:userId/close', async (req, res) => {

        const payload = req.payload(['closedAtTimestamp']);

        try {
            const { userId } = req.params;

            const openedStays = await StayRepository.getOpenedStays(userId);

            if (!openedStays.length) {
                payload.code = 400;
                throw new Error('Este usuário não tem estadia aberta');
            }

            const { closedAtTimestamp } = req.body;

            if (!closedAtTimestamp) {
                payload.error = true;
                payload.form.closedAtTimestamp.error = true;
                payload.form.closedAtTimestamp.messages = 'Campo obrigatório';
            } else if (!timeStampValidator.isValidTimestamp(closedAtTimestamp)) {
                payload.error = true
                payload.form.closedAtTimestamp.error = true;
                payload.form.closedAtTimestamp.messages = 'Timestamp inválido';
            } else if (timeStampValidator.isfutureDate(closedAtTimestamp)) {
                payload.error = true;
                payload.form.closedAtTimestamp.error = true;
                payload.form.closedAtTimestamp.messages = 'Timestamp não pode ser uma data no futuro';
            } else {
                const openedAtTimestamp = new Date(openedStays[0].openedAt).getTime();

                if (openedAtTimestamp >= closedAtTimestamp) {
                    payload.error = true;
                    payload.form.closedAtTimestamp.error = true;
                    payload.form.closedAtTimestamp.messages = 'Timestamp de fechamento não pode ser menor ou igual que o timestamp de abertura';
                }
            }

            if (payload.error) {
                payload.code = 400;
                throw new Error('Verifique todos os campos');
            }

            const stay = await StayRepository.close(userId, openedStays[0]._id, closedAtTimestamp);

            payload.messages = 'Estadia fechada com sucesso';

            payload.data.stay = stay;

            res.status(payload.code).json(payload);
        } catch (error) {
            payload.message = error.message;
            payload.success = false;
            res.status(payload.code).json(payload);
        }
    })

    router.put('/stays/:userId/update', async (req, res) => {

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
                payload.error = true;
                payload.form.newEntryTime.error = true;
                payload.form.newEntryTime.messages = 'Campo obrigatório';
            } else if (!timeStampValidator.isValidTimestamp(newEntryTime)) {
                payload.error = true
                payload.form.newEntryTime.error = true;
                payload.form.newEntryTime.messages = 'Timestamp inválido';
            }


            if (payload.error) {
                payload.code = 400;
                throw new Error('Verifique todos os campos');
            }

            const stay = await StayRepository.update(userId, openedStays[0]._id, newEntryTime);

            payload.messages = 'Estadia atualizada com sucesso';

            payload.data.stay = stay;

            res.status(payload.code).json(payload);
        } catch (error) {
            payload.message = error.message;
            payload.success = false;
            res.status(payload.code).json(payload);
        }
    })

    router.put('/stays/:userId/pay', async (req, res) => {

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
                payload.error = true
                payload.form.paidAtTimestamp.error = true
                payload.form.paidAtTimestamp.messages = 'Campo obrigatório';
            } else if (!timeStampValidator.isValidTimestamp(paidAtTimestamp)) {
                payload.error = true
                payload.form.paidAtTimestamp.error = true
                payload.form.paidAtTimestamp.messages = 'Timestamp inválido';
            } else if (timeStampValidator.isfutureDate(paidAtTimestamp)) {
                payload.error = true
                payload.form.paidAtTimestamp.error = true
                payload.form.paidAtTimestamp.messages = 'Timestamp não pode ser uma data no futuro';
            } else {
                const closedAtTimestamp = new Date(closedStays[0].closedAt).getTime()

                if (closedAtTimestamp >= paidAtTimestamp) {
                    payload.error = true
                    payload.form.paidAtTimestamp.error = true
                    payload.form.paidAtTimestamp.messages = 'Timestamp de fechamento não pode ser menor ou igual que o timestamp de abertura';
                }
            }

            if (payload.error) {
                payload.code = 400
                throw new Error('Verifique todos os campos')
            }

            const stay = await StayRepository.pay(userId, closedStays[0]._id, paidAtTimestamp)

            payload.messages = 'Estadia paga com sucesso';

            payload.data.stay = stay;

            res.status(payload.code).json(payload)
        } catch (error) {
            payload.message = error.message;
            payload.success = false;
            res.status(payload.code).json(payload);
        }
    })

    return router;
};