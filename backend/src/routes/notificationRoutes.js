const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Public GET & POST for capstone demo
router.get('/', notificationController.getNotifications);
router.post('/test', notificationController.triggerTestNotification);

module.exports = router;
