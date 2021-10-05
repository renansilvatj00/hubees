const express = require('express');
const router = express.Router();
const base64 = require('base-64');
const users = require('../repositories/users');
const bcrypt = require('bcrypt');

module.exports = function (middlewares) {
    router.post('/', async function (req, res) {
        const payload = req.payload(['authorization']);

        try {

            let authorization = req.header('authorization') || '';
            authorization = authorization.replace('Basic ', '');

            if (!authorization) {
                payload.form.authorization.error = true;
                payload.form.authorization.msg = 'Campo obrigatório';
                payload.code = 400;
                throw new Error('Verifique todos os campos');
            }

            let decodedAuthorization = '';

            try {
                decodedAuthorization = base64.decode(authorization)
            } catch (error2) {
                payload.form.authorization.error = true
                payload.form.authorization.msg = 'Campo inválido';
                payload.code = 401
                throw new Error('Verifique todos os campos')
            }

            const [email, password] = decodedAuthorization.split(':')

            if (!email || !password) {
                payload.form.authorization.error = true
                payload.form.authorization.msg = 'Campo inválido';
                payload.code = 401
                throw new Error('Verifique todos os campos')
            }
            // payload.data.email = email;
            // payload.data.password = password;

            const user = await users.getOneByEmail(email);

            if (!user) {
                payload.code = 401
                throw new Error('Usuário não encontrado');
            }

            const passwordVerify = bcrypt.compareSync(password, user.password)

            if (!passwordVerify) {
                payload.code = 401
                throw new Error('Usuário não encontrado');
            }

            payload.data.user = {
                _id: user._id,
                name: user.name,
                email: user.email
            };

            res.status(payload.code).json(payload);
        } catch (error) {
            payload.msg = error.message;
            payload.success = false;
            res.status(payload.code).json(payload);
        }

    });

    return router;
};