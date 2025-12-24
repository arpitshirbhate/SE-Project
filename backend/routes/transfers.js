const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transfer = require('../models/Transfer');
const Account = require('../models/Account');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { v4: uuidv4 } = require('uuid');

// Generate unique reference number
function generateReference() {
  return `TRF${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

// Get all transfers for user
router.get('/', auth, async (req, res) => {
  try {
    const transfers = await Transfer.findAll({
      where: {
        toUserId: req.user.id
      },
      include: [
        { model: Account, as: 'fromAccount', attributes: ['id', 'accountNumber', 'accountType'] },
        { model: Account, as: 'toAccount', attributes: ['id', 'accountNumber', 'accountType'] }
      ],
      order: [['transferredAt', 'DESC']]
    });

    res.json({ success: true, transfers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Transfer between own accounts
router.post('/own-accounts', auth, async (req, res) => {
  try {
    const { fromAccountId, toAccountId, amount, description } = req.body;

    if (!fromAccountId || !toAccountId || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid transfer details' });
    }

    // Verify both accounts belong to user
    const fromAccount = await Account.findOne({
      where: { id: fromAccountId, userId: req.user.id }
    });

    const toAccount = await Account.findOne({
      where: { id: toAccountId, userId: req.user.id }
    });

    if (!fromAccount || !toAccount) {
      return res.status(400).json({ success: false, message: 'Account not found' });
    }

    if (fromAccount.status !== 'active' || toAccount.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Account is not active' });
    }

    const transferAmount = parseFloat(amount);
    if (fromAccount.balance < transferAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Process transfer
    fromAccount.balance -= transferAmount;
    toAccount.balance += transferAmount;

    await fromAccount.save();
    await toAccount.save();

    // Create transfer record
    const transfer = await Transfer.create({
      fromAccountId,
      toAccountId,
      toUserId: req.user.id,
      amount: transferAmount,
      transferType: 'account-to-account',
      description: description || 'Own account transfer',
      referenceNumber: generateReference(),
      status: 'completed'
    });

    // Create transactions
    await Transaction.create({
      accountId: fromAccountId,
      type: 'debit',
      amount: transferAmount,
      description: `Transfer to ${toAccount.accountNumber}`,
      balanceAfter: fromAccount.balance,
      referenceId: transfer.id
    });

    await Transaction.create({
      accountId: toAccountId,
      type: 'credit',
      amount: transferAmount,
      description: `Transfer from ${fromAccount.accountNumber}`,
      balanceAfter: toAccount.balance,
      referenceId: transfer.id
    });

    res.status(201).json({
      success: true,
      message: 'Transfer completed successfully',
      transfer,
      referenceNumber: transfer.referenceNumber
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Transfer to another user
router.post('/to-user', auth, async (req, res) => {
  try {
    const { fromAccountId, recipientEmail, amount, description } = req.body;

    if (!fromAccountId || !recipientEmail || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid transfer details' });
    }

    // Verify sender's account
    const fromAccount = await Account.findOne({
      where: { id: fromAccountId, userId: req.user.id }
    });

    if (!fromAccount || fromAccount.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Account not found or not active' });
    }

    // Find recipient
    const recipient = await User.findOne({ where: { email: recipientEmail } });
    if (!recipient) {
      return res.status(400).json({ success: false, message: 'Recipient not found' });
    }

    if (recipient.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot transfer to yourself' });
    }

    // Get recipient's primary account
    const toAccount = await Account.findOne({
      where: { userId: recipient.id, accountType: 'savings' }
    });

    if (!toAccount || toAccount.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Recipient account not found or not active' });
    }

    const transferAmount = parseFloat(amount);
    if (fromAccount.balance < transferAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Process transfer
    fromAccount.balance -= transferAmount;
    toAccount.balance += transferAmount;

    await fromAccount.save();
    await toAccount.save();

    // Create transfer record
    const transfer = await Transfer.create({
      fromAccountId,
      toAccountId: toAccount.id,
      toUserId: recipient.id,
      amount: transferAmount,
      transferType: 'user-to-user',
      description: description || `Transfer to ${recipient.firstName} ${recipient.lastName}`,
      referenceNumber: generateReference(),
      status: 'completed'
    });

    // Create transactions
    await Transaction.create({
      accountId: fromAccountId,
      type: 'debit',
      amount: transferAmount,
      description: `Transfer to ${recipient.firstName} ${recipient.lastName}`,
      balanceAfter: fromAccount.balance,
      referenceId: transfer.id
    });

    await Transaction.create({
      accountId: toAccount.id,
      type: 'credit',
      amount: transferAmount,
      description: `Transfer from ${req.user.firstName} ${req.user.lastName}`,
      balanceAfter: toAccount.balance,
      referenceId: transfer.id
    });

    res.status(201).json({
      success: true,
      message: 'Transfer completed successfully',
      transfer,
      referenceNumber: transfer.referenceNumber
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
