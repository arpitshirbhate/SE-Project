const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// Get all accounts for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const accounts = await Account.findAll({ where: { userId: req.user.id } });
    res.json({ success: true, accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get single account
router.get('/:id', auth, async (req, res) => {
  try {
    const account = await Account.findOne({ where: { id: req.params.id, userId: req.user.id } });
    
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    res.json({ success: true, account });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Create new account
router.post('/', auth, async (req, res) => {
  try {
    const { accountType, initialDeposit } = req.body;

    const account = await Account.create({
      accountType,
      balance: initialDeposit || 0,
      userId: req.user.id
    });

    // Create initial deposit transaction if amount > 0
    if (initialDeposit && initialDeposit > 0) {
      await Transaction.create({
        accountId: account.id,
        type: 'deposit',
        amount: initialDeposit,
        description: 'Initial deposit',
        balanceAfter: account.balance
      });
    }

    res.status(201).json({ success: true, message: 'Account created successfully', account });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update account status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const account = await Account.findOne({ where: { id: req.params.id, userId: req.user.id } });
    
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    account.status = status;
    await account.save();

    res.json({ success: true, message: 'Account status updated', account });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get account balance
router.get('/:id/balance', auth, async (req, res) => {
  try {
    const account = await Account.findOne({ where: { id: req.params.id, userId: req.user.id } });
    
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    res.json({ success: true, balance: account.balance, currency: account.currency });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
