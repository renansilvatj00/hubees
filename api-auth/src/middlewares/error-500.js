module.exports = function (error, req, res, next) {
    const payload = req.payload();
    payload.code = 500;
    payload.success = false;
    payload.msg = `Erro interno: ${error.message}`;

    res.status(payload.code).json(payload);
};