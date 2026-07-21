const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { jwtSecret, jwtExpire, jwtResetExpire } = require('../config/env');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, jwtSecret, { expiresIn: jwtExpire });
};

const generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expireDate = new Date(Date.now() + parseInt(jwtResetExpire) * 60 * 1000);
  return { resetToken, hashedToken, expireDate };
};

const verifyToken = (token) => {
  return jwt.verify(token, jwtSecret);
};

module.exports = {
  generateToken,
  generateResetToken,
  verifyToken,
};
