const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

const createPrescription = asyncHandler(async (req, res) => {
  const { patient, appointment, medicines, diagnosis, notes, followUpDate } = req.body;
  const doctorId = req.user._id;

  // Validate required fields
  if (!patient) {
    throw new ApiError(400, 'Patient ID is required');
  }
  if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
    throw new ApiError(400, 'At least one medicine is required');
  }
  if (!diagnosis) {
    throw new ApiError(400, 'Diagnosis is required');
  }

  // Verify patient exists and is a valid User
  const patientUser = await User.findById(patient);
  if (!patientUser) {
    throw new ApiError(404, 'Patient not found');
  }
  if (patientUser.role !== 'patient') {
    throw new ApiError(400, 'Invalid patient ID');
  }

  // Verify appointment belongs to this doctor and patient if appointment is provided
  if (appointment) {
    const apt = await Appointment.findById(appointment);
    if (!apt) {
      throw new ApiError(404, 'Appointment not found');
    }
    if (apt.doctor.toString() !== doctorId.toString()) {
      throw new ApiError(403, 'Not authorized to create prescription for this appointment');
    }
    if (apt.patient.toString() !== patient.toString()) {
      throw new ApiError(400, 'Patient does not match the appointment');
    }
  } else {
    // If no appointment, verify that this doctor has seen this patient before
    const hasPreviousAppointment = await Appointment.exists({
      doctor: doctorId,
      patient: patient,
      status: { $in: ['completed', 'scheduled', 'confirmed'] }
    });
    
    if (!hasPreviousAppointment) {
      throw new ApiError(403, 'Can only create prescriptions for patients you have an appointment with');
    }
  }

  const prescription = await Prescription.create({
    patient,
    doctor: doctorId,
    appointment,
    medicines,
    diagnosis,
    notes,
    followUpDate,
  });

  await prescription.populate('doctor', 'firstName lastName');
  await prescription.populate('patient', 'firstName lastName');

  // Create notification for patient
  try {
    const Notification = require('../models/Notification');
    await Notification.create({
      recipient: patient,
      type: 'prescription_created',
      title: 'New Prescription Available',
      message: `Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName} has created a new prescription for you`,
      relatedPrescription: prescription._id,
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }

  res.status(201).json(new ApiResponse(201, prescription, 'Prescription created successfully'));
});

const getDoctorPrescriptions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  // Resource-level authorization: doctors can only see their own prescriptions
  const query = { doctor: req.user._id };
  const skip = (Number(page) - 1) * Number(limit);

  const prescriptions = await Prescription.find(query)
    .populate('patient', 'firstName lastName email phone')
    .populate('appointment', 'date time reason')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Prescription.countDocuments(query);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        prescriptions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
        },
      },
      'Prescriptions fetched successfully'
    )
  );
});

const getPatientPrescriptions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  // Resource-level authorization: patients can only see their own prescriptions
  const query = { patient: req.user._id };
  const skip = (Number(page) - 1) * Number(limit);

  const prescriptions = await Prescription.find(query)
    .populate('doctor', 'firstName lastName specialization')
    .populate('appointment', 'date time reason')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Prescription.countDocuments(query);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        prescriptions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
        },
      },
      'Prescriptions fetched successfully'
    )
  );
});

const getPrescriptionById = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate('doctor', 'firstName lastName specialization email')
    .populate('patient', 'firstName lastName email phone dateOfBirth bloodGroup')
    .populate('appointment', 'date time reason');

  if (!prescription) {
    throw new ApiError(404, 'Prescription not found');
  }

  if (
    req.user.role === 'patient' &&
    prescription.patient._id.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, 'Not authorized');
  }

  if (
    req.user.role === 'doctor' &&
    prescription.doctor._id.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, 'Not authorized');
  }

  res.status(200).json(new ApiResponse(200, prescription, 'Prescription fetched'));
});

const updatePrescription = asyncHandler(async (req, res) => {
  const { medicines, diagnosis, notes, followUpDate } = req.body;

  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    throw new ApiError(404, 'Prescription not found');
  }

  if (prescription.doctor.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to update this prescription');
  }

  if (medicines) prescription.medicines = medicines;
  if (diagnosis) prescription.diagnosis = diagnosis;
  if (notes !== undefined) prescription.notes = notes;
  if (followUpDate !== undefined) prescription.followUpDate = followUpDate;

  await prescription.save();

  await prescription.populate('doctor', 'firstName lastName');
  await prescription.populate('patient', 'firstName lastName');

  res.status(200).json(new ApiResponse(200, prescription, 'Prescription updated'));
});

const deletePrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    throw new ApiError(404, 'Prescription not found');
  }

  if (prescription.doctor.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to delete this prescription');
  }

  await prescription.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Prescription deleted'));
});

module.exports = {
  createPrescription,
  getDoctorPrescriptions,
  getPatientPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
};
