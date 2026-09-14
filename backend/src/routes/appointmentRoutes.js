const express = require("express");
const router = express.Router();

const appointmentController = require("../controllers/appointmentController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const validate = require("../middleware/validateMiddleware");

const {
  createAppointmentValidator,
  updateAppointmentValidator,
  updateStatusValidator,
  appointmentIdValidator,
} = require("../validators/appointmentValidator");

// All appointment routes require authentication
router.use(protect);

// ================= PATIENT ROUTES =================

// Book appointment
router.post(
  "/",
  authorize("patient"),
  createAppointmentValidator,
  validate,
  appointmentController.createAppointment
);

// Patient appointment list
router.get(
  "/patient",
  authorize("patient"),
  appointmentController.getPatientAppointments
);

// Upcoming appointments
router.get(
  "/upcoming",
  authorize("patient", "doctor"),
  appointmentController.getUpcomingAppointments
);

// ================= DOCTOR ROUTES =================

// Doctor appointment list
router.get(
  "/doctor",
  authorize("doctor"),
  appointmentController.getDoctorAppointments
);

// ================= COMMON ROUTES =================

// Appointment details
router.get(
  "/:id",
  authorize("patient", "doctor"),
  appointmentIdValidator,
  validate,
  appointmentController.getAppointmentById
);

// Reschedule / Update
router.put(
  "/:id",
  authorize("patient", "doctor"),
  updateAppointmentValidator,
  validate,
  appointmentController.updateAppointment
);

// Status update (doctor only)
router.patch(
  "/:id/status",
  authorize("doctor"),
  updateStatusValidator,
  validate,
  appointmentController.updateAppointmentStatus
);

// Cancel appointment
router.delete(
  "/:id/cancel",
  authorize("patient"),
  appointmentIdValidator,
  validate,
  appointmentController.cancelAppointment
);

module.exports = router;