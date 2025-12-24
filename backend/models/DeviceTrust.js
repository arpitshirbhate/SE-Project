const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const DeviceTrust = sequelize.define('DeviceTrust', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  deviceName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g., Chrome on Windows, Safari on iPhone'
  },
  deviceFingerprint: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Hash of device characteristics'
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isTrusted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  trustedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastUsedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '30 days from trusted date'
  }
}, {
  timestamps: true
});

DeviceTrust.belongsTo(User, { foreignKey: 'userId' });

module.exports = DeviceTrust;
