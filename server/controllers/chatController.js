const Chat = require('../models/Chat');
const Item = require('../models/Item');
const User = require('../models/User');

// Create or Get Chat for an Item
exports.initiateChat = async (req, res) => {
    try {
        console.log('=== INITIATE CHAT REQUEST ===');
        console.log('Request body:', req.body);
        console.log('User ID:', req.user?.id);

        const { itemId, recipientId } = req.body;
        const userId = req.user.id;

        const item = await Item.findById(itemId);
        console.log('Found item:', item?._id);

        if (!item) {
            console.log('ERROR: Item not found');
            return res.status(404).json({ message: 'Item not found' });
        }

        // Determine the other participant
        // If recipientId is provided, use that (e.g., owner chatting with claimant)
        // Otherwise, default to item owner (e.g., user chatting with owner)
        let otherUserId = recipientId;

        if (!otherUserId) {
            // Default behavior: Chat with item owner
            otherUserId = item.user.toString();
        }

        console.log('User ID:', userId);
        console.log('Other User ID:', otherUserId);

        if (otherUserId === userId) {
            console.log('ERROR: Cannot chat with yourself');
            return res.status(400).json({ message: 'Cannot chat with yourself' });
        }

        // Check if chat exists
        let chat = await Chat.findOne({
            itemId,
            participants: { $all: [userId, otherUserId] }
        });

        console.log('Existing chat:', chat?._id);

        if (!chat) {
            console.log('Creating new chat...');
            chat = new Chat({
                itemId,
                participants: [userId, otherUserId],
                messages: []
            });
            await chat.save();
            console.log('New chat created:', chat._id);

            // Award points for initiating chat
            const gamificationController = require('./gamificationController');
            await gamificationController.awardPoints(userId, 5, 'initiated chat');
        }

        res.json(chat);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get User's Chats with unread count
exports.getMyChats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get active chats only (exclude resolved)
        const chats = await Chat.find({
            participants: userId,
            expiresAt: { $gt: new Date() },
            resolved: false
        })
            .populate('itemId', 'title type images location')
            .populate('participants', 'name')
            .sort({ updatedAt: -1 });

        // Calculate unread count for each chat
        const chatsWithUnread = chats.map(chat => {
            const lastRead = chat.lastReadBy?.get(userId) || new Date(0);
            const unreadCount = chat.messages.filter(msg =>
                msg.timestamp > lastRead && msg.sender.toString() !== userId
            ).length;

            return {
                ...chat.toObject(),
                unreadCount
            };
        });

        res.json(chatsWithUnread);
    } catch (err) {
        console.error('Error in getMyChats:', err.message);
        res.status(500).send('Server Error');
    }
};

// Get Single Chat
exports.getChatById = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id)
            .populate('itemId')
            .populate('participants', 'name phone');

        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        // Check participation
        if (!chat.participants.some(p => p._id.toString() === req.user.id)) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Check if chat has expired
        if (chat.expiresAt && chat.expiresAt < new Date()) {
            return res.status(410).json({ message: 'This chat has expired' });
        }

        res.json(chat);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Add Message
