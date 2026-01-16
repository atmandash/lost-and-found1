#!/bin/bash

# Lost & Found - Server Startup Script
# This script ensures the server starts correctly and handles errors gracefully

echo "🚀 Starting Lost & Found Server..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ ERROR: .env file not found!"
    echo "Please create a .env file with the following variables:"
    echo "  - PORT"
    echo "  - MONGO_URI"
    echo "  - JWT_SECRET"
    echo "  - NODE_ENV"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Kill any existing processes on port 5000
echo "🧹 Cleaning up existing processes..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

# Start the server
echo "✅ Starting server on port 5000..."
npm start
