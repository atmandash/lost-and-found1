require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io'); // Kept original destructuring for consistency
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet'); // Added
const { globalLimiter } = require('./middleware/rateLimiter'); // Added
const { sanitizeMiddleware } = require('./middleware/sanitize'); // Added
const { enforceHTTPS, productionErrorHandler } = require('./middleware/security'); // Added

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all for dev, restrict in prod
        methods: ['GET', 'POST']
    }
});

// Security Middleware
app.use(enforceHTTPS); // HTTPS enforcement in production
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Middleware
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL || 'https://yourdomain.com'
        : '*',
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(sanitizeMiddleware);
app.use(globalLimiter);

// Debug Middleware: Log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Connect to MongoDB with retry logic and security hardening
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            // Security
            ssl: true, // Enforce SSL/TLS encryption
            authSource: 'admin',

            // Connection pooling (prevent resource exhaustion)
            maxPoolSize: 50,
            minPoolSize: 10,
            maxIdleTimeMS: 30000,

            // Timeouts (prevent hanging connections)
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,

            // Reliability
            retryWrites: true,
            w: 'majority'
        });
        console.log('MongoDB Connected (SSL/TLS Encrypted)');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        console.error('Connection String (Hidden Pass):', process.env.MONGO_URI.replace(/:([^:@]+)@/, ':****@'));
        console.error('Retrying in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

connectDB();

const initExpirationCron = require('./cron/expirationCron');
initExpirationCron();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/chats', require('./routes/chats'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/gamification', require('./routes/gamification'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/watchlist', require('./routes/watchlist'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => {
    res.send('Lost and Found API is running');
});

// Production error handler (must be last)
app.use(productionErrorHandler);

// Socket.io Connection
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a chat room
    socket.on('join_chat', (chatId) => {
        socket.join(chatId);
        console.log(`User ${socket.id} joined chat: ${chatId}`);
    });

    // Leave a chat room (optional cleanup)
    socket.on('leave_chat', (chatId) => {
        socket.leave(chatId);
        console.log(`User ${socket.id} left chat: ${chatId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Make io accessible to our router
app.set('io', io);

const PORT = process.env.PORT || 5000;

// Global error handlers
process.on('uncaughtException', (err) => {
    console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err.name, err.message);
    console.error(err.stack);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('❌ UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? '✓ Loaded' : '✗ Missing'}`);
});
