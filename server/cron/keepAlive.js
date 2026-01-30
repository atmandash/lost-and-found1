const cron = require('node-cron');
const https = require('https');
const http = require('http');

const keepAlive = () => {
    // Run every 14 minutes to prevent 15-min idle sleep
    cron.schedule('*/14 * * * *', () => {
        console.log('⏰ Keep-Alive: Pinging server to prevent sleep...');

        const protocol = process.env.NODE_ENV === 'production' ? https : http;
        const host = process.env.RENDER_EXTERNAL_URL || process.env.KOYEB_APP_URL || 'http://localhost:5000';

        // Handle full URL or just localhost fallback
        const url = host.startsWith('http') ? host : `https://${host}`;

        protocol.get(url, (res) => {
            console.log(`✅ Keep-Alive Ping Status: ${res.statusCode}`);
        }).on('error', (err) => {
            console.error('❌ Keep-Alive Ping Failed:', err.message);
        });
    });
};

module.exports = keepAlive;
