const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const auth = require('../middleware/auth');

// @route   GET api/items
// @desc    Get all items
// @access  Public
router.get('/', itemController.getItems);

// @route   GET api/items/:id
// @desc    Get item by ID
// @access  Public
router.get('/:id', itemController.getItemById);

// @route   POST api/items
// @desc    Create new item
// @access  Private
router.post('/', auth, itemController.createItem);

// @route   POST api/items/:id/upvote
// @desc    Upvote an item
// @access  Private
router.post('/:id/upvote', auth, itemController.upvoteItem);

// @route   POST api/items/:id/downvote
// @desc    Downvote an item
// @access  Private
router.post('/:id/downvote', auth, itemController.downvoteItem);

// @route   POST api/items/:id/claim
// @desc    Submit claim for an item
// @access  Private
router.post('/:id/claim', auth, itemController.submitClaim);

// @route   PUT api/items/:id/claim/:claimId/approve
// @desc    Approve a claim
// @access  Private
router.put('/:id/claim/:claimId/approve', auth, itemController.approveClaim);

// @route   PUT api/items/:id/claim/:claimId/reject
// @desc    Reject a claim
// @access  Private
router.put('/:id/claim/:claimId/reject', auth, itemController.rejectClaim);

// @route   PUT api/items/:id/resolve
// @desc    Mark item as resolved (by owner)
// @access  Private
router.put('/:id/resolve', auth, itemController.resolveItem);

// @route   DELETE api/items/:id
// @desc    Permanently delete item (Admin or Owner)
// @access  Private
router.delete('/:id', auth, itemController.deleteItem);

module.exports = router;
