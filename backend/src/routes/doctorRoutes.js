const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  recommendDoctorsValidator,
  getDoctorsValidator,
} = require('../validators/doctorValidator');

router.use(protect);

router.post(
  '/recommend',
  authorize('patient'),
  recommendDoctorsValidator,
  validate,
  doctorController.recommendDoctors
);

router.get(
  '/',
  authorize('patient', 'admin'),
  getDoctorsValidator,
  validate,
  doctorController.getAllDoctors
);

router.get('/:id', authorize('patient', 'admin'), doctorController.getDoctorById);

module.exports = router;
