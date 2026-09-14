const express = require("express");

const router = express.Router();

const doctorRecommendationController = require("../controllers/doctorRecommendationController");

const { protect } = require("../middleware/authMiddleware");

const { authorize } = require("../middleware/roleMiddleware");

const validate = require("../middleware/validateMiddleware");

const {
  searchDoctorsValidator,
} = require("../validators/doctorRecommendationValidator");

// All doctor recommendation routes require authentication
router.use(protect);

// Patient: Search registered doctors + nearby healthcare centers
router.post(
  "/search",
  authorize("patient"),
  searchDoctorsValidator,
  validate,
  doctorRecommendationController.searchDoctors
);

module.exports = router;