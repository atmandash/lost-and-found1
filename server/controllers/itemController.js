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

// Upvote item
exports.upvoteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        const userId = req.user.id;

        // Remove from downvotes if exists
        item.downvotes = item.downvotes.filter(id => id.toString() !== userId);

        // Toggle upvote
        if (item.upvotes.some(id => id.toString() === userId)) {
            item.upvotes = item.upvotes.filter(id => id.toString() !== userId);
        } else {
            item.upvotes.push(userId);
            // Award 2 points to item owner for receiving upvote
            const gamificationController = require('./gamificationController');
            await gamificationController.awardPoints(item.user, 2, 'received upvote on item');
        }

        await item.save();
        res.json({ upvotes: item.upvotes.length, downvotes: item.downvotes.length });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Downvote item
exports.downvoteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        const userId = req.user.id;

        // Remove from upvotes if exists
        item.upvotes = item.upvotes.filter(id => id.toString() !== userId);

        // Toggle downvote
        if (item.downvotes.some(id => id.toString() === userId)) {
            item.downvotes = item.downvotes.filter(id => id.toString() !== userId);
        } else {
            item.downvotes.push(userId);
        }

        await item.save();
        res.json({ upvotes: item.upvotes.length, downvotes: item.downvotes.length });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Submit claim for an item
exports.submitClaim = async (req, res) => {
    try {
        const { description, verificationAnswers } = req.body;
        const item = await Item.findById(req.params.id);

        if (!item) return res.status(404).json({ message: 'Item not found' });

        // Can't claim your own item
        if (item.user.toString() === req.user.id) {
            return res.status(400).json({ message: 'Cannot claim your own item' });
        }

        // Check if already claimed
        if (item.status !== 'active') {
            return res.status(400).json({ message: 'Item is no longer available for claiming' });
        }

        // Check if user already submitted a claim
        const existingClaim = item.claimRequests.find(
            claim => claim.claimant.toString() === req.user.id && claim.status === 'pending'
        );

        if (existingClaim) {
            return res.status(400).json({ message: 'You already have a pending claim for this item' });
        }

        // Add claim request
        item.claimRequests.push({
            claimant: req.user.id,
            description,
            verificationAnswers,
            status: 'pending'
        });

        await item.save();

        // Notify item owner
        const Notification = require('../models/Notification');
        await Notification.create({
            userId: item.user,
            type: 'claim',
            message: `Someone has submitted a claim for your ${item.type} item "${item.title}"`,
            itemId: item._id,
            relatedUser: req.user.id // For "Start Chat" button
        });

        // Send Email to Item Owner
        try {
            const User = require('../models/User');
            // We need to fetch the item owner's email. item.user is just an ID here.
            const itemOwner = await User.findById(item.user);
            const claimant = await User.findById(req.user.id);

            if (itemOwner && itemOwner.email) {
                const { sendClaimSubmittedEmail } = require('../utils/emailService');
                // Don't await email - send in background to keep UI fast
                sendClaimSubmittedEmail(
                    itemOwner.email,
                    itemOwner.name,
                    claimant ? claimant.name : 'A user',
                    item.title,
                    item.type
                ).catch(e => console.error('Background email failed:', e));
            }
        } catch (emailErr) {
            console.error('Email setup error:', emailErr);
        }

        res.json({ message: 'Claim submitted successfully', item });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Approve claim
exports.approveClaim = async (req, res) => {
    try {
        const { claimId } = req.params;
        const item = await Item.findById(req.params.id).populate('claimRequests.claimant', 'name');

        if (!item) return res.status(404).json({ message: 'Item not found' });

        // Only item owner can approve
        if (item.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const claim = item.claimRequests.id(claimId);
        if (!claim) return res.status(404).json({ message: 'Claim not found' });

        claim.status = 'approved';
        item.status = 'claimed';
        item.claimedBy = claim.claimant;

        await item.save();

        // Notify claimant
        const Notification = require('../models/Notification');
        await Notification.create({
            userId: claim.claimant._id,
            type: 'claim',
            message: `Your claim for "${item.title}" has been approved!`,
            itemId: item._id
        });

        // Award points
        const gamificationController = require('./gamificationController');
        await gamificationController.awardPoints(claim.claimant._id, 50, 'item claimed');
        await gamificationController.awardPoints(req.user.id, 30, 'item returned');

        res.json({ message: 'Claim approved', item });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Reject claim
exports.rejectClaim = async (req, res) => {
    try {
        const { claimId } = req.params;
        const item = await Item.findById(req.params.id).populate('claimRequests.claimant', 'name');

        if (!item) return res.status(404).json({ message: 'Item not found' });

        // Only item owner can reject
        if (item.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const claim = item.claimRequests.id(claimId);
        if (!claim) return res.status(404).json({ message: 'Claim not found' });

        claim.status = 'rejected';
        await item.save();

        // Notify claimant
        const Notification = require('../models/Notification');
        await Notification.create({
            userId: claim.claimant._id,
            type: 'claim',
            message: `Your claim for "${item.title}" was not approved.`,
            itemId: item._id
        });

        res.json({ message: 'Claim rejected', item });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

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
