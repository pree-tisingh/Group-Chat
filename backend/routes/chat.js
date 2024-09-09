const express = require('express');
const router = express.Router();
const chatController = require('../controllers/ChatController');

router.get('/messages/:userId', chatController.getMessages);
router.post('/send-message', chatController.sendMessage);

module.exports = router;
