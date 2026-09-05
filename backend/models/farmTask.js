const mongoose = require('mongoose');

const farmTaskSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: ['irrigation', 'harvest', 'logistics', 'pest'], default: 'irrigation' },
    date: { type: String, required: true },
    note: { type: String, default: '' },
    done: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('FarmTask', farmTaskSchema);
