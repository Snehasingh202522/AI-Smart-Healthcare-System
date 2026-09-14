import api from "./api";

// ================= AUTH =================
export const authService = {
  register: async (data) => {
    const response = await api.post("/auth/register", data);
    return response.data.data;
  },

  login: async (data) => {
    const response = await api.post("/auth/login", data);
    return response.data.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data.data;
  },

  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data.data;
  },

  resetPassword: async (token, data) => {
    const response = await api.put(`/auth/reset-password/${token}`, data);
    return response.data.data;
  },
};

// ================= USER =================
export const userService = {
  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data.data;
  },

  updateProfile: async (data) => {
    const response = await api.put("/users/profile", data);
    return response.data.data;
  },
};

// ================= DASHBOARD =================
export const dashboardService = {
  getPatientDashboard: async () => {
    const response = await api.get("/dashboard/patient");
    return response.data.data;
  },

  getDoctorDashboard: async () => {
    const response = await api.get("/dashboard/doctor");
    return response.data.data;
  },

  getAdminDashboard: async () => {
    const response = await api.get("/dashboard/admin");
    return response.data.data;
  },
};

// ================= HEALTH =================
export const healthService = {
  check: async () => {
    const response = await api.get("/health");
    return response.data;
  },
};

// ================= APPOINTMENTS =================
export const appointmentService = {
  createAppointment: async (data) => {
    const response = await api.post("/appointments", data);
    return response.data.data;
  },

  getPatientAppointments: async (status = "", page = 1, limit = 10) => {
    const response = await api.get("/appointments/patient", {
      params: { status, page, limit },
    });
    return response.data.data;
  },

  getDoctorAppointments: async (status = "", page = 1, limit = 10) => {
    const response = await api.get("/appointments/doctor", {
      params: { status, page, limit },
    });
    return response.data.data;
  },

  getTodayAppointments: async () => {
    const response = await api.get("/appointments/doctor/today");
    return response.data.data;
  },

  getAppointmentById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data.data;
  },

  updateAppointment: async (id, data) => {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data.data;
  },

  updateAppointmentStatus: async (id, status) => {
    const response = await api.patch(`/appointments/${id}/status`, { status });
    return response.data.data;
  },

  cancelAppointment: async (id) => {
    const response = await api.delete(`/appointments/${id}/cancel`);
    return response.data.data;
  },

  getUpcomingAppointments: async () => {
    const response = await api.get("/appointments/upcoming");
    return response.data.data;
  },
};

// ================= MEDICAL REPORTS =================
export const medicalReportService = {
  uploadReport: async (data) => {
    const response = await api.post("/medical-reports", data);
    return response.data.data;
  },

  getPatientReports: async (params) => {
    const response = await api.get("/medical-reports/patient", { params });
    return response.data.data;
  },

  getDoctorReports: async (params) => {
    const response = await api.get("/medical-reports/doctor", { params });
    return response.data.data;
  },

  getReportById: async (id) => {
    const response = await api.get(`/medical-reports/${id}`);
    return response.data.data;
  },

  updateReport: async (id, data) => {
    const response = await api.put(`/medical-reports/${id}`, data);
    return response.data.data;
  },

  deleteReport: async (id) => {
    const response = await api.delete(`/medical-reports/${id}`);
    return response.data.data;
  },

  getRecentReports: async () => {
    const response = await api.get("/medical-reports/recent");
    return response.data.data;
  },
};

// ================= AI =================
export const aiService = {
  checkSymptoms: async (data) => {
    const response = await api.post("/ai/symptom-check", data);
    return response.data.data;
  },

  getSymptomHistory: async (params) => {
    const response = await api.get("/ai/history", { params });
    return response.data.data;
  },

  getSymptomById: async (id) => {
    const response = await api.get(`/ai/${id}`);
    return response.data.data;
  },
};

// ================= DOCTOR RECOMMENDATION =================
export const doctorRecommendationService = {
  searchDoctors: async (data) => {
    const response = await api.post(
      "/doctor-recommendation/search",
      {},
      {
        params: data,
      }
    );

    return response.data.data;
  },

  getRecommendationHistory: async (params) => {
    const response = await api.get("/doctor-recommendation/history", {
      params,
    });
    return response.data.data;
  },

  getDoctorProfile: async (id) => {
    const response = await api.get(`/doctor-recommendation/doctor/${id}`);
    return response.data.data;
  },
};

// ================= DOCTORS =================
export const doctorService = {
  recommendDoctors: async (data) => {
    const response = await api.post("/doctors/recommend", data);
    return response.data.data;
  },

  getAllDoctors: async (params) => {
    const response = await api.get("/doctors", { params });
    return response.data.data;
  },

  getDoctorById: async (id) => {
    const response = await api.get(`/doctors/${id}`);
    return response.data.data;
  },
};

// ================= PRESCRIPTIONS =================
export const prescriptionService = {
  createPrescription: async (data) => {
    const response = await api.post("/prescriptions", data);
    return response.data.data;
  },

  getDoctorPrescriptions: async (params = {}) => {
    const response = await api.get("/prescriptions/doctor", { params });
    return response.data.data;
  },

  getPatientPrescriptions: async (params = {}) => {
    const response = await api.get("/prescriptions/patient", { params });
    return response.data.data;
  },

  getPrescriptionById: async (id) => {
    const response = await api.get(`/prescriptions/${id}`);
    return response.data.data;
  },

  updatePrescription: async (id, data) => {
    const response = await api.put(`/prescriptions/${id}`, data);
    return response.data.data;
  },

  deletePrescription: async (id) => {
    const response = await api.delete(`/prescriptions/${id}`);
    return response.data.data;
  },
};

// ================= NOTIFICATIONS =================
export const notificationService = {
  getNotifications: async (params = {}) => {
    const response = await api.get("/notifications", { params });
    return response.data.data;
  },

  getNotificationById: async (id) => {
    const response = await api.get(`/notifications/${id}`);
    return response.data.data;
  },

  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch("/notifications/read-all");
    return response.data.data;
  },

  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data.data;
  },
};

// ================= ADMIN =================
export const adminService = {
  getUnverifiedDoctors: async (params) => {
    const response = await api.get("/admin/doctors/unverified", { params });
    return response.data.data;
  },

  getVerifiedDoctors: async (params) => {
    const response = await api.get("/admin/doctors/verified", { params });
    return response.data.data;
  },

  verifyDoctor: async (doctorId) => {
    const response = await api.post(`/admin/doctors/${doctorId}/verify`);
    return response.data.data;
  },

  rejectDoctor: async (doctorId, reason) => {
    const response = await api.post(`/admin/doctors/${doctorId}/reject`, {
      reason,
    });
    return response.data.data;
  },

  getAllUsers: async (params) => {
    const response = await api.get("/admin/users", { params });
    return response.data.data;
  },

  deactivateUser: async (userId) => {
    const response = await api.post(`/admin/users/${userId}/deactivate`);
    return response.data.data;
  },

  activateUser: async (userId) => {
    const response = await api.post(`/admin/users/${userId}/activate`);
    return response.data.data;
  },

  getUnverifiedDoctorsCount: async () => {
    const response = await api.get("/admin/stats/unverified-doctors");
    return response.data.data;
  },
};