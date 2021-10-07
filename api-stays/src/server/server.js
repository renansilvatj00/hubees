const express = require('express');

let server = null;

function start(middlewares = {}) {

    const app = express();

    // Usando Middlewares
    app.use(express.json());
    app.use(express.urlencoded({
        extended: false
    }));

    // Middleware para padronizar o payload
    app.use(require('../middlewares/payload'));

    // Rotas
    app.use(require('./routes')(middlewares));

    // Erro 404
    app.use(require('../middlewares/error-404'));

    // Erro 500
    app.use(require('../middlewares/error-500'));

    // Abrindo conexão com o Servidor
    server = app.listen(process.env.PORT);

    return server;

}

function stop() {

    if (server) {
        server.close();
    }

    server = null;
}

module.exports = {
    start,
    stop
};