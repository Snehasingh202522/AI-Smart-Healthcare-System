import api from './api';

export const authService = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, data) => {
    const response = await api.put(`/auth/reset-password/${token}`, data);
    return response.data;
  },
};

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
};

export const dashboardService = {
  getPatientDashboard: async () => {
    const response = await api.get('/dashboard/patient');
    return response.data;
  },

  getDoctorDashboard: async () => {
    const response = await api.get('/dashboard/doctor');
    return response.data;
  },

  getAdminDashboard: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },
};

export const healthService = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export const appointmentService = {
  createAppointment: async (data) => {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  getPatientAppointments: async (params) => {
    const response = await api.get('/appointments/patient', { params });
    return response.data;
  },

  getDoctorAppointments: async (params) => {
    const response = await api.get('/appointments/doctor', { params });
    return response.data;
  },

  getAppointmentById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  updateAppointment: async (id, data) => {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },

  updateAppointmentStatus: async (id, status) => {
    const response = await api.patch(`/appointments/${id}/status`, { status });
    return response.data;
  },

  cancelAppointment: async (id) => {
    const response = await api.delete(`/appointments/${id}/cancel`);
    return response.data;
  },

  getUpcomingAppointments: async () => {
    const response = await api.get('/appointments/upcoming');
    return response.data;
  },
};

export const medicalReportService = {
  uploadReport: async (data) => {
    const response = await api.post('/medical-reports', data);
    return response.data;
  },

  getPatientReports: async (params) => {
    const response = await api.get('/medical-reports/patient', { params });
    return response.data;
  },

  getDoctorReports: async (params) => {
    const response = await api.get('/medical-reports/doctor', { params });
    return response.data;
  },

  getReportById: async (id) => {
    const response = await api.get(`/medical-reports/${id}`);
    return response.data;
  },

  updateReport: async (id, data) => {
    const response = await api.put(`/medical-reports/${id}`, data);
    return response.data;
  },

  deleteReport: async (id) => {
    const response = await api.delete(`/medical-reports/${id}`);
    return response.data;
  },

  getRecentReports: async () => {
    const response = await api.get('/medical-reports/recent');
    return response.data;
  },
};

export const aiService = {
  checkSymptoms: async (data) => {
    const response = await api.post('/ai/symptom-check', data);
    return response.data;
  },

  getSymptomHistory: async (params) => {
    const response = await api.get('/ai/history', { params });
    return response.data;
  },

  getSymptomById: async (id) => {
    const response = await api.get(`/ai/${id}`);
    return response.data;
  },
};

export const doctorService = {
  recommendDoctors: async (data) => {
    const response = await api.post('/doctors/recommend', data);
    return response.data;
  },

  getAllDoctors: async (params) => {
    const response = await api.get('/doctors', { params });
    return response.data;
  },

  getDoctorById: async (id) => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  },
};
