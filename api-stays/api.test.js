require('dotenv-safe').config();

const supertest = require('supertest');
const server = require('./src/server/server');

const authMiddlewareMock = (req, res, next) => {
  next();
}

const verifyUserExistsMiddlewareMock = (req, res, next) => {
  next();
}

let app = null;
const userId = '6151b01f8a45bcf5a79a1edb';
let stayId = null;

describe('API STAYS', () => {
  beforeAll(async () => {
    app = await server.start({
      authMiddleware: authMiddlewareMock,
      verifyUserExistsMiddleware: verifyUserExistsMiddlewareMock
    });
  });

  afterAll(async () => {
    await server.stop();
  });

  test('Listar estadias de um usuário', async () => {
    const response = await supertest(app).get(`/stays/${userId}`);

    const { status, body } = response;
    const { code, success, msg, data } = body;

    expect(status).toEqual(200);
    expect(code).toEqual(200);
    expect(success).toEqual(true);
    expect(msg).toEqual('Este usuário não possui estadias.');

    expect(typeof data).toEqual('object');
    expect(data).toHaveProperty('stays');
    expect(Array.isArray(data.stays)).toEqual(true);
  });

  test('Abrir nova estadia', async () => {
    const response = await supertest(app).post(`/stays/${userId}`).send({
      openedAtTimestamp: 1633001015316
    });

    const { status, body } = response;
    const { code, success, msg, data } = body;

    expect(status).toEqual(201);
    expect(code).toEqual(201);
    expect(success).toEqual(true);
    expect(msg).toEqual('Estadia inserida com sucesso');

    expect(typeof data).toEqual('object');
    expect(data).toHaveProperty('stay');
    expect(typeof data.stay).toEqual('object');
    expect(data.stay).toHaveProperty('_id');

    stayId = data.stay._id;
  });

  test('Buscar estadia aberta', async () => {
    const response = await supertest(app).get(`/stays/${userId}/stay`);

    const { status, body } = response;
    const { code, success, msg, data } = body;

    expect(status).toEqual(200);
    expect(code).toEqual(200);
    expect(success).toEqual(true);
    expect(msg).toEqual('');

    expect(typeof data).toEqual('object');
    expect(data).toHaveProperty('stay');
    expect(typeof data.stay).toEqual('object');
    expect(data.stay).toHaveProperty('_id');
    expect(data.stay).toHaveProperty('status');
    expect(data.stay.status).toEqual('Aberto');
  });

  test('Sucesso ao fechar estadia aberta', async () => {
    const response = await supertest(app).put(`/stays/${userId}/close`).send({
      closedAtTimestamp: 1633001015317
    });

    const { status, body } = response;
    const { code, success, msg, form, data } = body;

    expect(status).toEqual(200);
    expect(code).toEqual(200);
    expect(success).toEqual(true);
    expect(msg).toEqual('Estadia fechada com sucesso');

    expect(typeof form).toEqual('object');
    expect(form).toHaveProperty('closedAtTimestamp');
    expect(form.closedAtTimestamp).toHaveProperty('error');
    expect(form.closedAtTimestamp.error).toEqual(false);
    expect(form.closedAtTimestamp.msg).toEqual("");

    expect(typeof data).toEqual('object');
    expect(data).toHaveProperty('stay');
    expect(typeof data.stay).toEqual('object');
    expect(data.stay).toHaveProperty('_id');
    expect(data.stay).toHaveProperty('status');
    expect(data.stay.status).toEqual('Fechado e não pago');
  });

  test('Buscar estadia fechada', async () => {
    const response = await supertest(app).get(`/stays/${userId}/stay`);

    const { status, body } = response;
    const { code, success, msg, data } = body;

    expect(status).toEqual(200);
    expect(code).toEqual(200);
    expect(success).toEqual(true);
    expect(msg).toEqual('');

    expect(typeof data).toEqual('object');
    expect(data).toHaveProperty('stay');
    expect(typeof data.stay).toEqual('object');
    expect(data.stay).toHaveProperty('_id');
    expect(data.stay).toHaveProperty('status');
    expect(data.stay.status).toEqual('Fechado e não pago');
  });

  test('Pagar estadia fechada', async () => {
    const response = await supertest(app).put(`/stays/${userId}/pay`).send({
      paidAtTimestamp: 1633001015318
    });

    const { status, body } = response;
    const { code, success, msg, form, data } = body;

    expect(status).toEqual(200);
    expect(code).toEqual(200);
    expect(success).toEqual(true);
    expect(msg).toEqual('Estadia paga com sucesso');

    expect(typeof form).toEqual('object');
    expect(form).toHaveProperty('paidAtTimestamp');
    expect(form.paidAtTimestamp).toHaveProperty('error');
    expect(form.paidAtTimestamp.error).toEqual(false);
    expect(form.paidAtTimestamp.msg).toEqual('');

    expect(typeof data).toEqual('object');
    expect(data).toHaveProperty('stay');
    expect(typeof data.stay).toEqual('object');
    expect(data.stay).toHaveProperty('_id');
    expect(data.stay).toHaveProperty('status');
    expect(data.stay.status).toEqual('Pago mas não confirmado');
  });

  test('Buscar estadia paga', async () => {
    const response = await supertest(app).get(`/stays/${userId}/stay`);

    const { status, body } = response;
    const { code, success, msg, data } = body;

    expect(status).toEqual(200);
    expect(code).toEqual(200);
    expect(success).toEqual(true);
    expect(msg).toEqual('');

    expect(typeof data).toEqual('object');
    expect(data).toHaveProperty('stay');
    expect(typeof data.stay).toEqual('object');
    expect(data.stay).toHaveProperty('_id');
    expect(data.stay).toHaveProperty('status');
    expect(data.stay.status).toEqual('Pago mas não confirmado');
  });

  test('Confirmar pagamento da estadia', async () => {
    const response = await supertest(app).put(`/stays/${userId}/confirmPayment/${stayId}`);

    const { status, body } = response;
    const { code, success, msg, form, data } = body;

    expect(status).toEqual(200);
    expect(code).toEqual(200);
    expect(success).toEqual(true);
    expect(msg).toEqual('Pagamento confirmado com sucesso');

    expect(typeof data).toEqual('object');
    expect(data).toHaveProperty('stay');
    expect(typeof data.stay).toEqual('object');
    expect(data.stay).toHaveProperty('_id');
    expect(data.stay).toHaveProperty('status');
    expect(data.stay.status).toEqual('Pagamento aprovado.');
  });
});
