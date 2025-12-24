const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Employee = require('../models/Employee');
const CreditCardApplication = require('../models/CreditCardApplication');
const Loan = require('../models/Loan');
const LoanPayment = require('../models/LoanPayment');
const { sequelize } = require('../config/db');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ where: { email: req.user.email } });
    if (!employee || employee.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }
    req.employee = employee;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get dashboard statistics
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const totalCustomers = await User.count();
    const totalAccounts = await Account.count();
    const totalEmployees = await Employee.count();
    const totalTransactions = await Transaction.count();
    
    const totalBalance = await Account.sum('balance') || 0;
    
    const recentTransactions = await Transaction.findAll({
      include: [
        { model: Account, as: 'account', attributes: ['accountNumber', 'accountType'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      stats: {
        totalCustomers,
        totalAccounts,
        totalEmployees,
        totalTransactions,
        totalBalance
      },
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get all customers
router.get('/customers', auth, isAdmin, async (req, res) => {
  try {
    const customers = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Account,
          attributes: ['id', 'accountNumber', 'accountType', 'balance', 'status']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, customers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get all employees
router.get('/employees', auth, isAdmin, async (req, res) => {
  try {
    const employees = await Employee.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, employees });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Add new employee
router.post('/employees', auth, isAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, position, department, salary, hireDate, role } = req.body;

    const existingEmployee = await Employee.findOne({ where: { email } });
    if (existingEmployee) {
      return res.status(400).json({ success: false, message: 'Employee with this email already exists' });
    }

    const employee = await Employee.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      position,
      department,
      salary,
      hireDate,
      role: role || 'employee'
    });

    const { password: _, ...employeeData } = employee.toJSON();
    res.status(201).json({ success: true, message: 'Employee added successfully', employee: employeeData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update employee
router.put('/employees/:id', auth, isAdmin, async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, position, department, salary, status, role } = req.body;

    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (firstName) employee.firstName = firstName;
    if (lastName) employee.lastName = lastName;
    if (phoneNumber) employee.phoneNumber = phoneNumber;
    if (position) employee.position = position;
    if (department) employee.department = department;
    if (salary) employee.salary = salary;
    if (status) employee.status = status;
    if (role) employee.role = role;

    await employee.save();

    const { password: _, ...employeeData } = employee.toJSON();
    res.json({ success: true, message: 'Employee updated successfully', employee: employeeData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Delete employee
router.delete('/employees/:id', auth, isAdmin, async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    await employee.destroy();
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get all accounts with customer details
router.get('/accounts', auth, isAdmin, async (req, res) => {
  try {
    const accounts = await Account.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get all transactions
router.get('/transactions', auth, isAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      include: [
        { model: Account, as: 'account', attributes: ['accountNumber', 'accountType'] },
        { model: Account, as: 'toAccount', attributes: ['accountNumber'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update customer status
router.patch('/customers/:id/status', auth, isAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const customer = await User.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    customer.isActive = isActive;
    await customer.save();

    res.json({ success: true, message: 'Customer status updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update account status
router.patch('/accounts/:id/status', auth, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    const account = await Account.findByPk(req.params.id);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    account.status = status;
    await account.save();

    res.json({ success: true, message: 'Account status updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get all credit card applications
router.get('/credit-cards/applications', auth, isAdmin, async (req, res) => {
  try {
    const applications = await CreditCardApplication.findAll({
      include: [
        { model: User, attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      order: [['appliedAt', 'DESC']]
    });

    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get credit card applications by status
router.get('/credit-cards/applications/:status', auth, isAdmin, async (req, res) => {
  try {
    const applications = await CreditCardApplication.findAll({
      where: { status: req.params.status },
      include: [
        { model: User, attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      order: [['appliedAt', 'DESC']]
    });

    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Approve credit card application
router.patch('/credit-cards/:id/approve', auth, isAdmin, async (req, res) => {
  try {
    const { remarks } = req.body;
    
    const application = await CreditCardApplication.findByPk(req.params.id);
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.status = 'approved';
    application.reviewedBy = req.user.email;
    application.reviewedAt = new Date();
    application.remarks = remarks || 'Approved';
    await application.save();

    res.json({ success: true, message: 'Card application approved', application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Reject credit card application
router.patch('/credit-cards/:id/reject', auth, isAdmin, async (req, res) => {
  try {
    const { remarks } = req.body;
    
    const application = await CreditCardApplication.findByPk(req.params.id);
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.status = 'rejected';
    application.reviewedBy = req.user.email;
    application.reviewedAt = new Date();
    application.remarks = remarks || 'Rejected';
    await application.save();

    res.json({ success: true, message: 'Card application rejected', application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get all pending loans for admin approval
router.get('/loans/pending', auth, isAdmin, async (req, res) => {
  try {
    const loans = await Loan.findAll({
      where: { status: 'pending' },
      include: [
        { 
          model: User, 
          attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'] 
        },
        { 
          model: LoanPayment, 
          as: 'LoanPayments'
        }
      ],
      order: [['appliedAt', 'DESC']]
    });
    res.json({ success: true, loans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get all loans (admin)
router.get('/loans/all', auth, isAdmin, async (req, res) => {
  try {
    const loans = await Loan.findAll({
      include: [
        { 
          model: User, 
          attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'] 
        },
        { 
          model: LoanPayment, 
          as: 'LoanPayments'
        }
      ],
      order: [['appliedAt', 'DESC']]
    });
    res.json({ success: true, loans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Approve loan
router.patch('/loans/:id/approve', auth, isAdmin, async (req, res) => {
  try {
    const { remarks } = req.body;

    const loan = await Loan.findByPk(req.params.id);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    loan.status = 'active';
    loan.approvedAt = new Date();
    loan.approvedBy = req.user.id;
    loan.remarks = remarks || 'Approved by admin';
    await loan.save();

    res.json({ success: true, message: 'Loan approved successfully', loan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Reject loan
router.patch('/loans/:id/reject', auth, isAdmin, async (req, res) => {
  try {
    const { remarks } = req.body;

    const loan = await Loan.findByPk(req.params.id);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    loan.status = 'rejected';
    loan.approvedAt = new Date();
    loan.approvedBy = req.user.id;
    loan.remarks = remarks || 'Rejected by admin';
    await loan.save();

    res.json({ success: true, message: 'Loan rejected successfully', loan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
