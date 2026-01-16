const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const resetGamification = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Reset fields
        const result = await User.updateMany({}, {
            $set: {
                points: 0,
                streak: 0,
                level: 1,
                itemsReported: 0,
                itemsReturned: 0,
                helpfulVotes: 0,
                badges: []
            }
        });

        console.log(`Successfully reset gamification data for ${result.modifiedCount} users.`);
        process.exit(0);
    } catch (err) {
        console.error('Error resetting data:', err);
        process.exit(1);
    }
};

resetGamification();
