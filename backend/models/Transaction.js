const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Account = require('./Account');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  accountId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Accounts',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['deposit', 'withdrawal', 'transfer']]
    }
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  toAccountId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Accounts',
      key: 'id'
    }
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  balanceAfter: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'completed',
    validate: {
      isIn: [['pending', 'completed', 'failed']]
    }
  }
}, {
  timestamps: true
});

Transaction.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });
Transaction.belongsTo(Account, { foreignKey: 'toAccountId', as: 'toAccount' });

module.exports = Transaction;
