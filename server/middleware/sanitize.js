const { body, validationResult } = require('express-validator');

// Manual XSS prevention
const sanitizeXSS = (req, res, next) => {
    const clean = (obj) => {
        if (typeof obj === 'string') {
            return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '');
        }
        if (obj && typeof obj === 'object') {
            for (let key in obj) {
                obj[key] = clean(obj[key]);
            }
        }
        return obj;
    };

    req.body = clean(req.body);
    req.query = clean(req.query);
    req.params = clean(req.params);
    next();
};

// Manual NoSQL injection prevention (express-mongo-sanitize incompatible with Express 5)
const sanitizeNoSQL = (req, res, next) => {
    const sanitize = (obj) => {
        if (obj && typeof obj === 'object') {
            for (let key in obj) {
                if (key.startsWith('$') || key.includes('.')) {
                    delete obj[key];
                } else if (typeof obj[key] === 'object') {
                    sanitize(obj[key]);
                }
            }
        }
    };

    sanitize(req.body);
    sanitize(req.query);
    sanitize(req.params);
    next();
};

// Sanitization middleware
const sanitizeMiddleware = [
    sanitizeNoSQL,
    sanitizeXSS
];

// Validation rules for registration
const validateRegistration = [
    body('email')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail()
        .custom(value => value.endsWith('@vitstudent.ac.in'))
        .withMessage('Please use your VIT email address'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
    body('phone')
        .matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits')
];

// Validation rules for login
const validateLogin = [
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
];

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array()[0].msg,
            errors: errors.array()
        });
    }
    next();
};

module.exports = {
    sanitizeMiddleware,
    validateRegistration,
    validateLogin,
    handleValidationErrors
};
