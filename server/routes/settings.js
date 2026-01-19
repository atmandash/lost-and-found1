const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const auth = require('../middleware/auth');

// @route   GET api/settings/:key
// @desc    Get a setting value
// @access  Public (or semi-private, currently made public for easier frontend logic)
router.get('/:key', settingController.getSetting);

// @route   PUT api/settings/:key
// @desc    Update a setting value
// @access  Private/Admin
router.put('/:key', auth, settingController.updateSetting);

module.exports = router;
