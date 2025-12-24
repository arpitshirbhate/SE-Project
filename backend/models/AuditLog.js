const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'User or Employee ID'
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g., LOGIN, TRANSFER, LOAN_APPLICATION, ACCOUNT_UPDATE'
  },
  actionType: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT']]
    }
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['User', 'Account', 'Transaction', 'Loan', 'CreditCard', 'Transfer', 'Employee']]
    }
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  oldValue: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Previous value for updates'
  },
  newValue: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'New value after change'
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'success',
    validate: {
      isIn: [['success', 'failed', 'warning']]
    }
  }
}, {
  timestamps: true
});

module.exports = AuditLog;
