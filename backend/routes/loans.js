const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Loan = require('../models/Loan');
const LoanPayment = require('../models/LoanPayment');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// Calculate EMI
function calculateEMI(principal, annualRate, months) {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return principal / months;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
             (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(emi * 100) / 100;
}

// Get all loans for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const loans = await Loan.findAll({
      where: { userId: req.user.id },
      include: [{ model: LoanPayment, as: 'LoanPayments' }],
      order: [['appliedAt', 'DESC']]
    });
    res.json({ success: true, loans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get single loan with payment schedule
router.get('/:id', auth, async (req, res) => {
  try {
    const loan = await Loan.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [
        { 
          model: LoanPayment, 
          order: [['dueDate', 'ASC']]
        }
      ]
    });

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    res.json({ success: true, loan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Apply for loan
router.post('/', auth, async (req, res) => {
  try {
    const { loanType, principalAmount, tenureMonths, interestRate } = req.body;

    // Validate input
    if (!loanType || !principalAmount || !tenureMonths) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Calculate EMI
    const rate = interestRate || 8.5;
    const monthlyEmi = calculateEMI(parseFloat(principalAmount), rate, tenureMonths);

    const loan = await Loan.create({
      userId: req.user.id,
      loanType,
      principalAmount: parseFloat(principalAmount),
      interestRate: rate,
      tenureMonths,
      monthlyEmi,
      outstandingBalance: parseFloat(principalAmount)
    });

    // Create payment schedule
    let dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + 1);
    dueDate.setDate(1);

    const payments = [];
    for (let i = 0; i < tenureMonths; i++) {
      payments.push({
        loanId: loan.id,
        dueDate: new Date(dueDate),
        amount: monthlyEmi,
        status: 'pending'
      });
      dueDate.setMonth(dueDate.getMonth() + 1);
    }

    await LoanPayment.bulkCreate(payments);

    res.status(201).json({ 
      success: true, 
      message: 'Loan application submitted successfully', 
      loan 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Make loan payment
router.post('/:id/payment', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }

    const loan = await Loan.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    if (loan.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Loan is not active' });
    }

    // Get pending payment
    const payment = await LoanPayment.findOne({
      where: { loanId: loan.id, status: ['pending', 'overdue'] },
      order: [['dueDate', 'ASC']]
    });

    if (!payment) {
      return res.status(400).json({ success: false, message: 'No pending payments' });
    }

    const amountPaid = parseFloat(amount);
    payment.paidAmount = amountPaid;
    payment.paidDate = new Date();
    payment.status = amountPaid >= payment.amount ? 'paid' : 'partial';
    await payment.save();

    // Update loan balance
    loan.outstandingBalance -= amountPaid;
    if (loan.outstandingBalance <= 0) {
      loan.status = 'closed';
      loan.closedAt = new Date();
    }
    await loan.save();

    res.json({ 
      success: true, 
      message: 'Payment recorded successfully',
      remainingBalance: loan.outstandingBalance 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get all pending loans (for admin approval)
router.get('/admin/pending', auth, async (req, res) => {
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

// Approve loan (admin)
router.patch('/admin/:id/approve', auth, async (req, res) => {
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

// Reject loan (admin)
router.patch('/admin/:id/reject', auth, async (req, res) => {
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
