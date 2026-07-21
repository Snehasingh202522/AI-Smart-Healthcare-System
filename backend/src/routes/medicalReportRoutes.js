const express = require('express');
const router = express.Router();
const medicalReportController = require('../controllers/medicalReportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  uploadReportValidator,
  updateReportValidator,
  reportIdValidator,
} = require('../validators/medicalReportValidator');

// All medical report routes require authentication
router.use(protect);

// Patient routes
router.post('/', authorize('patient'), uploadReportValidator, validate, medicalReportController.uploadReport);
router.get('/patient', authorize('patient'), medicalReportController.getPatientReports);

// Doctor routes
router.get('/doctor', authorize('doctor'), medicalReportController.getDoctorReports);

// Common routes (patient and doctor can access their own reports)
router.get('/recent', authorize('patient', 'doctor'), medicalReportController.getRecentReports);
router.get('/:id', authorize('patient', 'doctor'), reportIdValidator, validate, medicalReportController.getReportById);
router.put('/:id', authorize('patient', 'doctor'), updateReportValidator, validate, medicalReportController.updateReport);
router.delete('/:id', authorize('patient', 'doctor'), reportIdValidator, validate, medicalReportController.deleteReport);

module.exports = router;
