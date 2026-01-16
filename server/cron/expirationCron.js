const cron = require('node-cron');
const Item = require('../models/Item');

const initExpirationCron = () => {
    // Run every day at midnight: '0 0 * * *'
    cron.schedule('0 0 * * *', async () => {
        console.log('Running Expiration Cron Job...');
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // Find items that are active and older than 30 days
            const result = await Item.updateMany(
                {
                    status: 'active',
                    createdAt: { $lt: thirtyDaysAgo }
                },
                { $set: { status: 'closed' } }
            );

            if (result.modifiedCount > 0) {
                console.log(`Expiration Cron: Closed ${result.modifiedCount} expired items.`);
            } else {
                console.log('Expiration Cron: No expired items found.');
            }
        } catch (err) {
            console.error('Expiration Cron Error:', err);
        }
    });

    console.log('📅 Expiration Cron Job Initialized (Runs daily at midnight)');
};

module.exports = initExpirationCron;
