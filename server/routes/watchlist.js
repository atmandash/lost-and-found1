const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const watchlistController = require('../controllers/watchlistController');

router.post('/', auth, watchlistController.createAlert);
router.get('/', auth, watchlistController.getMyAlerts);
router.delete('/:id', auth, watchlistController.deleteAlert);

module.exports = router;
