const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load env vars
dotenv.config();

const resetStats = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        console.log('Resetting stats for all users...');

        const result = await User.updateMany({}, {
            $set: {
                points: 0,
                streak: 0,
                badges: [],
                level: 1,
                itemsReported: 0,
                itemsReturned: 0,

                loginStreak: 0
            }
        });

        console.log(`✅ Success! Stats reset for ${result.matchedCount} users.`);
        console.log(`Modified: ${result.modifiedCount}`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error resetting stats:', err);
        process.exit(1);
    }
};

resetStats();
