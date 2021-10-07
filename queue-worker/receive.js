console.clear()

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
    channel.consume(queue, function (msg) {
      const content = msg.content.toString();
      const jsonContent = JSON.parse(content);
      console.log(" [x] Received %s", jsonContent);
    }, {
      noAck: true
    });

    // setTimeout(function () {
    //   connection.close();
    //   process.exit(0)
    // }, 500);
  });
});