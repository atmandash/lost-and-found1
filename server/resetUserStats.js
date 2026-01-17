// Database script to reset all user stats to 0
// Run with: node resetUserStats.js

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const resetAllUserStats = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Reset all users' stats to 0
        const result = await User.updateMany(
            {}, // Match all users
            {
                $set: {
                    points: 0,
                    itemsReported: 0,
                    lostItemsReported: 0,
                    foundItemsReported: 0
                }
            }
        );

        console.log(`✅ Successfully reset stats for ${result.modifiedCount} users`);
        console.log('All users now have:');
        console.log('  - points: 0');
        console.log('  - itemsReported: 0');
        console.log('  - lostItemsReported: 0');
        console.log('  - foundItemsReported: 0');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting user stats:', error);
        process.exit(1);
    }
};

resetAllUserStats();
