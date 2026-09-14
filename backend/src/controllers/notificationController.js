const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const Notification = require('../models/Notification');

const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly = false } = req.query;
  
  // Ensure notifications are scoped to the authenticated user
  const query = { recipient: req.user._id };
  
  if (unreadOnly === 'true') {
    query.read = false;
  }
  
  const skip = (Number(page) - 1) * Number(limit);
  
  const notifications = await Notification.find(query)
    .populate('relatedAppointment', 'date time reason status')
    .populate('relatedPrescription', 'medicines')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));
  
  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });
  
  res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
        },
        unreadCount,
      },
      'Notifications fetched successfully'
    )
  );
});

const getNotificationById = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id)
    .populate('relatedAppointment')
    .populate('relatedPrescription');
  
  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }
  
  if (notification.recipient.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to view this notification');
  }
  
  res.status(200).json(new ApiResponse(200, notification, 'Notification fetched'));
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }
  
  if (notification.recipient.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to update this notification');
  }
  
  await notification.markAsRead();
  
  res.status(200).json(new ApiResponse(200, notification, 'Notification marked as read'));
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { read: true, readAt: new Date() }
  );
  
  res.status(200).json(
    new ApiResponse(200, { modifiedCount: result.modifiedCount }, 'All notifications marked as read')
  );
});

const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }
  
  if (notification.recipient.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to delete this notification');
  }
  
  await notification.deleteOne();
  
  res.status(200).json(new ApiResponse(200, null, 'Notification deleted'));
});

const createNotification = asyncHandler(async (recipient, type, title, message, relatedData = {}) => {
  const notification = await Notification.create({
    recipient,
    type,
    title,
    message,
    ...relatedData,
  });
  
  return notification;
});

module.exports = {
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
};
