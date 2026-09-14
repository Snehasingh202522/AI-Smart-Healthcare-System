const { body, param } = require('express-validator');

const createAppointmentValidator = [
  body('doctor')
    .notEmpty()
    .withMessage('Doctor ID is required')
    .isMongoId()
    .withMessage('Invalid doctor ID'),
  body('date')
    .notEmpty()
    .withMessage('Appointment date is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const appointmentDate = new Date(value);
      const now = new Date();
      if (appointmentDate < now) {
        throw new Error('Appointment date must be in the future');
      }
      return true;
    }),
  body('time')
    .notEmpty()
    .withMessage('Appointment time is required')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (use HH:MM)'),
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5 and 500 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  body('symptoms')
    .optional()
    .isArray()
    .withMessage('Symptoms must be an array'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority value'),
];

const updateAppointmentValidator = [
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const appointmentDate = new Date(value);
      const now = new Date();
      if (appointmentDate < now) {
        throw new Error('Appointment date must be in the future');
      }
      return true;
    }),
  body('time')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (use HH:MM)'),
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5 and 500 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'scheduled', 'completed', 'cancelled', 'no-show'])
    .withMessage('Invalid status value'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority value'),
];

const updateStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid appointment ID'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'confirmed', 'scheduled', 'completed', 'cancelled', 'no-show'])
    .withMessage('Invalid status value'),
];

const appointmentIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid appointment ID'),
];

module.exports = {
  createAppointmentValidator,
  updateAppointmentValidator,
  updateStatusValidator,
  appointmentIdValidator,
};
