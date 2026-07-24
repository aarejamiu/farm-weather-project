const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: String,
    price: Number,
    quantity: Number
});

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'ready_for_pickup', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid'],
        default: 'unpaid'
    },
    paymentRef: {
        type: String,
        default: ''
    },
    deliveryAddress: {
        type: String,
        default: ''
    },
    note: {
        type: String,
        default: ''
    },
    receiptId: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);