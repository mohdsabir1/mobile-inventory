const mongoose = require('mongoose');

const mobileModelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MobileCategory',
        required: true
    },
    description: String,
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Compound index to ensure unique model names within a category
mobileModelSchema.index({ name: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('MobileModel', mobileModelSchema);
