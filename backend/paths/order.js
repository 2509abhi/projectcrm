const express = require('express');
const router = express.Router();
const Order = require('../MongoFiles/order');
const { publishMessage } = require('../utils/messagebroker');

// Add a new order
router.post('/', (req, res) => {
    // Publish message to queue
    publishMessage('orderQueue', JSON.stringify(req.body));
    res.status(202).send({ status: 'Accepted' });
});

module.exports = router;
