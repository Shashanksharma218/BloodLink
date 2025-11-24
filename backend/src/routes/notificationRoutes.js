const express = require('express');
const router = express.Router();

const {
    getNotifications,
    markAsRead,
    streamNotifications
} = require('../controllers/notificationController');

// Get notifications (with optional since parameter for polling)
router.get('/', getNotifications);

// Mark notifications as read
router.post('/mark-read', markAsRead);

// SSE stream for real-time notifications
router.get('/stream', streamNotifications);

module.exports = router;

