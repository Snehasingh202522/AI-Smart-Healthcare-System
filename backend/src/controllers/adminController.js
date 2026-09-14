
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

// ============================================================
// DOCTOR VERIFICATION
// ============================================================

// Get all unverified doctors for admin review
const getUnverifiedDoctors = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const unverifiedDoctors = await Doctor.find({ isVerified: false })
    .populate('user', 'firstName lastName email phone avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Doctor.countDocuments({ isVerified: false });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        doctors: unverifiedDoctors,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
        },
      },
      'Unverified doctors fetched successfully'
    )
  );
});

// Get all verified doctors
const getVerifiedDoctors = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const verifiedDoctors = await Doctor.find({ isVerified: true })
    .populate('user', 'firstName lastName email phone avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Doctor.countDocuments({ isVerified: true });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        doctors: verifiedDoctors,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
        },
      },
      'Verified doctors fetched successfully'
    )
  );
});

// Verify a doctor
const verifyDoctor = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  const doctor = await Doctor.findById(doctorId).populate('user');

  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  if (doctor.isVerified) {
    throw new ApiError(400, 'Doctor is already verified');
  }

  doctor.isVerified = true;
  await doctor.save();

  res.status(200).json(
    new ApiResponse(200, doctor, 'Doctor verified successfully')
  );
});

// Reject a doctor
const rejectDoctor = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const { reason } = req.body;

  const doctor = await Doctor.findById(doctorId).populate('user');

  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  if (doctor.isVerified) {
    throw new ApiError(400, 'Cannot reject a verified doctor');
  }

  res.status(200).json(
    new ApiResponse(
      200,
      { doctor, reason },
      'Doctor rejected successfully'
    )
  );
});

// ============================================================
// USER MANAGEMENT
// ============================================================

// Get all users
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, role } = req.query;

  const query = {};

  if (role) {
    query.role = role;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await User.countDocuments(query);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
        },
      },
      'Users fetched successfully'
    )
  );
});

// Deactivate user account
const deactivateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.role === 'admin') {
    throw new ApiError(403, 'Cannot deactivate admin accounts');
  }

  user.isActive = false;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, null, 'User deactivated successfully')
  );
});

// Activate user account
const activateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.isActive = true;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, null, 'User activated successfully')
  );
});

// ============================================================
// ADMIN ANALYTICS
// ============================================================

const getAdminAnalytics = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalDoctors,
    totalPatients,
    totalAdmins,
    verifiedDoctors,
    pendingDoctors,
    totalAppointments,
    pendingAppointments,
    confirmedAppointments,
    scheduledAppointments,
    completedAppointments,
    cancelledAppointments,
    rejectedAppointments,
    noShowAppointments,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'doctor' }),
    User.countDocuments({ role: 'patient' }),
    User.countDocuments({ role: 'admin' }),

    Doctor.countDocuments({ isVerified: true }),
    Doctor.countDocuments({ isVerified: false }),

    Appointment.countDocuments(),
    Appointment.countDocuments({ status: 'pending' }),
    Appointment.countDocuments({ status: 'confirmed' }),
    Appointment.countDocuments({ status: 'scheduled' }),
    Appointment.countDocuments({ status: 'completed' }),
    Appointment.countDocuments({ status: 'cancelled' }),
    Appointment.countDocuments({ status: 'rejected' }),
    Appointment.countDocuments({ status: 'no-show' }),
  ]);

  // Last 6 months appointment trend
  const monthlyAppointments = [];

  const now = new Date();

  for (let i = 5; i >= 0; i -= 1) {
    const start = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      1
    );

    const end = new Date(
      now.getFullYear(),
      now.getMonth() - i + 1,
      1
    );

    const count = await Appointment.countDocuments({
      date: {
        $gte: start,
        $lt: end,
      },
    });

    monthlyAppointments.push({
      month: start.toLocaleString('default', {
        month: 'short',
      }),
      year: start.getFullYear(),
      count,
    });
  }

  const analytics = {
    users: {
      total: totalUsers,
      doctors: totalDoctors,
      patients: totalPatients,
      admins: totalAdmins,
    },

    doctors: {
      total: totalDoctors,
      verified: verifiedDoctors,
      pending: pendingDoctors,
    },

    appointments: {
      total: totalAppointments,
      pending: pendingAppointments,
      confirmed: confirmedAppointments,
      scheduled: scheduledAppointments,
      completed: completedAppointments,
      cancelled: cancelledAppointments,
      rejected: rejectedAppointments,
      noShow: noShowAppointments,
    },

    monthlyAppointments,
  };

  res.status(200).json(
    new ApiResponse(
      200,
      analytics,
      'Admin analytics fetched successfully'
    )
  );
});

// ============================================================
// ADMIN NOTIFICATIONS
// ============================================================

const getAdminNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly = false } = req.query;

  const query = {
    recipient: req.user._id,
  };

  if (unreadOnly === 'true') {
    query.read = false;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const notifications = await Notification.find(query)
    .populate('relatedAppointment', 'date time reason status')
    .populate('relatedPrescription', 'medicines')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Notification.countDocuments(query);

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    read: false,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
        },
        unreadCount,
      },
      'Admin notifications fetched successfully'
    )
  );
});

// ============================================================
// ADMIN NOTIFICATION ACTIONS
// ============================================================

const markAdminNotificationAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findById(id);

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to update this notification');
  }

  await notification.markAsRead();

  res.status(200).json(
    new ApiResponse(200, notification, 'Notification marked as read')
  );
});

const markAllAdminNotificationsAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { read: true, readAt: new Date() }
  );

  res.status(200).json(
    new ApiResponse(
      200,
      { modifiedCount: result.modifiedCount },
      'All notifications marked as read'
    )
  );
});

// ============================================================
// ADMIN SETTINGS - CHANGE PASSWORD
// ============================================================

const changeAdminPassword = asyncHandler(async (req, res) => {
  const {
    currentPassword,
    newPassword,
    confirmPassword,
  } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new ApiError(
      400,
      'Current password, new password and confirm password are required'
    );
  }

  if (currentPassword.length < 1) {
    throw new ApiError(400, 'Current password is required');
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, 'New password must be at least 8 characters long');
  }

  if (newPassword.length > 128) {
    throw new ApiError(400, 'New password is too long. Maximum 128 characters allowed');
  }

  if (newPassword === currentPassword) {
    throw new ApiError(400, 'New password must be different from current password');
  }

  if (!/[A-Z]/.test(newPassword)) {
    throw new ApiError(400, 'New password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(newPassword)) {
    throw new ApiError(400, 'New password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(newPassword)) {
    throw new ApiError(400, 'New password must contain at least one number');
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, 'New password and confirm password do not match');
  }

  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    throw new ApiError(404, 'Admin user not found');
  }

  if (user.role !== 'admin') {
    throw new ApiError(403, 'Only admin users can change admin settings');
  }

  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = newPassword;

  await user.save();

  res.status(200).json(
    new ApiResponse(
      200,
      null,
      'Admin password changed successfully'
    )
  );
});

module.exports = {
  getUnverifiedDoctors,
  getVerifiedDoctors,
  verifyDoctor,
  rejectDoctor,

  getAllUsers,
  deactivateUser,
  activateUser,

  getAdminAnalytics,
  getAdminNotifications,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
  changeAdminPassword,
};

