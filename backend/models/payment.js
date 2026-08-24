const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        productId: mongoose.Schema.Types.ObjectId,
        quantity: Number
    }],
    amount: {
        type: Number,
        required: true
    },
    deliveryAddress: {
        type: String,
        default: ''
    },
    reference: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['initialized', 'paid', 'failed'],
        default: 'initialized'
    }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);