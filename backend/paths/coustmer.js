const express = require('express');
const router = express.Router();
const Customer = require('../MongoFiles/coustomer');
const { publishMessage } = require('../utils/messagebroker');

// Add a new customer
router.post('/', (req, res) => {
    // Publish message to queue
    publishMessage('customerQueue', JSON.stringify(req.body));
    res.status(202).send({ status: 'Accepted' });
});

module.exports = router;
