const Item = require('../models/Item');
const Notification = require('../models/Notification');

// Get all items (with filters)
exports.getItems = async (req, res) => {
    try {
        const { type, category, status, user } = req.query;
        let query = {};

        if (type) query.type = type;
        if (category) query.category = category;
        if (status) query.status = status;
        else query.status = { $ne: 'closed' }; // Default: active items
        if (user) query.user = user; // Filter by user

        const items = await Item.find(query).sort({ createdAt: -1 }).populate('user', 'name');
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get item by ID
exports.getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('user', 'name');
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json(item);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Item not found' });
        res.status(500).send('Server Error');
    }
};

// Create new item
exports.createItem = async (req, res) => {
    try {
        const { type, title, date, description, category, location, coordinates, images } = req.body;

        const newItem = new Item({
            type,
            title,
            date,
            description,
            category,
            location,
            coordinates,
            images,
            user: req.user.id
        });

        const item = await newItem.save();

        // Enhanced Smart Matching Logic
        const oppositeType = type === 'lost' ? 'found' : 'lost';

        // Find potential matches
        const potentialMatches = await Item.find({
            type: oppositeType,
            category: category,
            status: 'active',
            'location.main': location.main,
            user: { $ne: req.user.id } // Don't match own items
        }).populate('user', 'name').limit(10);

        // Create notifications for matches
        if (potentialMatches.length > 0) {
            console.log(`Found ${potentialMatches.length} potential matches for new item ${item._id}`);

            for (const match of potentialMatches) {
                // Notify the owner of the matched item
                await Notification.create({
                    userId: match.user._id,
                    type: 'match',
                    message: `Potential match found! Someone reported a ${type} item similar to your ${oppositeType} "${match.title}"`,
                    itemId: match._id,
                    matchedItemId: item._id
                });
            }

            // Also notify the current user about matches
            if (potentialMatches.length > 0) {
                await Notification.create({
                    userId: req.user.id,
                    type: 'match',
                    message: `We found ${potentialMatches.length} potential match${potentialMatches.length > 1 ? 'es' : ''} for your ${type} item "${title}"`,
                    itemId: item._id,
                    matchedItemId: potentialMatches[0]._id
                });
            }
        }

        // ================= WATCHLIST ALERTS =================
        // If this is a 'found' item, notify users looking for it
        if (type === 'found') {
            try {
                const Watchlist = require('../models/Watchlist');
                const textTokens = (title + ' ' + description).toLowerCase().split(/\s+/);

                // Find matching alerts
                const alerts = await Watchlist.find({
                    isActive: true,
                    keywords: { $in: textTokens }, // Match any keyword
                    user: { $ne: req.user.id } // Don't notify self
                }).populate('user'); // Populate user to get email

                for (const alert of alerts) {
                    // Check strict category match if specified
                    if (alert.category && alert.category !== category) continue;

                    // Send In-App Notification
                    await Notification.create({
                        userId: alert.user._id,
                        type: 'alert',
                        message: `🔔 Watchlist Match: Someone found a "${title}" that matches your alert for "${alert.keywords.join(', ')}"!`,
                        itemId: item._id
                    });

                    // Send Email Notification
                    if (alert.user.email) {
                        try {
                            const { sendWatchlistAlertEmail } = require('../utils/emailService');
                            await sendWatchlistAlertEmail(
                                alert.user.email,
                                alert.user.name,
                                title,
                                alert.keywords.join(', ')
                            );
                        } catch (emailErr) {
                            console.error('Watchlist Email Error:', emailErr);
                        }
                    }

                    // Update stats
                    alert.notificationsSent += 1;
                    await alert.save();
                }
            } catch (alertErr) {
                console.error('Watchlist Alert Error:', alertErr);
            }
        }
        // ====================================================

        // Award points for reporting item
        const gamificationController = require('./gamificationController');
        const User = require('../models/User');
        const pointsForReport = type === 'found' ? 15 : 10;
        await gamificationController.awardPoints(req.user.id, pointsForReport, `reported ${type} item`);

        // Update user's itemsReported counter
        await User.findByIdAndUpdate(req.user.id, { $inc: { itemsReported: 1 } });

        // Real-time: Emit 'item_added' event
        const io = req.app.get('io');
        if (io) {
            io.emit('item_added', item);
        }

        res.json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error: ' + err.message);
    }
};

// ... (skipping unchanged parts) ...

// Manually resolve item (by owner)
exports.resolveItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        // Check ownership
        if (item.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        item.status = 'resolved';
        item.resolvedAt = Date.now();
        await item.save();

        // Remove related chats as requested
        const Chat = require('../models/Chat');
        await Chat.deleteMany({ itemId: item._id });

        // Real-time: Emit 'item_updated' event
        const io = req.app.get('io');
        if (io) {
            io.emit('item_updated', item);
        }

        // Send Resolution Email
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        if (user && user.email) {
            const { sendItemResolvedEmail } = require('../utils/emailService');
            // Send in background
            sendItemResolvedEmail(user.email, user.name, item.title, item.type)
                .catch(e => console.error('Resolution email failed:', e));
        }

        res.json({ message: 'Item resolved and chats removed', item });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
