const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const CreditCardApplication = sequelize.define('CreditCardApplication', {
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
  cardType: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['classic', 'gold', 'platinum', 'business']]
    }
  },
  cardName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  annualIncome: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  employmentStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['employed', 'self-employed', 'retired', 'student']]
    }
  },
  creditLimit: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'approved', 'rejected']]
    }
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  reviewedBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

CreditCardApplication.belongsTo(User, { foreignKey: 'userId' });

module.exports = CreditCardApplication;