exports.sendMessage = async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.user.id;
        const chat = await Chat.findById(req.params.id);

        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        // Check if expired
        if (chat.expiresAt && chat.expiresAt < new Date()) {
            return res.status(410).json({ message: 'This chat has expired' });
        }

        // Enhanced Profanity Filter
        const { containsProfanity } = require('../utils/profanityFilter');

        if (containsProfanity(content)) {
            return res.status(400).json({ message: 'Please keep the chat respectful. Profanity is not allowed.' });
        }

        const newMessage = {
            sender: userId,
            content,
            timestamp: new Date()
        };

        chat.messages.push(newMessage);

        // Update sender's lastReadBy timestamp
        if (!chat.lastReadBy) {
            chat.lastReadBy = new Map();
        }
        chat.lastReadBy.set(userId, new Date());

        await chat.save();

        // Create notification for the other participant
        try {
            const otherParticipant = chat.participants.find(p => p.toString() !== userId);
            if (otherParticipant) {
                const Notification = require('../models/Notification');
                const item = await Item.findById(chat.itemId);

                await Notification.create({
                    user: otherParticipant,
                    type: 'message',
                    message: `New message about "${item?.title || 'your item'}"`,
                    link: `/chats/${chat._id}`,
                    relatedItem: chat.itemId
                });
            }
        } catch (notifErr) {
            console.error('Error creating notification:', notifErr);
            // Don't fail the message send if notification fails
        }

        // Real-time Socket Emission
        const io = req.app.get('io');
        io.to(req.params.id).emit('receive_message', newMessage);

        res.json(chat.messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Mark chat as read
exports.markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const chat = await Chat.findById(req.params.id);

        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        if (!chat.lastReadBy) {
            chat.lastReadBy = new Map();
        }

        chat.lastReadBy.set(userId, new Date());
        await chat.save();

        res.json({ message: 'Marked as read' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Resolve chat - only works if both parties shared phone AND user is item owner
exports.resolveChat = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id)
            .populate('participants', 'name email')
            .populate('itemId', 'title type user');

        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        // IMPORTANT: Only the item OWNER (person who lost it) can resolve
        const itemOwnerId = chat.itemId?.user?.toString();
        const currentUserId = req.user.id;

        if (itemOwnerId !== currentUserId) {
            return res.status(401).json({ message: 'Only the item owner can mark as resolved' });
        }

        // Check if BOTH parties have shared their phone numbers
        const participant1 = chat.participants[0]._id.toString();
        const participant2 = chat.participants[1]._id.toString();

        const phone1Shared = chat.phoneShared?.get(participant1) || false;
        const phone2Shared = chat.phoneShared?.get(participant2) || false;

        if (!phone1Shared || !phone2Shared) {
            return res.status(400).json({
                message: 'Both parties must share their contact numbers before resolving',
                phoneShared: {
                    [participant1]: phone1Shared,
                    [participant2]: phone2Shared
                }
            });
        }

        // Mark chat as resolved
        chat.resolved = true;
        await chat.save();

        console.log(`Resolving chat ${chat._id} - Marking item as resolved (History preserved)`);

        // Get item details before update
        const item = await Item.findById(chat.itemId._id);
        const itemTitle = item?.title || 'Unknown Item';
        const itemType = item?.type || 'item';

        // Update item status to 'resolved' instead of deleting
        if (item) {
            item.status = 'resolved';
            item.resolvedAt = new Date(); // Trigger 30-day expiration
            await item.save();
            console.log(`Item ${item._id} marked as resolved`);
        }

        // IMPORTANT: Award points ONLY to the FINDER (the person who is NOT the item owner)
        const gamificationController = require('./gamificationController');
        const finderId = chat.participants.find(p => p._id.toString() !== itemOwnerId)?._id;

        if (finderId) {
            await gamificationController.awardPoints(finderId, 50, 'helped reunite a lost item');
            console.log(`Awarded 50 points to finder ${finderId}`);
        }

        // DO NOT delete chat document anymore, as user wants it for history
        // await Chat.findByIdAndDelete(chat._id); 

        res.json({
            message: 'Chat resolved! The item has been marked as resolved.',
            pointsAwarded: 50
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Check if chat can be resolved (both parties shared phone AND user is item owner)
exports.canResolve = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id).populate('itemId', 'user');

        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        const participant1 = chat.participants[0].toString();
        const participant2 = chat.participants[1].toString();

        // Convert Map keys to strings for safe comparison
        const phone1Shared = chat.phoneShared?.get(participant1) || false;
        const phone2Shared = chat.phoneShared?.get(participant2) || false;

        // IMPORTANT: Only the item OWNER (person who lost it) can resolve
        const itemOwnerId = chat.itemId?.user?.toString();
        const currentUserId = req.user.id;
        const isItemOwner = itemOwnerId === currentUserId;

        res.json({
            canResolve: phone1Shared && phone2Shared && isItemOwner,
            phoneShared: {
                [participant1]: phone1Shared,
                [participant2]: phone2Shared
            },
            isItemOwner
        });
    } catch (err) {
        console.error('Error in canResolve:', err.message);
        res.status(500).send('Server Error');
    }
};

// Share phone number
exports.sharePhone = async (req, res) => {
    try {
        const userId = req.user.id;
        const chat = await Chat.findById(req.params.id);

        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        // Check if user is a participant
        if (!chat.participants.some(p => p.toString() === userId)) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Get user's phone
        const user = await User.findById(userId);
        if (!user || !user.phone) {
            return res.status(400).json({ message: 'Phone number not available' });
        }

        // Add phone share message
        const phoneMessage = {
            sender: userId,
            content: `📞 Shared contact: ${user.phone}`,
            timestamp: new Date(),
            isPhoneShare: true
        };

        chat.messages.push(phoneMessage);

        if (!chat.phoneShared) {
            chat.phoneShared = new Map();
        }

        // Use consistent string keys
        chat.phoneShared.set(userId.toString(), true);

        // Update sender's lastReadBy
        if (!chat.lastReadBy) {
            chat.lastReadBy = new Map();
        }
        chat.lastReadBy.set(userId.toString(), new Date());

        await chat.save();

        // 1. Real-time Socket Emission (Instant UI Update)
        const io = req.app.get('io');
        if (io) {
            io.to(req.params.id).emit('receive_message', phoneMessage);
        }

        // 2. Background Tasks (Fire and forget)
        const runBackgroundTasks = async () => {
            try {
                // Award points
                const gamificationController = require('./gamificationController');
                await gamificationController.awardPoints(userId, 10, 'shared phone number');

                // Notifications
                const otherParticipantId = chat.participants.find(p => {
                    const pId = p._id ? p._id.toString() : p.toString();
                    return pId !== userId;
                });
                const otherUserId = otherParticipantId?._id || otherParticipantId;
                const item = await Item.findById(chat.itemId);
                const Notification = require('../models/Notification');

                if (otherUserId) {
                    await Notification.create({
                        user: otherUserId,
                        type: 'message',
                        message: `${user.name} shared their phone number in chat about "${item?.title || 'item'}"`,
                        relatedItem: chat.itemId,
                        link: `/chats/${chat._id}`
                    });
                }
            } catch (bgErr) {
                console.error('Background task error in sharePhone:', bgErr);
            }
        };

        runBackgroundTasks(); // Don't await this

        res.json({ message: 'Phone number shared', chat });
    } catch (err) {
        console.error('Error in sharePhone:', err.message);
        res.status(500).send('Server Error');
    }
};
