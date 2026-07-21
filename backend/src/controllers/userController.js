const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Admin = require('../models/Admin');
const ApiError = require('../utils/ApiError');

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  let profile = null;
  switch (user.role) {
    case 'patient':
      profile = await Patient.findOne({ user: user._id });
      break;
    case 'doctor':
      profile = await Doctor.findOne({ user: user._id });
      break;
    case 'admin':
      profile = await Admin.findOne({ user: user._id });
      break;
  }

  res.status(200).json(
    new ApiResponse(200, { user, profile }, 'Profile fetched successfully')
  );
});

const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone) user.phone = phone;

  await user.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
      },
      'Profile updated successfully'
    )
  );
});

module.exports = {
  getProfile,
  updateProfile,
};
