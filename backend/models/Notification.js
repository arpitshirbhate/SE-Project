const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Notification = sequelize.define('Notification', {
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
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['transaction', 'loan', 'card', 'alert', 'payment-due', 'system']]
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  relatedId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  relatedType: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['transaction', 'loan', 'card', 'transfer', null]]
    }
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  channels: {
    type: DataTypes.JSON,
    defaultValue: ['in-app'],
    comment: 'Array of channels: in-app, email, sms'
  }
}, {
  timestamps: true
});

Notification.belongsTo(User, { foreignKey: 'userId' });

module.exports = Notification;
