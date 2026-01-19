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
        console.log('Update Setting Request:', { key, value, user: req.user, body: req.body });

        // Check verification is done in middleware, but double check admin status here just in case
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        let setting = await Setting.findOne({ key });

        if (setting) {
            setting.value = value;
            await setting.save();
        } else {
            setting = new Setting({
                key,
                value
            });
            await setting.save();
        }

        res.json(setting);
    } catch (err) {
        console.error('Setting Update Error:', err);
        res.status(500).json({ message: 'Server Error', error: err.message, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined });
    }
};
