const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try customer first
    let user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });

    // If not a customer, try employee
    if (!user) {
      const employee = await Employee.findByPk(decoded.userId, {
        attributes: { exclude: ['password'] }
      });

      if (!employee) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      // Mark as employee principal
      req.user = employee;
      req.isEmployee = true;
    } else {
      req.user = user;
      req.isEmployee = false;
    }
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

module.exports = auth;
