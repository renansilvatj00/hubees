const UserRepository = require('../repositories/users');

module.exports = async (req, res, next) => {

  const payload = req.payload();

  const { userId } = req.params;
  const user = await UserRepository.getOne(userId);

  if (!user) {
    payload.code = 404;
    payload.success = false;
    payload.msg = 'Usuário não encontrado';
    return res.status(payload.code).json(payload);
  }

  req.user = user;

  next();
}
