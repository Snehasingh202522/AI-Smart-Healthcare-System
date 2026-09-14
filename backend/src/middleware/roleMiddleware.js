const ApiError = require('../utils/ApiError');

const authorize = (...roles) => {
  return (req, res, next) => {
    // Security: Ensure user is authenticated
    if (!req.user) {
      return next(new ApiError(401, 'Not authorized'));
    }

    // Security: Validate user role
    if (!req.user.role) {
      return next(new ApiError(403, 'User role not defined'));
    }

    // Security: Check role authorization
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, `Role '${req.user.role}' is not authorized to access this resource`));
    }

    next();
  };
};

module.exports = { authorize };
