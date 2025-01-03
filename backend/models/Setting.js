const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: mongoose.Schema.Types.Mixed,
    description: String,
    category: {
        type: String,
        enum: ['threshold', 'notification', 'report', 'system'],
        default: 'system'
    }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
