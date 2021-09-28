(async function () {
    console.clear();

    // necessário para ler o .env
    require('dotenv-safe').config();

    const server = require('./src/server/server');

    await server.start();

    console.log(`Servidor rodando na porta ${process.env.PORT}`);
})()