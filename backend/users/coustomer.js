const amqp = require('amqplib/callback_api');
const Customer = require('../MongoFiles/coustomer');
const mongoose = require('mongoose');
require('dotenv').config();
const BROKER_URL = 'amqp://localhost';
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
        const queue = 'customerQueue';
        channel.assertQueue(queue, { durable: false });
        console.log(`Waiting for messages in ${queue}`);
        channel.consume(queue, async (msg) => {
            console.log("Received:", msg.content.toString());
            const customerData = JSON.parse(msg.content.toString());
            const customer = new Customer(customerData);
            try {
                await customer.save();
                console.log("Customer saved");
            } catch (error) {
                console.error("Error saving customer:", error);
            }
        }, { noAck: true });
    });
});
