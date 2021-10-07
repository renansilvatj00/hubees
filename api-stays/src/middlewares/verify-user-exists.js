const gateway = require('../helpers/gateway')

module.exports = async (req, res, next) => {

  const payload = req.payload();

  const authorization = req.header('authorization')
  const { userId } = req.params
  const user = await gateway.getUser(userId, authorization)

  if (!user) {
    payload.code = 404;
    payload.error = true;
    payload.messages = 'Usuário não encontrado';
    return res.status(payload.code).json(payload);
  }

  req.user = user;

  next();
}

