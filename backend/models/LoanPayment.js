const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Loan = require('./Loan');

const LoanPayment = sequelize.define('LoanPayment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  loanId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Loans',
      key: 'id'
    }
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  paidAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  paidDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'paid', 'overdue', 'partial']]
    }
  },
  penaltyCharged: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  daysOverdue: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true
});

LoanPayment.belongsTo(Loan, { foreignKey: 'loanId' });

module.exports = LoanPayment;
