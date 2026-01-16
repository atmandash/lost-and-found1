// Query security middleware - prevents unbounded queries

const limitQueryResults = (req, res, next) => {
    // Store original query method
    const originalQuery = req.query;

    // Add default limit if not specified
    if (!originalQuery.limit) {
        req.defaultLimit = 100; // Max 100 results per query
    }

    next();
};

// Mongoose plugin to add limits to all queries
const queryLimiterPlugin = (schema) => {
    // Add pre-find hook to limit results
    schema.pre('find', function () {
        if (!this.options.limit) {
            this.limit(100); // Default limit
        }

        // Add query timeout (30 seconds max)
        this.maxTimeMS(30000);
    });

    schema.pre('findOne', function () {
        this.maxTimeMS(30000);
    });
};

// Database audit logger
const auditDBOperation = (model, operation, userId, data) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        model,
        operation, // 'CREATE', 'UPDATE', 'DELETE'
        userId,
        data: JSON.stringify(data).substring(0, 200) // Limit log size
    };

    console.log('[DB_AUDIT]', JSON.stringify(logEntry));

    // TODO: Send to external logging service in production
    // e.g., Winston, MongoDB audit collection, or external SIEM
};

module.exports = {
    limitQueryResults,
    queryLimiterPlugin,
    auditDBOperation
};
