console.clear();

require('dotenv-safe').config();
const axios = require('axios');

const opt = { credentials: require('amqplib').credentials.plain('rabbitmq', 'rabbitmq') };

const amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', opt, function (error0, connection) {
  if (error0) {
    throw error0;
  }

  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = 'stay-pay';

    channel.assertQueue(queue, {
      durable: false
    });

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    channel.consume(queue, async function (msg) {
      const content = msg.content.toString();
      const jsonContent = JSON.parse(content);
      const { userId, stayId } = jsonContent;
      console.log(" [x] Received %s", jsonContent);

      try {
        await axios.put(`${process.env.STAYS_API_HOST}stays/${userId}/confirmPayment/${stayId}/`, {}, {
          headers: {
            Authorization: 'Basic YUBhOjEyMzQ1Ng=='
          }
        })
      } catch (error) {
        console.log(error.message)
      }




    }, {
      noAck: true
    });

    // setTimeout(function () {
    //   connection.close();
    //   process.exit(0)
    // }, 500);
  });
});