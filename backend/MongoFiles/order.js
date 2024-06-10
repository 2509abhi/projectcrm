const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    customerId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    date: Date
});

module.exports = mongoose.model('Order', OrderSchema);
