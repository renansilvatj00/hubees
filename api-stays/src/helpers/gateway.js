const axios = require('axios')
const amqp = require('amqplib/callback_api')

function auth(authorization) {
  return new Promise(function (resolve, reject) {
    axios.post(`${process.env.AUTH_API_HOST}auth`, {}, {
      headers: {
        Authorization: authorization
      }
    })
      .then(function (response) {
        resolve(response.data.data.user);
      })
      .catch(function (error) {
        reject(null)
      })
  })
}
function getUser(userId, authorization) {
  console.log('authorization', authorization)
  return new Promise(function (resolve, reject) {
    axios.get(`${process.env.USERS_API_HOST}users/${userId}`, {}, {
      headers: {
        Authorization: authorization
      }
    })
      .then(function (response) {
        console.log(response)
        resolve(response.data.data.user);
      })
      .catch(function (error) {
        console.log('error', error.response)
        reject(null)
      })
  })
}
async function addQueue(queue, message) {
  return new Promise((resolve, reject) => {
    const opt = { credentials: require('amqplib').credentials.plain('rabbitmq', 'rabbitmq') }

    amqp.connect('amqp://localhost', opt, function (error0, connection) {
      if (error0) {
        reject(error0)
      }

      connection.createChannel(function (error1, channel) {
        if (error1) {
          reject(error1)
        }

        const msg = JSON.stringify(message)

        channel.assertQueue(queue, {
          durable: false
        })

        channel.sendToQueue(queue, Buffer.from(msg))

        setTimeout(function () {
          connection.close()
          resolve()
        }, 500)
      })
    })
  })
}

module.exports = {
  auth,
  getUser,
  addQueue
}
