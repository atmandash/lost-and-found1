const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const auth = require('../middleware/auth');

// @route   GET /api/stats/global
// @desc    Get global statistics (public)
// @access  Public
router.get('/global', statsController.getGlobalStats);

// @route   GET /api/stats/admin
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/admin', auth, statsController.getAdminStats);

module.exports = router;
