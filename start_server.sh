#!/bin/bash
# Script to start the server with PM2
cd server
if npx pm2 status | grep -q "server-app"; then
    echo "Server is already running under PM2."
    npx pm2 list
else
    echo "Starting server with PM2..."
    npx pm2 start index.js --name "server-app" --watch
fi
echo "Server logs:"
npx pm2 logs server-app --lines 10 --nostream
