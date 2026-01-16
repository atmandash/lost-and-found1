const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['match', 'message', 'verification', 'claim', 'system'],
        required: true
    },
    message: { type: String, required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    matchedItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' }, // For match notifications
    relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User associated with action (e.g. claimant)
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
