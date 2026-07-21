const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const MedicalReport = require('../models/MedicalReport');
const SymptomHistory = require('../models/SymptomHistory');

const getPatientDashboard = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  const profile = await Patient.findOne({ user: user._id });

  const [upcomingAppointments, totalReports, recentReports, totalSymptomChecks] = await Promise.all([
    Appointment.find({
      patient: user._id,
      date: { $gte: new Date() },
      status: 'scheduled',
    })
      .populate('doctor', 'firstName lastName specialty')
      .sort({ date: 1 })
      .limit(5),
    MedicalReport.countDocuments({ patient: user._id }),
    MedicalReport.find({ patient: user._id })
      .sort({ createdAt: -1 })
      .limit(3),
    SymptomHistory.countDocuments({ patient: user._id }),
  ]);

  const dashboardData = {
    user,
    profile,
    welcomeMessage: `Welcome back, ${user.firstName}!`,
    stats: {
      upcomingAppointments: upcomingAppointments.length,
      healthScore: null,
      medicalReports: totalReports,
      symptomChecks: totalSymptomChecks,
      notifications: 3,
    },
    upcomingAppointments,
    recentActivity: [
      { id: 1, action: 'Profile updated', date: new Date(), type: 'info' },
      { id: 2, action: 'Account created', date: user.createdAt, type: 'success' },
    ],
    notifications: [
      { id: 1, message: 'Complete your health profile', read: false, type: 'reminder' },
      { id: 2, message: 'Welcome to HealthCare AI', read: false, type: 'welcome' },
      { id: 3, message: 'Schedule your first appointment', read: true, type: 'info' },
    ],
    quickActions: [
      { id: 1, label: 'Book Appointment', icon: 'calendar', enabled: true },
      { id: 2, label: 'View Reports', icon: 'file', enabled: true },
      { id: 3, label: 'Update Profile', icon: 'user', enabled: true },
      { id: 4, label: 'Health Records', icon: 'heart', enabled: false },
    ],
  };

  res.status(200).json(new ApiResponse(200, dashboardData, 'Patient dashboard fetched'));
});

const getDoctorDashboard = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  const profile = await Doctor.findOne({ user: user._id });

  const dashboardData = {
    user,
    profile,
    welcomeMessage: `Good day, Dr. ${user.lastName}!`,
    stats: {
      todayAppointments: 0,
      totalPatients: 0,
      pendingReviews: 0,
      notifications: 2,
    },
    todaySchedule: [],
    recentPatients: [],
    notifications: [
      { id: 1, message: 'Complete your doctor profile', read: false, type: 'reminder' },
      { id: 2, message: 'Welcome to HealthCare AI', read: true, type: 'welcome' },
    ],
    quickActions: [
      { id: 1, label: 'View Schedule', icon: 'calendar', enabled: false },
      { id: 2, label: 'Patient List', icon: 'users', enabled: false },
      { id: 3, label: 'Update Profile', icon: 'user', enabled: true },
      { id: 4, label: 'Prescriptions', icon: 'pill', enabled: false },
    ],
  };

  res.status(200).json(new ApiResponse(200, dashboardData, 'Doctor dashboard fetched'));
});

const getAdminDashboard = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  const [totalUsers, totalDoctors, totalPatients] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'doctor' }),
    User.countDocuments({ role: 'patient' }),
  ]);

  const dashboardData = {
    user,
    welcomeMessage: `Admin Dashboard - ${user.firstName}`,
    stats: {
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAdmins: await User.countDocuments({ role: 'admin' }),
      notifications: 4,
    },
    recentActivity: [
      { id: 1, action: 'New user registered', date: new Date(), type: 'user' },
      { id: 2, action: 'System health check passed', date: new Date(), type: 'system' },
    ],
    notifications: [
      { id: 1, message: 'System running normally', read: true, type: 'success' },
      { id: 2, message: 'Review pending doctor verifications', read: false, type: 'warning' },
      { id: 3, message: 'Monthly report available', read: false, type: 'info' },
      { id: 4, message: 'Welcome to Admin Panel', read: true, type: 'welcome' },
    ],
    quickActions: [
      { id: 1, label: 'Manage Users', icon: 'users', enabled: false },
      { id: 2, label: 'View Analytics', icon: 'chart', enabled: false },
      { id: 3, label: 'System Settings', icon: 'settings', enabled: false },
      { id: 4, label: 'Verify Doctors', icon: 'check', enabled: false },
    ],
  };

  res.status(200).json(new ApiResponse(200, dashboardData, 'Admin dashboard fetched'));
});

module.exports = {
  getPatientDashboard,
  getDoctorDashboard,
  getAdminDashboard,
};
