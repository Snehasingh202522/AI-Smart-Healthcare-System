const { body, query } = require('express-validator');

const recommendDoctorsValidator = [
  body('disease').optional().isString().trim(),
  body('diseases').optional().isArray({ min: 1 }),
  body('diseases.*').optional().isString().trim().notEmpty(),
  body('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('city').optional().isString().trim(),
  body('limit').optional().isInt({ min: 1, max: 50 }),
];

const getDoctorsValidator = [
  query('specialization').optional().isString().trim(),
  query('city').optional().isString().trim(),
  query('availability').optional().isIn(['available', 'busy', 'offline']),
];

module.exports = {
  recommendDoctorsValidator,
  getDoctorsValidator,
};
