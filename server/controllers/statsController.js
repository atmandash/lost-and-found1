const Item = require('../models/Item');
const User = require('../models/User');
const Chat = require('../models/Chat');

// Get global statistics
exports.getGlobalStats = async (req, res) => {
    try {
        // Count all items
        const totalReports = await Item.countDocuments();

        // Count by type
        const lostItems = await Item.countDocuments({ type: 'lost' });
        const foundItems = await Item.countDocuments({ type: 'found' });

        // Count items returned (claimed status)
        const itemsReturned = await Item.countDocuments({ status: 'claimed' });

        // Count active users (active within last 15 minutes)
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        const activeUsers = await User.countDocuments({
            lastActive: { $gte: fifteenMinutesAgo }
        });

        res.json({
            totalReports,
            lostItems,
            foundItems,
            itemsReturned,
            activeUsers
        });
    } catch (err) {
        console.error('Error fetching global stats:', err.message);
        res.status(500).send('Server Error');
    }
};

// Get admin dashboard statistics
exports.getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalItems = await Item.countDocuments();
        const activeItems = await Item.countDocuments({ status: 'active' });
        const resolvedItems = await Item.countDocuments({ status: 'resolved' });
        const claimedItems = await Item.countDocuments({ status: 'claimed' });
        const totalChats = await Chat.countDocuments();

        // Success rate = (resolved + claimed) / total * 100
        const successRate = totalItems > 0
            ? Math.round(((resolvedItems + claimedItems) / totalItems) * 100)
            : 0;

        res.json({
            totalUsers,
            totalItems,
            activeItems,
            resolvedItems,
            totalChats,
            successRate
        });
    } catch (err) {
        console.error('Error fetching admin stats:', err.message);
        res.status(500).send('Server Error');
    }
};
