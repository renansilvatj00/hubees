require('dotenv-safe').config();

const supertest = require('supertest');
const server = require('./src/server/server');

const authMiddlewareMock = (req, res, next) => {
  next();
}

const verifyUserExistsMiddleware = require('./src/middlewares/verify-user-exists');

let app = null;
let userId = null

describe('API USERS', () => {
  beforeAll(async () => {
    app = await server.start({
      authMiddleware: authMiddlewareMock,
      verifyUserExistsMiddleware,
    });
  });

  afterAll(async () => {
    await server.stop();
  });

  test('Listar todos os usuários', async () => {
    const response = await supertest(app).get('/users');

    const { status, body } = response;
    const { code, success, msg, data } = body;

    expect(status).toEqual(200);
    expect(code).toEqual(200);
    expect(success).toEqual(true);
    expect(msg).toEqual("");

    expect(typeof data).toEqual('object');
    expect(data).toHaveProperty('users');
    expect(Array.isArray(data.users)).toEqual(true);
  });

  test('Inserir usuário', async () => {
    const response = await supertest(app).post('/users').send({
      name: 'Usuário 1',
      email: 'usuario1@email.com',
      password: 'abc123',
    });

    const { status, body } = response;
    const { code, success, msg, data } = body;

    expect(status).toEqual(201);
    expect(code).toEqual(201);
    expect(success).toEqual(true);
    expect(msg).toEqual('Usuário inserido com sucesso');

    expect(typeof data).toEqual('object');
    expect(data).toHaveProperty('user');
    expect(typeof data.user).toEqual('object');

    expect(data.user).toHaveProperty('_id');

    expect(data.user).toHaveProperty('name');
    expect(data.user.name).toEqual('Usuário 1');

    expect(data.user).toHaveProperty('email');
    expect(data.user.email).toEqual('usuario1@email.com');

    userId = data.user._id;
  });

  test('Buscar usuário criado', async () => {
    const response = await supertest(app).get(`/users/${userId}`);

    const { status, body } = response;
    const { code, success, msg, data } = body;

    expect(status).toEqual(200);
    expect(code).toEqual(200);
    expect(success).toEqual(true);
    expect(msg).toEqual("");

    expect(typeof data).toEqual('object');
    expect(data).toHaveProperty('user');
    expect(typeof data.user).toEqual('object');
    expect(data.user).toHaveProperty('_id');
  });

  test('Editar usuário', async () => {
    const response = await supertest(app).put(`/users/${userId}`).send({
      name: 'Usuário 1.1',
    });

    const { status, body } = response;
    const { code, success, msg, data } = body;

    expect(status).toEqual(200);
    expect(code).toEqual(200);
    expect(success).toEqual(true);
    expect(msg).toEqual('Usuário editado com sucesso');

    expect(typeof data).toEqual('object');
    expect(data).toHaveProperty('user');
    expect(typeof data.user).toEqual('object');

    expect(data.user).toHaveProperty('_id');

    expect(data.user).toHaveProperty('name');
    expect(data.user.name).toEqual('Usuário 1.1');
  });

  test('Deletar usuário', async () => {
    const response = await supertest(app).delete(`/users/${userId}/`);

    const { status } = response;

    expect(status).toEqual(204);
  });
});
