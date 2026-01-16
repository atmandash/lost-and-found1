// HTTPS Enforcement Middleware
const enforceHTTPS = (req, res, next) => {
    // Only enforce in production
    if (process.env.NODE_ENV === 'production') {
        if (req.headers['x-forwarded-proto'] !== 'https') {
            return res.redirect(301, `https://${req.headers.host}${req.url}`);
        }
    }
    next();
};

// Production error handler - don't expose stack traces
const productionErrorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Log full error for debugging
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    // Don't expose internal errors in production
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'An error occurred. Please try again later.'
        : err.message;

    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// Security audit logger
const auditLog = (action, userId, details = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        action,
        userId,
        ...details
    };

    // In production, send to logging service (e.g., Winston, LogRocket)
    console.log('[AUDIT]', JSON.stringify(logEntry));

    // TODO: Send to external logging service in production
};

module.exports = {
    enforceHTTPS,
    productionErrorHandler,
    auditLog
};
