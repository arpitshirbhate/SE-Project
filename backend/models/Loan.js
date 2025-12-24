const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Loan = sequelize.define('Loan', {
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
  loanType: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['personal', 'home', 'auto', 'business', 'education']]
    }
  },
  principalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 1000,
      max: 1000000
    }
  },
  interestRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 8.5
  },
  tenureMonths: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 6,
      max: 360
    }
  },
  monthlyEmi: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  outstandingBalance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'active', 'rejected', 'closed', 'defaulted']]
    }
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  disbursedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  closedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  approvedBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  nextDueDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true
});

Loan.belongsTo(User, { foreignKey: 'userId' });

module.exports = Loan;
