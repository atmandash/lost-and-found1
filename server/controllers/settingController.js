const Setting = require('../models/Setting');

// Get a setting by key
exports.getSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const setting = await Setting.findOne({ key });

        // Return default values if not found
        if (!setting) {
            // Define defaults here
            const defaults = {
                'leaderboardVisible': true // Default to visible
            };
            return res.json({ key, value: defaults[key] !== undefined ? defaults[key] : null });
        }

        res.json(setting);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update a setting (Admin only)
exports.updateSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;
        // DEBUGGING LOGS
        console.log(`[Setting Update] Key: ${key}`, { value, user: req.user ? req.user.id : 'No User' });

        // Check verification is done in middleware, but double check admin status here just in case
        if (!req.user || !req.user.isAdmin) {
            console.log('[Setting Update] Authorization Failed');
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Use atomic findOneAndUpdate with upsert
        const setting = await Setting.findOneAndUpdate(
            { key },
            { $set: { value, updatedAt: Date.now() } },
            { new: true, upsert: true, runValidators: false } // Disable validators temporarily to isolate schema issues
        );

        console.log('[Setting Update] Success:', setting);
        res.json(setting);
    } catch (err) {
        console.error('[Setting Update] CRITICAL ERROR:', err);
        res.status(500).json({
            message: 'Server Error',
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};
