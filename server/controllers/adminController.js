const User = require('../models/User');
const Item = require('../models/Item');

// Bulk delete users
exports.bulkDeleteUsers = async (req, res) => {
    try {
        const { userIds } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: 'userIds must be a non-empty array' });
        }

        // Check if requesting user is admin
        const requestingUser = await User.findById(req.user.id);
        if (!requestingUser?.isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        // Prevent deleting admins
        const usersToDelete = await User.find({ _id: { $in: userIds }, isAdmin: false });
        const userIdsToDelete = usersToDelete.map(u => u._id);

        // Delete all items created by these users
        await Item.deleteMany({ user: { $in: userIdsToDelete } });

        // Delete the users
        const result = await User.deleteMany({ _id: { $in: userIdsToDelete } });

        res.json({
            message: `Successfully deleted ${result.deletedCount} users`,
            deletedCount: result.deletedCount
        });
    } catch (err) {
        console.error('Bulk delete error:', err);
        res.status(500).json({ message: 'Server error during bulk deletion' });
    }
};

// Update any item (admin only)
exports.updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Check if requesting user is admin
        const requestingUser = await User.findById(req.user.id);
        if (!requestingUser?.isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        // Find and update the item
        const item = await Item.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        ).populate('user', 'name email');

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json(item);
    } catch (err) {
        console.error('Item update error:', err);
        res.status(500).json({ message: 'Server error updating item' });
    }
};

// Delete any item (admin only)  
exports.deleteItem = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if requesting user is admin
        const requestingUser = await User.findById(req.user.id);
        if (!requestingUser?.isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const item = await Item.findByIdAndDelete(id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        console.error('Item deletion error:', err);
        res.status(500).json({ message: 'Server error deleting item' });
    }
};
