const mongoose = require('mongoose');
require('dotenv').config();

const dropIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const collection = mongoose.connection.collection('items');
        if (collection) {
            console.log('Dropping indexes on items collection...');
            await collection.dropIndexes();
            console.log('Indexes dropped successfully');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

dropIndexes();
