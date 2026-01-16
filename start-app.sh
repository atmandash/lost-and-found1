#!/bin/bash

# Lost & Found - Complete Application Startup
# Run this script to start both frontend and backend

echo "🚀 Starting Lost & Found Application..."

# Start backend in background
echo "📡 Starting backend server..."
cd server
./start.sh &
BACKEND_PID=$!

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
sleep 3

# Check if backend is running
if ! lsof -i:5000 > /dev/null 2>&1; then
    echo "❌ Backend failed to start!"
    exit 1
fi

echo "✅ Backend running on port 5000"

# Start frontend
echo "🎨 Starting frontend..."
cd ../client
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Application started successfully!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
