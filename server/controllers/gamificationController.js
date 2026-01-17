const User = require('../models/User');
const Item = require('../models/Item');

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const leaderboard = await User.find({ isHiddenFromLeaderboard: { $ne: true } })
            .select('name points badges level itemsReported itemsReturned')
            .sort({ points: -1 })
            .limit(limit);

        res.json(leaderboard);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get user stats
exports.getUserStats = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.id;

        const user = await User.findById(userId)
            .select('name points badges level itemsReported itemsReturned helpfulVotes');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get additional stats
        const totalItems = await Item.countDocuments({ user: userId });
        const activeItems = await Item.countDocuments({ user: userId, status: 'active' });
        const resolvedItems = await Item.countDocuments({ user: userId, status: { $in: ['claimed', 'reunited'] } });

        res.json({
            ...user.toObject(),
            totalItems,
            activeItems,
            resolvedItems
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Award badge (internal function, can be called from other controllers)
exports.awardBadge = async (userId, badgeName) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        if (!user.badges.includes(badgeName)) {
            user.badges.push(badgeName);
            await user.save();
        }
    } catch (err) {
        console.error('Error awarding badge:', err.message);
    }
};

// Award points (internal function)
exports.awardPoints = async (userId, points, reason) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        user.points += points;

        // Update level based on points
        user.level = Math.floor(user.points / 100) + 1;

        // Award badges based on milestones
        // DISABLED per user request (Jan 2026) - Keeping points/level live but no badges
        /*
        if (user.points >= 100 && !user.badges.includes('First 100')) {
            user.badges.push('First 100');
        }
        if (user.points >= 500 && !user.badges.includes('Rising Star')) {
            user.badges.push('Rising Star');
        }
        if (user.points >= 1000 && !user.badges.includes('Community Hero')) {
            user.badges.push('Community Hero');
        }
        */

        await user.save();
        console.log(`Awarded ${points} points to user ${userId} for ${reason}`);
    } catch (err) {
        console.error('Error awarding points:', err.message);
    }
};

module.exports = exports;
