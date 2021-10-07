(async function () {
    console.clear();

    // necessário para ler o .env
    require('dotenv-safe').config();

    const server = require('./src/server/server');
    const verifyUserExistsMiddleware = require('./src/middlewares/verify-user-exists');
    const authMiddleware = require('./src/middlewares/auth');

    try {
        await server.start({
            verifyUserExistsMiddleware,
            authMiddleware
        })
        console.log(`Servidor rodando na porta ${process.env.PORT}`);
    } catch (error) {
        console.error(error)
    }

})()