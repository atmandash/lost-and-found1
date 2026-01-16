const mongoose = require('mongoose');
const { queryLimiterPlugin } = require('../middleware/dbSecurity');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verifiedPhone: { type: Boolean, default: false },
    points: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    badges: [{ type: String }],
    level: { type: Number, default: 1 },
    itemsReported: { type: Number, default: 0 },
    itemsReturned: { type: Number, default: 0 },
    helpfulVotes: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    lastLoginDate: { type: Date },
    loginStreak: { type: Number, default: 0 },
    loginAttempts: { type: Number, default: 0 },
    lockoutUntil: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

// Apply query security plugin
userSchema.plugin(queryLimiterPlugin);

// Indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ points: -1 }); // For leaderboard

module.exports = mongoose.model('User', userSchema);
