const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { bulkDeleteUsers, updateItem, deleteItem } = require('../controllers/adminController');

// Bulk delete users
router.post('/users/bulk-delete', auth, bulkDeleteUsers);

// Update any item (admin only)
router.put('/items/:id', auth, updateItem);

// Delete any item (admin only)
router.delete('/items/:id', auth, deleteItem);

module.exports = router;
