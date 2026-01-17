const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Debug ENV loading
    if (!process.env.JWT_SECRET) console.error('FATAL: JWT_SECRET is not defined in auth middleware!');

    // Check if not token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    try {
        // CRITICAL: Check if JWT_SECRET exists before attempting verification
        if (!process.env.JWT_SECRET) {
            console.error('CRITICAL: JWT_SECRET environment variable is not set!');
            return res.status(500).json({ message: 'Server configuration error: JWT_SECRET missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Live DB check for critical security (Revocation & Admin status)
        const user = await User.findById(decoded.user.id).select('passwordChangedAt isAdmin name email points');

        if (!user) {
            return res.status(401).json({ message: 'User no longer exists' });
        }

        // Check if password changed AFTER token was issued
        if (user.passwordChangedAt) {
            const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
            if (decoded.iat < changedTimestamp) {
                return res.status(401).json({ message: 'Password recently changed. Please login again.' });
            }
        }

        // Attach full user object for controllers (including isAdmin)
        req.user = {
            id: user._id,
            isAdmin: user.isAdmin,
            name: user.name,
            email: user.email
        };

        // Throttle lastActive updates to once per minute to reduce database load
        // This prevents lag from excessive writes while still tracking active users
        const now = Date.now();
        const oneMinute = 60 * 1000;

        // Use fire-and-forget pattern with simple updateOne for max performance
        // Only updates if lastActive is older than 1 minute or doesn't exist
        const userId = req.user.id;

        // Non-blocking background update
        User.findById(userId).select('lastActive').then(user => {
            if (user && (!user.lastActive || (now - new Date(user.lastActive).getTime()) > oneMinute)) {
                User.updateOne({ _id: userId }, { lastActive: now }).catch(() => { });
            }
        }).catch(() => { });

        // Daily login tracking and rewards
        User.findById(userId).select('lastLoginDate loginStreak').then(async user => {
            if (user) {
                const now = new Date();
                const lastLogin = user.lastLoginDate;

                // Check if this is a new day
                const isNewDay = !lastLogin ||
                    now.toDateString() !== new Date(lastLogin).toDateString();

                if (isNewDay) {
                    // Award daily login points
                    const gamificationController = require('./gamificationController');
                    await gamificationController.awardPoints(userId, 5, 'daily login');

                    // Update streak
                    const oneDayMs = 24 * 60 * 60 * 1000;
                    const daysSinceLastLogin = lastLogin ?
                        Math.floor((now - new Date(lastLogin)) / oneDayMs) : 0;

                    if (daysSinceLastLogin === 1) {
                        // Consecutive day - increment streak
                        user.loginStreak = (user.loginStreak || 0) + 1;

                        // Award bonus for 7-day streak
                        if (user.loginStreak === 7) {
                            await gamificationController.awardPoints(userId, 50, '7-day login streak');
                        }
                    } else if (daysSinceLastLogin > 1) {
                        // Streak broken
                        user.loginStreak = 1;
                    }

                    user.lastLoginDate = now;
                    await user.save();
                }
            }
        }).catch(() => { });

        next();
    } catch (err) {
        console.error('JWT Verification Error:', err.message);
        res.status(401).json({ message: 'Token is not valid', error: err.message });
    }
};
