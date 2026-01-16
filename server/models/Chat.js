const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [{
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        isPhoneShare: { type: Boolean, default: false }
    }],
    lastReadBy: {
        type: Map,
        of: Date,
        default: new Map()
    },
    phoneShared: {
        type: Map,
        of: Boolean,
        default: new Map()
    },
    resolved: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date }
}, { timestamps: true });

// Set expiration to 48 hours from creation
chatSchema.pre('save', function (next) {
    if (this.isNew && !this.expiresAt) {
        this.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
    }
    if (typeof next === 'function') {
        next();
    }
});

module.exports = mongoose.model('Chat', chatSchema);
