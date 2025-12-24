const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Account = require('./Account');

const Transfer = sequelize.define('Transfer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  fromAccountId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Accounts',
      key: 'id'
    }
  },
  toAccountId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Accounts',
      key: 'id'
    }
  },
  toUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 1
    }
  },
  transferType: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['account-to-account', 'user-to-user', 'external']]
    }
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  referenceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'completed',
    validate: {
      isIn: [['pending', 'completed', 'failed', 'cancelled']]
    }
  },
  transferredAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true
});

Transfer.belongsTo(Account, { as: 'fromAccount', foreignKey: 'fromAccountId' });
Transfer.belongsTo(Account, { as: 'toAccount', foreignKey: 'toAccountId' });
Transfer.belongsTo(User, { as: 'toUser', foreignKey: 'toUserId' });

module.exports = Transfer;
