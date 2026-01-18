// Database script to reset all user stats to 0
// Run with: node resetUserStats.js

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const resetAllUserStats = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Reset all users' stats to default values
        const result = await User.updateMany(
            {}, // Match all users
            {
                $set: {
                    points: 0,
                    level: 1,
                    badges: [],
                    itemsReported: 0,
                    itemsReturned: 0,
                    lostItemsReported: 0,
                    foundItemsReported: 0,
                    streak: 0,
                    helpfulVotes: 0
                }
            }
        );

        console.log(`✅ Successfully reset stats for ${result.modifiedCount} users`);
        console.log('All users now have:');
        console.log('  - points: 0');
        console.log('  - level: 1');
        console.log('  - badges: []');
        console.log('  - itemsReported: 0');
        console.log('  - itemsReturned: 0');
        console.log('  - streak: 0');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting user stats:', error);
        process.exit(1);
    }
};

resetAllUserStats();
