import api from './api';

const prescriptionService = {
  createPrescription: (data) =>
    api.post('/prescriptions', data),

  getDoctorPrescriptions: (params = {}) =>
    api.get('/prescriptions/doctor', { params }),

  getPatientPrescriptions: (params = {}) =>
    api.get('/prescriptions/patient', { params }),

  getPrescriptionById: (id) =>
    api.get(`/prescriptions/${id}`),

  updatePrescription: (id, data) =>
    api.put(`/prescriptions/${id}`, data),

  deletePrescription: (id) =>
    api.delete(`/prescriptions/${id}`),
};

export default prescriptionService;
