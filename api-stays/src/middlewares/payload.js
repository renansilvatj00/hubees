module.exports = function (req, res, next) {
    req.payload = function (fields = []) {
        let pL = {
            success: true,
            code: 200,
            msg: '',
            data: {}
        };

        if (fields.length) {
            pL.form = {}

            for (field of fields) {
                pL.form[field] = {
                    error: false,
                    msg: ''
                }
            }

        }
        return pL;
    };

    next();
}