const gateway = require('../helpers/gateway');

module.exports = function (req, res, next) {

    const authorization = req.header('authorization');

    gateway.auth(authorization)
        .then(function () {
            next();
        })
        .catch(function () {
            const payload = req.payload();
            payload.code = 401;
            payload.success = false;
            payload.msg = 'Acesso negado.';

            res.status(payload.code).json(payload);
        });

}