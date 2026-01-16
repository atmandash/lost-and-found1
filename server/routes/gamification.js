const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const gamificationController = require('../controllers/gamificationController');

// @route   GET /api/gamification/leaderboard
// @desc    Get top users leaderboard
// @access  Public
router.get('/leaderboard', gamificationController.getLeaderboard);

// IMPORTANT: More specific routes must come BEFORE parameterized routes
// @route   GET /api/gamification/stats
// @desc    Get current user's statistics
// @access  Private
router.get('/stats', auth, gamificationController.getUserStats);

// @route   GET /api/gamification/my-stats
// @desc    Get current user's statistics (alias)
// @access  Private
router.get('/my-stats', auth, gamificationController.getUserStats);

// @route   GET /api/gamification/stats/:userId
// @desc    Get specific user statistics
// @access  Public
router.get('/stats/:userId', gamificationController.getUserStats);

module.exports = router;
