
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Admin = require('../models/Admin');
const ApiError = require('../utils/ApiError');

const {
  generateToken,
  generateResetToken,
} = require('../services/tokenService');

const { sendResetPasswordEmail } = require('../services/emailService');
const crypto = require('crypto');

const createRoleProfile = async (user, role) => {
  switch (role) {
    case 'patient':
      await Patient.create({ user: user._id });
      break;

    case 'doctor':
      await Doctor.create({ user: user._id });
      break;

    case 'admin':
      await Admin.create({ user: user._id });
      break;

    default:
      throw new ApiError(400, 'Invalid role');
  }
};

const register = async (userData) => {
  const {
    firstName,
    lastName,
    email,
    password,
    role,
    phone,
  } = userData;

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  const user = await User.create({
    firstName,
    lastName,
    email: normalizedEmail,
    password,
    role,
    phone,
  });

  await createRoleProfile(user, role);

  const token = generateToken(user._id);

  return {
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
    },
    token,
  };
};

const login = async (email, password) => {
  // Normalize email before querying MongoDB
  const normalizedEmail = String(email || '')
    .trim()
    .toLowerCase();

  if (!normalizedEmail || !password) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const user = await User.findOne({
    email: normalizedEmail,
  }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(401, 'Account has been deactivated');
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user._id);

  return {
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
    },
    token,
  };
};

const forgotPassword = async (email) => {
  const normalizedEmail = String(email || '')
    .trim()
    .toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    throw new ApiError(404, 'No account found with this email');
  }

  const {
    resetToken,
    hashedToken,
    expireDate,
  } = generateResetToken();

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = expireDate;

  await user.save({
    validateBeforeSave: false,
  });

  await sendResetPasswordEmail(user.email, resetToken);

  return {
    message: 'Password reset email sent',
  };
};

const resetPassword = async (token, password) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  }).select('+password');

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  const authToken = generateToken(user._id);

  return {
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
    token: authToken,
  };
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
