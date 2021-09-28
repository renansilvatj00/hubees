module.exports = function (req, res, next) {
    req.payload = function () {
        return {
            success: true,
            code: 200,
            msg: '',
            data: {}
        };
    };

    next();
}