const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || '7d'
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const generateResetToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

module.exports = {
  generateToken,
  verifyToken,
  generateResetToken
};
