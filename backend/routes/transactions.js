const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const { sequelize } = require('../config/db');

// Get all transactions for user's accounts
router.get('/', auth, async (req, res) => {
  try {
    const accounts = await Account.findAll({ where: { userId: req.user.id } });
    const accountIds = accounts.map(acc => acc.id);

    const transactions = await Transaction.findAll({
      where: { accountId: accountIds },
      include: [
        { model: Account, as: 'account', attributes: ['accountNumber', 'accountType'] },
        { model: Account, as: 'toAccount', attributes: ['accountNumber'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get transactions for specific account
router.get('/account/:accountId', auth, async (req, res) => {
  try {
    const account = await Account.findOne({ where: { id: req.params.accountId, userId: req.user.id } });
    
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const transactions = await Transaction.findAll({
      where: { accountId: req.params.accountId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Deposit
router.post('/deposit', auth, async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { accountId, amount, description } = req.body;

    if (amount <= 0) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }

    const account = await Account.findOne({ where: { id: accountId, userId: req.user.id }, transaction: t });
    
    if (!account) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    if (account.status !== 'active') {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Account is not active' });
    }

    account.balance = parseFloat(account.balance) + parseFloat(amount);
    await account.save({ transaction: t });

    const transaction = await Transaction.create({
      accountId,
      type: 'deposit',
      amount,
      description: description || 'Deposit',
      balanceAfter: account.balance
    }, { transaction: t });

    await t.commit();
    
    res.json({ success: true, message: 'Deposit successful', transaction, balance: account.balance });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Withdrawal
router.post('/withdraw', auth, async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { accountId, amount, description } = req.body;

    if (amount <= 0) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }

    const account = await Account.findOne({ where: { id: accountId, userId: req.user.id }, transaction: t });
    
    if (!account) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    if (account.status !== 'active') {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Account is not active' });
    }

    if (parseFloat(account.balance) < parseFloat(amount)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Insufficient funds' });
    }

    account.balance = parseFloat(account.balance) - parseFloat(amount);
    await account.save({ transaction: t });

    const transaction = await Transaction.create({
      accountId,
      type: 'withdrawal',
      amount,
      description: description || 'Withdrawal',
      balanceAfter: account.balance
    }, { transaction: t });

    await t.commit();
    
    res.json({ success: true, message: 'Withdrawal successful', transaction, balance: account.balance });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Transfer
router.post('/transfer', auth, async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { fromAccountId, toAccountNumber, amount, description } = req.body;

    if (amount <= 0) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }

    const fromAccount = await Account.findOne({ where: { id: fromAccountId, userId: req.user.id }, transaction: t });
    
    if (!fromAccount) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Source account not found' });
    }

    if (fromAccount.status !== 'active') {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Source account is not active' });
    }

    if (parseFloat(fromAccount.balance) < parseFloat(amount)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Insufficient funds' });
    }

    const toAccount = await Account.findOne({ where: { accountNumber: toAccountNumber }, transaction: t });
    
    if (!toAccount) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Destination account not found' });
    }

    if (toAccount.status !== 'active') {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Destination account is not active' });
    }

    // Deduct from source account
    fromAccount.balance = parseFloat(fromAccount.balance) - parseFloat(amount);
    await fromAccount.save({ transaction: t });

    // Add to destination account
    toAccount.balance = parseFloat(toAccount.balance) + parseFloat(amount);
    await toAccount.save({ transaction: t });

    // Create transactions
    const withdrawalTransaction = await Transaction.create({
      accountId: fromAccountId,
      type: 'transfer',
      amount,
      toAccountId: toAccount.id,
      description: description || `Transfer to ${toAccountNumber}`,
      balanceAfter: fromAccount.balance
    }, { transaction: t });

    await Transaction.create({
      accountId: toAccount.id,
      type: 'transfer',
      amount,
      description: description || `Transfer from ${fromAccount.accountNumber}`,
      balanceAfter: toAccount.balance
    }, { transaction: t });

    await t.commit();
    
    res.json({ 
      success: true, 
      message: 'Transfer successful', 
      transaction: withdrawalTransaction,
      balance: fromAccount.balance 
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
