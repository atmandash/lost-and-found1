const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// @route   GET /api/stats/global
// @desc    Get global statistics (public)
// @access  Public
router.get('/global', statsController.getGlobalStats);

module.exports = router;
