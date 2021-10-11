require('dotenv-safe').config();

const supertest = require('supertest');
const server = require('./src/server/server');

let app = null;

describe('API AUTH', () => {
  beforeAll(async () => {
    app = await server.start();
  });

  afterAll(async () => {
    await server.stop();
  });

  test('Autenticar usando credenciais erradas', async () => {
    const response = await supertest(app).post('/auth').set({
      Authorization: 'Basic aW52YWxpZF9lbWFpbDoxMjM0NTY='
    });

    const { status, body } = response;
    const { code, success, msg, data } = body;

    expect(status).toEqual(401);
    expect(code).toEqual(401);
    expect(success).toEqual(false);
    expect(msg).toEqual('Usuário não encontrado');

    expect(typeof data).toEqual('object');
  });

  test('Autenticar usando credenciais corretas', async () => {
    const response = await supertest(app).post('/auth').set({
      Authorization: 'Basic dXN1YXJpbzFAaHViZWVzLmNvbToxMjM0NTY='
    });

    const { status, body } = response;
    const { code, success, msg, data } = body;

    expect(status).toEqual(200);
    expect(code).toEqual(200);
    expect(success).toEqual(true);
    expect(msg).toEqual('');

    expect(typeof data).toEqual('object');
    expect(data).toHaveProperty('user');
  });
});
