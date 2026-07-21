const { body } = require('express-validator');

const symptomCheckerValidator = [
  body('symptoms')
    .notEmpty()
    .withMessage('Symptoms description is required')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Symptoms must be between 10 and 2000 characters'),
  
  body('age')
    .notEmpty()
    .withMessage('Age is required')
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be between 0 and 150'),
  
  body('gender')
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  
  body('existingDiseases')
    .optional()
    .isArray()
    .withMessage('Existing diseases must be an array')
    .custom((value) => {
      if (value.some(disease => typeof disease !== 'string')) {
        throw new Error('Each disease must be a string');
      }
      return true;
    }),
  
  body('currentMedications')
    .optional()
    .isArray()
    .withMessage('Current medications must be an array')
    .custom((value) => {
      if (value.some(medication => typeof medication !== 'string')) {
        throw new Error('Each medication must be a string');
      }
      return true;
    }),
];

module.exports = {
  symptomCheckerValidator,
};
