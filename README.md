# Projeto Hubess
# Renan Silva

## Serviços desse projeto
- API de autenticação
- API de usuários
- API de estadias
- Bot de confirmação de pagamento
- RabbitMQ
- MongoDB

## Instalação

### Rabbit e MondoGB
Dentro do diretório raiz, executar o comando abaixo para subir os containers do Rabbit e MongoDB

```sh
docker-compose up -d
```

### API de autenticação

```sh
cd api-auth/
cp .env.example .env
npm ci
node index.js
```

### API de usuários

```sh
cd api-users/
cp .env.example .env
npm ci
node migration.js
node index.js
```

### API de estadias

```sh
cd api-stays/
cp .env.example .env
npm ci
node index.js
```

### Bot de confirmação de pagamento

```sh
cd queue-worker/
npm ci
node receive.js
```

## Como usar

Teremos 3 apis 1 um serviço:
- API de Autenticação (porta 3003)
- API de Usuários (porta 3001)
- API de Estadias (porta 3002)
- Bot de confirmação de pagamento (ouvindo a fila do RabbitMQ)

As apis de usuários e estadias consomem a api de autenticação.

A api de estadias também consome a api de usuários

A api de autenticação possui apenas uma rota:
- `POST /auth` - Recebe as credenciais do usuário e retorna os dados dele

A api de usuários possui as seguintes rotas:
- `GET /users` - Lista todos os usuários ativos
- `POST /users` - Adiciona um novo usuário
- `GET /users/:userId` - Busca os dados de um usuário
- `PUT /users/:userId` - Edita os dados de um usuário
- `PUT /users/:userId/active/:active` - Edita o status de um usuário
- `DELETE /users/:userId` - Remove um usuário

A api de estadias possui as seguintes rotas:
- `GET /stays/:userId` - Lista todas as estadias de um usuário
- `POST /stays/:userId` - Abre uma nova estadia para um usuário
- `GET /stays/:userId/stay` - Exibe a estadia aberta (se houver uma) do usuário
- `GET /stays/:userId/update` - Edita a data de entrada de uma estadia aberta (se houver uma) do usuário
- `PUT /stays/:userId/close` - Atualiza o status da estadia para "Fechado e não pago"
- `PUT /stays/:userId/pay` - Atualiza o status da estadia para "Pago mas não confirmado"
- `PUT /stays/:userId/confirmPayment/:stayId` - Confirma o pagamento da estadia

O Bot de confirmação de pagamento ficará ouvindo a fila de estadias com pagamento não confirmado. Sempre que chegar um item na fila, ele completa a transação e finaliza a estadia.