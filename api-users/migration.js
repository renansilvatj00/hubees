(async function () {
  console.log('- Início da migration.');
  require('dotenv-safe').config();

  const userRepo = require('./src/repositories/users');

  console.log('- Inserindo primeiro usuário para login');
  const user = await userRepo.create({
    name: 'Usuário 1',
    email: 'usuario1@hubees.com',
    password: '123456'
  });
  console.log('user', user);

  console.log('- Fim da migration.');

})();