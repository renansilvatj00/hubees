const express = require('express');
const router = express.Router();
const userRepo = require('../repositories/users');
const emailValidator = require('../helpers/email-validator');


module.exports = function (middlewares) {

    router.use(middlewares.authMiddleware);

    router.get('/users', async function (req, res) {
        const payload = req.payload();

        try {

            const { active } = req.query;

            const users = await userRepo.getAll({
                active
            });

            payload.data.users = users;

            res.status(payload.code).json(payload);
        } catch (error) {
            payload.message = error.message;
            payload.success = false;
            res.status(payload.code).json(payload);
        }

    });

    router.post('/user', async function (req, res) {
        const payload = req.payload(['name', 'email', 'password']);

        try {

            const { name, email, password } = req.body;

            if (!name) {
                payload.error = true;
                payload.form.name.error = true;
                payload.form.name.messages = 'Campo obrigatório';
            } else if (name.length < 3 || name.length > 255) {
                payload.error = true;
                payload.form.name.error = true;
                payload.form.name.messages = 'O nome precisa ter de 3 a 255 caracteres';
            }

            if (!email) {
                payload.error = true;
                payload.form.email.error = true;
                payload.form.email.messages = 'Campo obrigatório';
            } else if (!emailValidator.isEmailValid(email)) {
                payload.error = true;
                payload.form.email.error = true;
                payload.form.email.messages = 'E-mail inválido';
            } else {
                const existedUser = await userRepo.getOneByEmail(email);
                if (existedUser) {
                    payload.error = true;
                    payload.form.email.error = true;
                    payload.form.email.messages = 'Já existe um usuário com este e-mail';
                }
            }

            if (!password) {
                payload.error = true;
                payload.form.password.error = true;
                payload.form.password.messages = 'Campo obrigatório';
            } else if (password.length < 6 || password.length > 12) {
                payload.error = true;
                payload.form.password.error = true;
                payload.form.password.messages = 'A senha precisa ter de 6 a 12 caracteres';
            }

            if (payload.error) {
                payload.code = 400;
                throw new Error('Verifique todos os campos');
            }

            const user = await userRepo.create({ name, email, password });

            payload.code = 201;
            payload.data.user = user;
            payload.messages = 'Usuário inserido com sucesso';

            res.status(payload.code).json(payload);
        } catch (error) {
            payload.message = error.message;
            payload.success = false;
            res.status(payload.code).json(payload);
        }

    });

    router.get('/users/:userId', middlewares.verifyUserExistsMiddleware, async (req, res) => {
        const payload = req.payload(['user']);

        try {
            payload.data.user = req.user;
            res.status(payload.code).json(payload);
        } catch (error) {
            payload.message = error.message;
            payload.success = false;
            res.status(payload.code).json(payload);
        }
    })

    router.put('/users/:userId', middlewares.verifyUserExistsMiddleware, async (req, res) => {
        const payload = req.payload(['user']);

        try {
            const { userId } = req.params;
            const { name } = req.body;

            if (!name) {
                payload.error = true;
                payload.form.name.error = true;
                payload.form.name.messages = 'Campo obrigatório';
            } else if (name.length < 3 || name.length > 255) {
                payload.error = true;
                payload.form.name.error = true;
                payload.form.name.messages = 'O nome precisa ter de 3 a 255 caracteres';
            }

            if (payload.error) {
                payload.code = 400;
                throw new Error('Verifique todos os campos');
            }

            const user = await userRepo.update(userId, {
                name
            })

            payload.data.user = user;
            payload.messages = 'Usuário editado com sucesso';

            res.status(payload.code).json(payload);
        } catch (error) {
            payload.message = error.message;
            payload.success = false;
            res.status(payload.code).json(payload);
        }
    })

    router.put('/users/:userId/active/:active', async (req, res) => {
        const payload = req.payload(['user']);

        try {
            const { userId } = req.params;

            const active = Number(req.params.active);

            let user = await userRepo.getOne(userId, {
                active: active ? 0 : 1
            })

            if (!user) {
                payload.code = 404;
                throw new Error('Usuário não encontrado');
            }

            if (typeof active === 'undefined') {
                payload.error = true;
                payload.form.active.error = true;
                payload.form.active.messages = 'Campo obrigatório';
            } else if (active !== 0 && active !== 1) {
                payload.error = true;
                payload.form.active.error = true;
                payload.form.active.messages = 'Este campo precisa ser "0" ou "1"';
            }

            if (payload.error) {
                payload.code = 400;
                throw new Error('Verifique todos os campos');
            }

            user = await userRepo.update(userId, {
                active
            })

            payload.data.user = user;
            payload.messages = 'Usuário editado com sucesso';

            res.status(payload.code).json(payload);
        } catch (error) {
            payload.message = error.message;
            payload.success = false;
            res.status(payload.code).json(payload);
        }
    })

    router.delete('/users/:userId', middlewares.verifyUserExistsMiddleware, async (req, res) => {
        const payload = req.payload();
        try {
            const { userId } = req.params;

            await userRepo.deleteUser(userId);

            payload.code = 204;
            
            res.status(payload.code).json(payload);

        } catch (error) {
            payload.message = error.message;
            payload.success = false;
            res.status(payload.code).json(payload);
        }
    })

    return router;
};