const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    keywords: [{ type: String, required: true }], // e.g. ['iphone', 'keys']
    category: { type: String }, // Optional filter
    isActive: { type: Boolean, default: true },
    notificationsSent: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

// Index for checking alerts quickly
watchlistSchema.index({ keywords: 1 });

module.exports = mongoose.model('Watchlist', watchlistSchema);
