import amqp from "amqplib";

export async function sendMessage(msg) {
  amqp.connect(process.env.CLOUDAMQP_URL).then((connection) => {
    connection.createChannel().then((channel) => {
      channel.assertQueue(process.env.QUEUE_NAME, {
        durable: false,
      });
      channel.sendToQueue(process.env.QUEUE_NAME, Buffer.from(msg));
      console.log(" [x] Sent %s", msg);
    });
    setTimeout(function () {
      connection.close();
    }, 500);
  });
}

export async function receiveMessage(callback) {
  return amqp.connect(process.env.CLOUDAMQP_URL).then((connection) =>
    connection.createChannel().then((channel) => {
      channel.assertQueue(process.env.QUEUE_NAME, {
        durable: false,
      });
      channel.prefetch(1);
      console.log(
        " [*] Waiting for messages in %s. To exit press CTRL+C",
        process.env.QUEUE_NAME
      );

      channel.consume(
        process.env.QUEUE_NAME,
        async (message) => {
          await callback(message);
          channel.ack(message);
        },
        {
          noAck: false,
        }
      );
    })
  );
}
