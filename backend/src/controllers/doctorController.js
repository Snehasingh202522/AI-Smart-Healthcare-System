const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const Doctor = require('../models/Doctor');
const { calculateDistance } = require('../utils/haversine');
const { getSpecializationsForDiseases } = require('../utils/diseaseSpecializationMap');

const formatDoctorResponse = (doctor, distance, specializationMatch) => {
  const user = doctor.user;

  return {
    _id: doctor._id,
    user: user ? {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
    } : null,
    name: user ? `${user.firstName} ${user.lastName}` : 'Unknown Doctor',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    specialization: doctor.specialization,
    experience: doctor.experience,
    rating: doctor.rating,
    hospital: doctor.hospital,
    consultationFee: doctor.consultationFee,
    city: doctor.city,
    latitude: doctor.latitude,
    longitude: doctor.longitude,
    availability: doctor.availability,
    distance: Math.round(distance * 100) / 100,
    specializationMatch,
    diseasesTreated: doctor.diseasesTreated,
    isVerified: doctor.isVerified,
  };
};

const sortDoctors = (doctors) =>
  doctors.sort((a, b) => {
    if (a.specializationMatch !== b.specializationMatch) {
      return b.specializationMatch - a.specializationMatch;
    }
    if (a.distance !== b.distance) {
      return a.distance - b.distance;
    }
    if (b.rating !== a.rating) {
      return b.rating - a.rating;
    }
    return b.experience - a.experience;
  });

const recommendDoctors = asyncHandler(async (req, res) => {
  const { disease, diseases, latitude, longitude, city, limit = 10 } = req.body;

  const diseaseList = diseases?.length
    ? diseases
    : disease
    ? [disease]
    : [];

  if (diseaseList.length === 0) {
    throw new ApiError(400, 'At least one disease is required for recommendation');
  }

  if (latitude === undefined || longitude === undefined) {
    throw new ApiError(400, 'Patient location (latitude and longitude) is required');
  }

  const matchedSpecializations = getSpecializationsForDiseases(diseaseList);

  const query = { isVerified: true };
  if (city) {
    query.city = new RegExp(city, 'i');
  }

  const doctors = await Doctor.find(query).populate('user', 'firstName lastName email phone avatar');

  const recommended = doctors.map((doctor) => {
    const distance = calculateDistance(
      parseFloat(latitude),
      parseFloat(longitude),
      doctor.latitude,
      doctor.longitude
    );

    const specializationMatch = matchedSpecializations.some(
      (spec) => spec.toLowerCase() === doctor.specialization.toLowerCase()
    )
      ? 1
      : 0;

    return formatDoctorResponse(doctor, distance, specializationMatch);
  });

  const sorted = sortDoctors(recommended).slice(0, parseInt(limit, 10));

  res.status(200).json(
    new ApiResponse(
      200,
      {
        doctors: sorted,
        matchedSpecializations,
        searchCriteria: { diseases: diseaseList, latitude, longitude, city },
        total: sorted.length,
      },
      'Doctors recommended successfully'
    )
  );
});

const getAllDoctors = asyncHandler(async (req, res) => {
  const { specialization, city, availability } = req.query;

  const query = { isVerified: true };
  if (specialization) query.specialization = new RegExp(specialization, 'i');
  if (city) query.city = new RegExp(city, 'i');
  if (availability) query.availability = availability;

  const doctors = await Doctor.find(query)
    .populate('user', 'firstName lastName email phone avatar')
    .sort({ rating: -1, experience: -1 });

  const formatted = doctors.map((doctor) =>
    formatDoctorResponse(doctor, 0, 0)
  );

  res.status(200).json(
    new ApiResponse(200, { doctors: formatted, total: formatted.length }, 'Doctors fetched successfully')
  );
});

const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate(
    'user',
    'firstName lastName email phone avatar'
  );

  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  res.status(200).json(
    new ApiResponse(200, formatDoctorResponse(doctor, 0, 0), 'Doctor fetched successfully')
  );
});

module.exports = {
  recommendDoctors,
  getAllDoctors,
  getDoctorById,
};
