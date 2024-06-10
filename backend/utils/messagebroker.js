const amqp = require('amqplib/callback_api');
require('dotenv').config();
const BROKER_URL = process.env.RABBITMQ;
// const BROKER_URL = 'amqp://localhost';

const publishMessage = (queue, message) => {
    amqp.connect(BROKER_URL, (error, connection) => {
        if (error) {
            throw error;
        }
        connection.createChannel((error, channel) => {
            if (error) {
                throw error;
            }
            channel.assertQueue(queue, { durable: false });
            channel.sendToQueue(queue, Buffer.from(message));
            console.log("Sent:", message);
        });
        setTimeout(() => {
            connection.close();
        }, 500);
    });
};

module.exports = { publishMessage };
