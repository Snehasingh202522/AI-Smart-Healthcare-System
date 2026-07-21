const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/authService');
const User = require('../models/User');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(new ApiResponse(201, result, 'Registration successful'));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.status(200).json(new ApiResponse(200, result, 'Login successful'));
});

const logout = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, null, 'Logout successful'));
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.status(200).json(new ApiResponse(200, { user }, 'User fetched successfully'));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  res.status(200).json(new ApiResponse(200, result, result.message));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const result = await authService.resetPassword(token, password);
  res.status(200).json(new ApiResponse(200, result, 'Password reset successful'));
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
};
