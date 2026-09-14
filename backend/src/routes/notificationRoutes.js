const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// All notification routes require authentication
router.use(protect);

// Get notifications for logged-in user
router.get('/', notificationController.getNotifications);

// Mark all notifications as read
router.patch('/read-all', notificationController.markAllAsRead);

// Mark notification as read
router.patch('/:id/read', notificationController.markAsRead);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

// Get single notification
router.get('/:id', notificationController.getNotificationById);

module.exports = router;
