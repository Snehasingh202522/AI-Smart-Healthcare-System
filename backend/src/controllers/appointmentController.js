const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

const createAppointment = asyncHandler(async (req, res) => {
  const { doctor, date, time, reason, notes, symptoms, priority } = req.body;
  const patientId = req.user._id;

  const doctorUser = await User.findById(doctor);
  if (!doctorUser || doctorUser.role !== 'doctor') {
    throw new ApiError(404, 'Doctor not found');
  }

  const appointmentDate = new Date(`${date}T${time}`);
  const existingAppointment = await Appointment.findOne({
    doctor,
    date: appointmentDate,
    status: { $in: ['scheduled', 'completed'] },
  });

  if (existingAppointment) {
    throw new ApiError(400, 'Doctor already has an appointment at this time');
  }

  const appointment = await Appointment.create({
    patient: patientId,
    doctor,
    date: appointmentDate,
    time,
    reason,
    notes,
    symptoms: symptoms || [],
    priority: priority || 'medium',
  });

  await appointment.populate('doctor', 'firstName lastName email phone specialty');
  await appointment.populate('patient', 'firstName lastName email phone');

  res.status(201).json(new ApiResponse(201, appointment, 'Appointment booked successfully'));
});

const getPatientAppointments = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const patientId = req.user._id;

  const query = { patient: patientId };
  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;
  const appointments = await Appointment.find(query)
    .populate('doctor', 'firstName lastName email phone specialty')
    .sort({ date: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Appointment.countDocuments(query);

  res.status(200).json(
    new ApiResponse(
      200,
      { appointments, pagination: { page: parseInt(page), limit: parseInt(limit), total } },
      'Appointments fetched successfully'
    )
  );
});

const getDoctorAppointments = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const doctorId = req.user._id;

  const query = { doctor: doctorId };
  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;
  const appointments = await Appointment.find(query)
    .populate('patient', 'firstName lastName email phone dateOfBirth bloodGroup')
    .sort({ date: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Appointment.countDocuments(query);

  res.status(200).json(
    new ApiResponse(
      200,
      { appointments, pagination: { page: parseInt(page), limit: parseInt(limit), total } },
      'Appointments fetched successfully'
    )
  );
});

const getAppointmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;

  const appointment = await Appointment.findById(id)
    .populate('doctor', 'firstName lastName email phone specialty')
    .populate('patient', 'firstName lastName email phone dateOfBirth bloodGroup');

  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  if (userRole === 'patient' && appointment.patient._id.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to access this appointment');
  }

  if (userRole === 'doctor' && appointment.doctor._id.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to access this appointment');
  }

  res.status(200).json(new ApiResponse(200, appointment, 'Appointment fetched successfully'));
});

const updateAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;
  const { date, time, reason, notes, symptoms, priority } = req.body;

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  if (userRole === 'patient' && appointment.patient.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to update this appointment');
  }

  if (userRole === 'doctor' && appointment.doctor.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to update this appointment');
  }

  if (date && time) {
    const newDate = new Date(`${date}T${time}`);
    const existingAppointment = await Appointment.findOne({
      doctor: appointment.doctor,
      date: newDate,
      status: { $in: ['scheduled', 'completed'] },
      _id: { $ne: id },
    });

    if (existingAppointment) {
      throw new ApiError(400, 'Doctor already has an appointment at this time');
    }
    appointment.date = newDate;
  }

  if (reason) appointment.reason = reason;
  if (notes !== undefined) appointment.notes = notes;
  if (symptoms) appointment.symptoms = symptoms;
  if (priority) appointment.priority = priority;

  await appointment.save();
  await appointment.populate('doctor', 'firstName lastName email phone specialty');
  await appointment.populate('patient', 'firstName lastName email phone');

  res.status(200).json(new ApiResponse(200, appointment, 'Appointment updated successfully'));
});

const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user._id;
  const userRole = req.user.role;

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  if (userRole === 'patient' && appointment.patient.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to update this appointment');
  }

  if (userRole === 'doctor' && appointment.doctor.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to update this appointment');
  }

  appointment.status = status;
  await appointment.save();
  await appointment.populate('doctor', 'firstName lastName email phone specialty');
  await appointment.populate('patient', 'firstName lastName email phone');

  res.status(200).json(new ApiResponse(200, appointment, 'Appointment status updated successfully'));
});

const cancelAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  if (appointment.patient.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to cancel this appointment');
  }

  if (appointment.status === 'cancelled' || appointment.status === 'completed') {
    throw new ApiError(400, 'Cannot cancel a cancelled or completed appointment');
  }

  appointment.status = 'cancelled';
  await appointment.save();
  await appointment.populate('doctor', 'firstName lastName email phone specialty');
  await appointment.populate('patient', 'firstName lastName email phone');

  res.status(200).json(new ApiResponse(200, appointment, 'Appointment cancelled successfully'));
});

const getUpcomingAppointments = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userRole = req.user.role;

  const query = {
    date: { $gte: new Date() },
    status: 'scheduled',
  };

  if (userRole === 'patient') {
    query.patient = userId;
  } else if (userRole === 'doctor') {
    query.doctor = userId;
  }

  const appointments = await Appointment.find(query)
    .populate('doctor', 'firstName lastName email phone specialty')
    .populate('patient', 'firstName lastName email phone')
    .sort({ date: 1 })
    .limit(5);

  res.status(200).json(new ApiResponse(200, appointments, 'Upcoming appointments fetched successfully'));
});

module.exports = {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAppointmentById,
  updateAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getUpcomingAppointments,
};
