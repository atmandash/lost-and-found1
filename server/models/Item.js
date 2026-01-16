const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    type: { type: String, enum: ['lost', 'found'], required: true },
    title: { type: String, required: true },
    date: { type: Date, default: Date.now }, // Date when item was lost/found
    description: { type: String },
    category: { type: String, required: true },
    location: {
        main: { type: String, required: true }, // e.g., 'AB1', 'Library'
        details: { type: String } // e.g., 'Room 101'
    },
    coordinates: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0] // Default value to valid numbers
        }
    },
    images: [{ type: String }],
    status: { type: String, enum: ['active', 'claimed', 'reunited', 'closed', 'resolved'], default: 'active' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who upvoted
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who downvoted
    claimRequests: [{
        claimant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        description: { type: String, required: true },
        verificationAnswers: { type: String }, // Answers to verification questions
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        createdAt: { type: Date, default: Date.now }
    }],
    resolvedAt: { type: Date }, // For expiration
    createdAt: { type: Date, default: Date.now }
});

// Virtual field for verification score
itemSchema.virtual('verificationScore').get(function () {
    return (this.upvotes?.length || 0) - (this.downvotes?.length || 0);
});

itemSchema.index({ title: 'text', description: 'text', category: 'text' });
itemSchema.index({ 'location.main': 1 });
// TTL Index: Delete items 30 days after resolvedAt is set
itemSchema.index({ resolvedAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('Item', itemSchema);
