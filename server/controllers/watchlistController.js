const Watchlist = require('../models/Watchlist');

// Create Alert
exports.createAlert = async (req, res) => {
    try {
        const { keywords, category } = req.body;

        // Basic validation
        if (!keywords || keywords.length === 0) {
            return res.status(400).json({ message: 'Keywords are required' });
        }

        // Limit to 5 alerts per user to prevent spam
        const count = await Watchlist.countDocuments({ user: req.user.id });
        if (count >= 5) {
            return res.status(400).json({ message: 'You can only have 5 active alerts.' });
        }

        // REQUIREMENT: Must have a lost item reported
        const Item = require('../models/Item');
        const hasLostItem = await Item.findOne({
            user: req.user.id,
            type: 'lost',
            status: { $in: ['active', 'resolved', 'open'] } // Check if they EVER raised one? Or strictly active?
        });
        // User said "users who raise a lost report" (active or historical?)
        // Usually you alert for something active. But let's verify if they have ANY lost record.
        // Actually, if they resolved it, they don't need an alert anymore.
        // So I will check for 'active' status.
        const activeLostItem = await Item.findOne({
            user: req.user.id,
            type: 'lost',
            status: 'active'
        });

        if (!activeLostItem) {
            return res.status(403).json({ message: 'You must report a Lost Item first before creating an alert.' });
        }

        const alert = new Watchlist({
            user: req.user.id,
            keywords: Array.isArray(keywords) ? keywords : [keywords],
            category
        });

        await alert.save();
        res.json(alert);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get My Alerts
exports.getMyAlerts = async (req, res) => {
    try {
        const alerts = await Watchlist.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(alerts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete Alert
exports.deleteAlert = async (req, res) => {
    try {
        const alert = await Watchlist.findById(req.params.id);
        if (!alert) return res.status(404).json({ message: 'Alert not found' });

        if (alert.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await Watchlist.findByIdAndDelete(req.params.id);
        res.json({ message: 'Alert removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
