const { body } = require('express-validator');

const updateProfileValidator = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
];

module.exports = {
  updateProfileValidator,
};
