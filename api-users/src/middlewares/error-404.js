module.exports = function (req, res, next) {
    const payload = req.payload();
    payload.code = 404;
    payload.success = false;
    payload.msg = 'Rota não encontada';

    res.status(payload.code).json(payload);
};