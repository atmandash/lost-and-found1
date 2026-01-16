const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    verifiers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Verification', verificationSchema);
