import api from "./api";

const appointmentService = {
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
};

export default appointmentService;