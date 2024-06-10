const amqp = require('amqplib/callback_api');
const Order = require('../MongoFiles/order');
const mongoose = require('mongoose');
require('dotenv').config();
const BROKER_URL = process.env.RABBITMQ;
// const MONGODB_URL = 'mongodb://127.0.0.1:27017/crm';

// mongoose.connect(MONGODB_URL);

amqp.connect(BROKER_URL, (error, connection) => {
    if (error) {
        throw error;
    }
    connection.createChannel((error, channel) => {
        if (error) {
            throw error;
        }
        const queue = 'orderQueue';
        channel.assertQueue(queue, { durable: false });
        console.log(`Waiting for messages in ${queue}`);
        channel.consume(queue, async (msg) => {
            console.log("Received:", msg.content.toString());
            const orderData = JSON.parse(msg.content.toString());
            const order = new Order(orderData);
            try {
                await order.save();
                console.log("Order saved");
            } catch (error) {
                console.error("Error saving order:", error);
            }
        }, { noAck: true });
    });
});
