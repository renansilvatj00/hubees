const express = require('express');
const router = express.Router();

module.exports = function (middlewares) {
    router.get('/', function (req, res) {
        const payload = req.payload();
        res.json(payload);
    });
    
    return router;
};