const Item = require('../models/Item');
const User = require('../models/User');

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
