// This file sets up all model associations after all models are loaded
const User = require('./User');
const Account = require('./Account');
const Transaction = require('./Transaction');
const Employee = require('./Employee');
const CreditCardApplication = require('./CreditCardApplication');
const Loan = require('./Loan');
const LoanPayment = require('./LoanPayment');
const Transfer = require('./Transfer');
const Notification = require('./Notification');
const AuditLog = require('./AuditLog');
const DeviceTrust = require('./DeviceTrust');

// Set up associations
Loan.hasMany(LoanPayment, { foreignKey: 'loanId', as: 'LoanPayments' });
LoanPayment.belongsTo(Loan, { foreignKey: 'loanId' });

module.exports = {
  User,
  Account,
  Transaction,
  Employee,
  CreditCardApplication,
  Loan,
  LoanPayment,
  Transfer,
  Notification,
  AuditLog,
  DeviceTrust
};
