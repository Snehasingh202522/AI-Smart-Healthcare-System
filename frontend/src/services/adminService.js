import api from "./api";

const adminService = {
  getAdminAnalytics: async () => {
    const response = await api.get("/admin/analytics");
    return response.data;
  },

  getAdminNotifications: async ({
    page = 1,
    limit = 20,
    unreadOnly = false,
  } = {}) => {
    const response = await api.get("/admin/notifications", {
      params: {
        page,
        limit,
        unreadOnly,
      },
    });

    return response.data;
  },

  markAdminNotificationAsRead: async (id) => {
    const response = await api.patch(`/admin/notifications/${id}/read`);
    return response.data;
  },

  markAllAdminNotificationsAsRead: async () => {
    const response = await api.patch("/admin/notifications/read-all");
    return response.data;
  },

  changeAdminPassword: async ({
    currentPassword,
    newPassword,
    confirmPassword,
  }) => {
    const response = await api.put("/admin/settings/password", {
      currentPassword,
      newPassword,
      confirmPassword,
    });

    return response.data;
  },
};

export const getAdminAnalytics = adminService.getAdminAnalytics;
export const getAdminNotifications = adminService.getAdminNotifications;
export const markAdminNotificationAsRead = adminService.markAdminNotificationAsRead;
export const markAllAdminNotificationsAsRead = adminService.markAllAdminNotificationsAsRead;
export const changeAdminPassword = adminService.changeAdminPassword;

export default adminService;