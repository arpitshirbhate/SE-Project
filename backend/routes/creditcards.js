const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const CreditCardApplication = require('../models/CreditCardApplication');
const User = require('../models/User');
const Employee = require('../models/Employee');

// Get all card applications for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const applications = await CreditCardApplication.findAll({
      where: { userId: req.user.id },
      order: [['appliedAt', 'DESC']]
    });
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get single card application
router.get('/:id', auth, async (req, res) => {
  try {
    const application = await CreditCardApplication.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Apply for credit card
router.post('/', auth, async (req, res) => {
  try {
    const { cardType, cardName, annualIncome, employmentStatus } = req.body;

    // Validate required fields
    if (!cardType || !cardName || !annualIncome || !employmentStatus) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if user already has pending application for same card type
    const existingApp = await CreditCardApplication.findOne({
      where: { userId: req.user.id, cardType, status: 'pending' }
    });

    if (existingApp) {
      return res.status(400).json({ success: false, message: `You already have a pending application for ${cardType} card` });
    }

    const application = await CreditCardApplication.create({
      userId: req.user.id,
      cardType,
      cardName,
      annualIncome,
      employmentStatus,
      creditLimit: calculateCreditLimit(annualIncome, employmentStatus)
    });

    res.status(201).json({ success: true, message: 'Card application submitted successfully', application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Cancel application (user can only cancel pending applications)
router.delete('/:id', auth, async (req, res) => {
  try {
    const application = await CreditCardApplication.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Can only cancel pending applications' });
    }

    await application.destroy();
    res.json({ success: true, message: 'Application cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Helper function to calculate credit limit based on income and employment
function calculateCreditLimit(annualIncome, employmentStatus) {
  let baseLimit = annualIncome * 0.3; // 30% of annual income

  if (employmentStatus === 'self-employed') {
    baseLimit *= 0.8; // 20% reduction for self-employed
  } else if (employmentStatus === 'student') {
    baseLimit *= 0.5; // 50% reduction for students
  }

  return Math.min(baseLimit, 50000); // Cap at $50,000
}

module.exports = router;
