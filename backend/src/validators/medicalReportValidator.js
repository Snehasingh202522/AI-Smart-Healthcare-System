const { body, param } = require('express-validator');

const uploadReportValidator = [
  body('title')
    .notEmpty()
    .withMessage('Report title is required')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('reportType')
    .notEmpty()
    .withMessage('Report type is required')
    .isIn(['lab-result', 'imaging', 'prescription', 'discharge-summary', 'other'])
    .withMessage('Invalid report type'),
  body('fileUrl')
    .notEmpty()
    .withMessage('File URL is required')
    .isURL()
    .withMessage('Invalid file URL'),
  body('fileName')
    .notEmpty()
    .withMessage('File name is required')
    .trim(),
  body('fileSize')
    .notEmpty()
    .withMessage('File size is required')
    .isNumeric()
    .withMessage('File size must be a number'),
  body('mimeType')
    .notEmpty()
    .withMessage('MIME type is required')
    .trim(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('doctor')
    .optional()
    .isMongoId()
    .withMessage('Invalid doctor ID'),
  body('reportDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid report date format'),
  body('isConfidential')
    .optional()
    .isBoolean()
    .withMessage('isConfidential must be a boolean'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
];

const updateReportValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid report ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('reportType')
    .optional()
    .isIn(['lab-result', 'imaging', 'prescription', 'discharge-summary', 'other'])
    .withMessage('Invalid report type'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('doctor')
    .optional()
    .isMongoId()
    .withMessage('Invalid doctor ID'),
  body('reportDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid report date format'),
  body('isConfidential')
    .optional()
    .isBoolean()
    .withMessage('isConfidential must be a boolean'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
];

const reportIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid report ID'),
];

module.exports = {
  uploadReportValidator,
  updateReportValidator,
  reportIdValidator,
};
