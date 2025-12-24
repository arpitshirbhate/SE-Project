import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

function Transactions() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [transactionType, setTransactionType] = useState('deposit');
  const [formData, setFormData] = useState({
    accountId: '',
    amount: '',
    description: '',
    toAccountNumber: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts');
      if (response.data.success) {
        setAccounts(response.data.accounts);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions');
      if (response.data.success) {
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let response;
      const data = {
        accountId: formData.accountId,
        amount: parseFloat(formData.amount),
        description: formData.description
      };

      if (transactionType === 'deposit') {
        response = await api.post('/transactions/deposit', data);
      } else if (transactionType === 'withdraw') {
        response = await api.post('/transactions/withdraw', data);
      } else {
        response = await api.post('/transactions/transfer', {
          fromAccountId: formData.accountId,
          toAccountNumber: formData.toAccountNumber,
          amount: parseFloat(formData.amount),
          description: formData.description
        });
      }

      if (response.data.success) {
        setMessage({ type: 'success', text: `${transactionType} successful!` });
        setShowModal(false);
        fetchTransactions();
        fetchAccounts();
        setFormData({ accountId: '', amount: '', description: '', toAccountNumber: '' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || `${transactionType} failed` });
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type) => {
    setTransactionType(type);
    setShowModal(true);
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Transactions</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-success" onClick={() => openModal('deposit')}>
            + Deposit
          </button>
          <button className="btn btn-danger" onClick={() => openModal('withdraw')}>
            - Withdraw
          </button>
          <button className="btn btn-primary" onClick={() => openModal('transfer')}>
            ↔ Transfer
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <h2>Transaction History</h2>
        {transactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Balance After</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td>{new Date(transaction.createdAt).toLocaleString()}</td>
                  <td style={{ textTransform: 'capitalize' }}>{transaction.type}</td>
                  <td>{transaction.description}</td>
                  <td style={{ color: transaction.type === 'deposit' ? '#28a745' : '#dc3545' }}>
                    {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </td>
                  <td>${transaction.balanceAfter.toFixed(2)}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      background: transaction.status === 'completed' ? '#d4edda' : '#fff3cd',
                      color: transaction.status === 'completed' ? '#155724' : '#856404',
                      fontSize: '12px'
                    }}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select Account</label>
                <select
                  name="accountId"
                  value={formData.accountId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose an account</option>
                  {accounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.accountNumber} ({account.accountType}) - ${account.balance.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {transactionType === 'transfer' && (
                <div className="form-group">
                  <label>To Account Number</label>
                  <input
                    type="text"
                    name="toAccountNumber"
                    value={formData.toAccountNumber}
                    onChange={handleChange}
                    required
                    placeholder="Enter recipient account number"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Processing...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;
