const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

router.post('/initiate', auth, chatController.initiateChat);
router.get('/', auth, chatController.getMyChats);
router.get('/:id', auth, chatController.getChatById);
router.get('/:id/can-resolve', auth, chatController.canResolve);
router.post('/:id/messages', auth, chatController.sendMessage);
router.put('/:id/read', auth, chatController.markAsRead);
router.put('/:id/resolve', auth, chatController.resolveChat);
router.post('/:id/share-phone', auth, chatController.sharePhone);

module.exports = router;
