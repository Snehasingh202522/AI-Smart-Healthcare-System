const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { jwtSecret, jwtExpire, jwtResetExpire } = require('../config/env');

const parseExpiryToMs = (expiryStr) => {
  if (!expiryStr) return 15 * 60 * 1000;
  if (typeof expiryStr === 'number') return expiryStr;
  const match = String(expiryStr).trim().match(/^(\d+)([smhd])?$/i);
  if (!match) return (parseInt(expiryStr, 10) || 15) * 60 * 1000;
  const num = parseInt(match[1], 10);
  const unit = (match[2] || 'm').toLowerCase();
  switch (unit) {
    case 's': return num * 1000;
    case 'm': return num * 60 * 1000;
    case 'h': return num * 60 * 60 * 1000;
    case 'd': return num * 24 * 60 * 60 * 1000;
    default: return num * 60 * 1000;
  }
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, jwtSecret, { expiresIn: jwtExpire });
};

const generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expireDate = new Date(Date.now() + parseExpiryToMs(jwtResetExpire));
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
