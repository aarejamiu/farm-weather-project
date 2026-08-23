const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    category: {
        type: String,
        default: 'General'
    },
    unit: {
        type: String,
        default: 'unit'
    },
    image: {
        type: String,
        default: ''
    },
    available: {
        type: Boolean,
        default: true
    },
    lowStockThreshold: {
        type: Number,
        default: 5
    }
}, { timestamps: true });

productSchema.virtual('isLowStock').get(function () {
    return this.quantity <= this.lowStockThreshold;
});

productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);