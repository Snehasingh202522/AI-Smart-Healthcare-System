const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const { symptomCheckerValidator } = require('../validators/symptomCheckerValidator');

// All AI routes require authentication
router.use(protect);

// Patient routes
router.post('/symptom-check', authorize('patient'), symptomCheckerValidator, validate, aiController.symptomCheck);
router.get('/history', authorize('patient'), aiController.getSymptomHistory);
router.get('/:id', authorize('patient'), aiController.getSymptomById);

module.exports = router;
