import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    accountType: 'savings',
    initialDeposit: 0
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
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
      const response = await api.post('/accounts', formData);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Account created successfully!' });
        setShowModal(false);
        fetchAccounts();
        setFormData({ accountType: 'savings', initialDeposit: 0 });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create account' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>My Accounts</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Create New Account
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="card">
          <p>No accounts found. Create your first account to get started!</p>
        </div>
      ) : (
        <div className="accounts-grid">
          {accounts.map((account) => (
            <div key={account._id} className="account-card">
              <div className="account-type">{account.accountType}</div>
              <div className="account-number">{account.accountNumber}</div>
              <div className="balance">${account.balance.toFixed(2)}</div>
              <div className="status">{account.status}</div>
              <div style={{ marginTop: '10px', fontSize: '12px', opacity: 0.9 }}>
                Created: {new Date(account.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Account</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Account Type</label>
                <select
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  required
                >
                  <option value="savings">Savings</option>
                  <option value="checking">Checking</option>
                  <option value="business">Business</option>
                </select>
              </div>

              <div className="form-group">
                <label>Initial Deposit (Optional)</label>
                <input
                  type="number"
                  name="initialDeposit"
                  value={formData.initialDeposit}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Accounts;
