
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// ============================================================
// DOCTOR VERIFICATION
// ============================================================

router.get(
  '/doctors/unverified',
  adminController.getUnverifiedDoctors
);

router.get(
  '/doctors/verified',
  adminController.getVerifiedDoctors
);

router.post(
  '/doctors/:doctorId/verify',
  adminController.verifyDoctor
);

router.post(
  '/doctors/:doctorId/reject',
  adminController.rejectDoctor
);

// ============================================================
// USER MANAGEMENT
// ============================================================

router.get(
  '/users',
  adminController.getAllUsers
);

router.post(
  '/users/:userId/deactivate',
  adminController.deactivateUser
);

router.post(
  '/users/:userId/activate',
  adminController.activateUser
);

// ============================================================
// ADMIN ANALYTICS
// ============================================================

router.get(
  '/analytics',
  adminController.getAdminAnalytics
);

// ============================================================
// ADMIN NOTIFICATIONS
// ============================================================

router.get(
  '/notifications',
  adminController.getAdminNotifications
);

router.patch(
  '/notifications/:id/read',
  adminController.markAdminNotificationAsRead
);

router.patch(
  '/notifications/read-all',
  adminController.markAllAdminNotificationsAsRead
);

// ============================================================
// ADMIN SETTINGS
// ============================================================

router.put(
  '/settings/password',
  adminController.changeAdminPassword
);

module.exports = router;
