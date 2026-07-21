const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const MedicalReport = require('../models/MedicalReport');
const User = require('../models/User');

const uploadReport = asyncHandler(async (req, res) => {
  const { title, reportType, fileUrl, fileName, fileSize, mimeType, description, doctor, reportDate, isConfidential, tags } = req.body;
  const patientId = req.user._id;

  if (doctor) {
    const doctorUser = await User.findById(doctor);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      throw new ApiError(404, 'Doctor not found');
    }
  }

  const report = await MedicalReport.create({
    patient: patientId,
    title,
    reportType,
    fileUrl,
    fileName,
    fileSize,
    mimeType,
    description,
    uploadedBy: patientId,
    doctor,
    reportDate: reportDate || new Date(),
    isConfidential: isConfidential || false,
    tags: tags || [],
  });

  await report.populate('doctor', 'firstName lastName email phone specialty');
  await report.populate('uploadedBy', 'firstName lastName email');

  res.status(201).json(new ApiResponse(201, report, 'Medical report uploaded successfully'));
});

const getPatientReports = asyncHandler(async (req, res) => {
  const { reportType, page = 1, limit = 10 } = req.query;
  const patientId = req.user._id;

  const query = { patient: patientId };
  if (reportType) {
    query.reportType = reportType;
  }

  const skip = (page - 1) * limit;
  const reports = await MedicalReport.find(query)
    .populate('doctor', 'firstName lastName email phone specialty')
    .populate('uploadedBy', 'firstName lastName email')
    .sort({ reportDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await MedicalReport.countDocuments(query);

  res.status(200).json(
    new ApiResponse(
      200,
      { reports, pagination: { page: parseInt(page), limit: parseInt(limit), total } },
      'Medical reports fetched successfully'
    )
  );
});

const getDoctorReports = asyncHandler(async (req, res) => {
  const { reportType, page = 1, limit = 10 } = req.query;
  const doctorId = req.user._id;

  const query = { doctor: doctorId };
  if (reportType) {
    query.reportType = reportType;
  }

  const skip = (page - 1) * limit;
  const reports = await MedicalReport.find(query)
    .populate('patient', 'firstName lastName email phone dateOfBirth bloodGroup')
    .populate('uploadedBy', 'firstName lastName email')
    .sort({ reportDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await MedicalReport.countDocuments(query);

  res.status(200).json(
    new ApiResponse(
      200,
      { reports, pagination: { page: parseInt(page), limit: parseInt(limit), total } },
      'Medical reports fetched successfully'
    )
  );
});

const getReportById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;

  const report = await MedicalReport.findById(id)
    .populate('doctor', 'firstName lastName email phone specialty')
    .populate('uploadedBy', 'firstName lastName email')
    .populate('patient', 'firstName lastName email phone dateOfBirth bloodGroup');

  if (!report) {
    throw new ApiError(404, 'Medical report not found');
  }

  if (userRole === 'patient' && report.patient._id.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to access this report');
  }

  if (userRole === 'doctor' && report.doctor && report.doctor._id.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to access this report');
  }

  res.status(200).json(new ApiResponse(200, report, 'Medical report fetched successfully'));
});

const updateReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;
  const { title, reportType, description, doctor, reportDate, isConfidential, tags } = req.body;

  const report = await MedicalReport.findById(id);
  if (!report) {
    throw new ApiError(404, 'Medical report not found');
  }

  if (userRole === 'patient' && report.patient.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to update this report');
  }

  if (userRole === 'doctor' && report.doctor.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to update this report');
  }

  if (doctor) {
    const doctorUser = await User.findById(doctor);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      throw new ApiError(404, 'Doctor not found');
    }
    report.doctor = doctor;
  }

  if (title) report.title = title;
  if (reportType) report.reportType = reportType;
  if (description !== undefined) report.description = description;
  if (reportDate) report.reportDate = reportDate;
  if (isConfidential !== undefined) report.isConfidential = isConfidential;
  if (tags) report.tags = tags;

  await report.save();
  await report.populate('doctor', 'firstName lastName email phone specialty');
  await report.populate('uploadedBy', 'firstName lastName email');

  res.status(200).json(new ApiResponse(200, report, 'Medical report updated successfully'));
});

const deleteReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;

  const report = await MedicalReport.findById(id);
  if (!report) {
    throw new ApiError(404, 'Medical report not found');
  }

  if (userRole === 'patient' && report.patient.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to delete this report');
  }

  if (userRole === 'doctor' && report.doctor.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to delete this report');
  }

  await MedicalReport.findByIdAndDelete(id);

  res.status(200).json(new ApiResponse(200, null, 'Medical report deleted successfully'));
});

const getRecentReports = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userRole = req.user.role;

  const query = {};

  if (userRole === 'patient') {
    query.patient = userId;
  } else if (userRole === 'doctor') {
    query.doctor = userId;
  }

  const reports = await MedicalReport.find(query)
    .populate('doctor', 'firstName lastName email phone specialty')
    .populate('uploadedBy', 'firstName lastName email')
    .sort({ reportDate: -1 })
    .limit(5);

  res.status(200).json(new ApiResponse(200, reports, 'Recent reports fetched successfully'));
});

module.exports = {
  uploadReport,
  getPatientReports,
  getDoctorReports,
  getReportById,
  updateReport,
  deleteReport,
  getRecentReports,
};
