const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  createAppointmentValidator,
  updateAppointmentValidator,
  updateStatusValidator,
  appointmentIdValidator,
} = require('../validators/appointmentValidator');

// All appointment routes require authentication
router.use(protect);

// Patient routes
router.post('/', authorize('patient'), createAppointmentValidator, validate, appointmentController.createAppointment);
router.get('/patient', authorize('patient'), appointmentController.getPatientAppointments);
router.get('/upcoming', authorize('patient', 'doctor'), appointmentController.getUpcomingAppointments);

// Doctor routes
router.get('/doctor', authorize('doctor'), appointmentController.getDoctorAppointments);

// Common routes (patient and doctor can access their own appointments)
router.get('/:id', authorize('patient', 'doctor'), appointmentIdValidator, validate, appointmentController.getAppointmentById);
router.put('/:id', authorize('patient', 'doctor'), updateAppointmentValidator, validate, appointmentController.updateAppointment);
router.patch('/:id/status', authorize('patient', 'doctor'), updateStatusValidator, validate, appointmentController.updateAppointmentStatus);
router.delete('/:id/cancel', authorize('patient'), appointmentIdValidator, validate, appointmentController.cancelAppointment);

module.exports = router;
