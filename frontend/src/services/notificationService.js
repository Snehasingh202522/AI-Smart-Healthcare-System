import api from './api';

const notificationService = {
  getNotifications: (params = {}) =>
    api.get('/notifications', { params }),

  getNotificationById: (id) =>
    api.get(`/notifications/${id}`),

  markAsRead: (id) =>
    api.patch(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.patch('/notifications/read-all'),

  deleteNotification: (id) =>
    api.delete(`/notifications/${id}`),
};

export default notificationService;
