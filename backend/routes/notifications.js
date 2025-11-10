const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getNotifications); // Get all notifications for user
router.get('/unread-count', auth, getUnreadCount); // Get unread count
router.put('/:id/read', auth, markAsRead); // Mark single notification as read
router.put('/read-all', auth, markAllAsRead); // Mark all as read
router.delete('/:id', auth, deleteNotification); // Delete notification

module.exports = router;
