const { query, param } = require("express-validator");

// ---------------------------------------------------------
// Search Doctors Validator
// ---------------------------------------------------------

const searchDoctorsValidator = [

  // City
  query("city")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("City must be a string")
    .trim(),

  // Specialist is optional
  query("specialist")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("Specialist must be a string")
    .trim(),

  // Latitude is optional
  query("latitude")
    .optional({ values: "falsy" })
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),

  // Longitude is optional
  query("longitude")
    .optional({ values: "falsy" })
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),

  // Search radius is optional
  query("radius")
    .optional({ values: "falsy" })
    .isFloat({ min: 1, max: 100 })
    .withMessage("Radius must be between 1 and 100 km"),
];

// ---------------------------------------------------------
// Get History Validator
// ---------------------------------------------------------

const getHistoryValidator = [

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be at least 1"),
];

// ---------------------------------------------------------
// Doctor ID Validator
// ---------------------------------------------------------

const doctorIdValidator = [

  param("id")
    .isMongoId()
    .withMessage("Invalid doctor ID"),
];

// ---------------------------------------------------------
// Exports
// ---------------------------------------------------------

module.exports = {
  searchDoctorsValidator,
  getHistoryValidator,
  doctorIdValidator,
};