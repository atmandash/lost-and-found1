const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const resetStats = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const result = await User.updateMany({}, {
            $set: {
                itemsReported: 0,
                badges: []
            }
        });

        console.log(`Successfully reset stats for ${result.modifiedCount} users.`);
        process.exit(0);
    } catch (error) {
        console.error('Error resetting stats:', error);
        process.exit(1);
    }
};

resetStats();
