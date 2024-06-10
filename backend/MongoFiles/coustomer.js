const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    name: String,
    email: String,
    totalSpends: Number,
    visits: Number,
    lastVisit: Date
});

const Customer = mongoose.model('customer', CustomerSchema);

module.exports = Customer;
