const express = require('express');
const router = express.Router();

const prescriptionController = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All prescription routes require authentication
router.use(protect);

// Create prescription (doctor only)
router.post(
  '/',
  authorize('doctor'),
  prescriptionController.createPrescription
);

// Get doctor's prescriptions
router.get(
  '/doctor',
  authorize('doctor'),
  prescriptionController.getDoctorPrescriptions
);

// Get patient's prescriptions
router.get(
  '/patient',
  authorize('patient'),
  prescriptionController.getPatientPrescriptions
);

// Get single prescription
router.get(
  '/:id',
  authorize('patient', 'doctor'),
  prescriptionController.getPrescriptionById
);

// Update prescription (doctor only)
router.put(
  '/:id',
  authorize('doctor'),
  prescriptionController.updatePrescription
);

// Delete prescription (doctor only)
router.delete(
  '/:id',
  authorize('doctor'),
  prescriptionController.deletePrescription
);

module.exports = router;
