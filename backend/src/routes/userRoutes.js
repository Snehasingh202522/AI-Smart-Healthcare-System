const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { updateProfileValidator } = require('../validators/userValidator');

router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, updateProfileValidator, validate, userController.updateProfile);

module.exports = router;
