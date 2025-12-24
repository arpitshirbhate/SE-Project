import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './Transfers.css';

function Transfers() {
  const [transfers, setTransfers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [transferType, setTransferType] = useState('own'); // own or user
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    recipientEmail: '',
    amount: '',
    description: ''
  });

  useEffect(() => {
    fetchTransfers();
    fetchAccounts();
    fetchUsers();
  }, []);

  const fetchTransfers = async () => {
    try {
      const response = await api.get('/transfers');
      if (response.data.success) {
        setTransfers(response.data.transfers);
      }
    } catch (error) {
      console.error('Error fetching transfers:', error);
    }
  };

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

  const fetchUsers = async () => {
    try {
      // eslint-disable-next-line no-unused-vars
      const response = await api.get('/users');
      // Fetch users but don't need to store in state
    } catch (error) {
      console.error('Error fetching users:', error);
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
      
      if (transferType === 'own') {
        response = await api.post('/transfers/own-accounts', {
          fromAccountId: formData.fromAccountId,
          toAccountId: formData.toAccountId,
          amount: formData.amount,
          description: formData.description
        });
      } else {
        response = await api.post('/transfers/to-user', {
          fromAccountId: formData.fromAccountId,
          recipientEmail: formData.recipientEmail,
          amount: formData.amount,
          description: formData.description
        });
      }
      
      if (response.data.success) {
        setMessage({ type: 'success', text: `Transfer completed! Ref: ${response.data.referenceNumber}` });
        setShowModal(false);
        fetchTransfers();
        setFormData({
          fromAccountId: '',
          toAccountId: '',
          recipientEmail: '',
          amount: '',
          description: ''
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Transfer failed' });
    } finally {
      setLoading(false);
    }
  };

  const fromAccount = accounts.find(a => a.id === formData.fromAccountId);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Money Transfer</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Send Money
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {transfers.length === 0 ? (
        <div className="card">
          <p>No transfers yet. Send money to get started!</p>
        </div>
      ) : (
        <div className="transfers-list">
          {transfers.map((transfer) => (
            <div key={transfer.id} className="transfer-card">
              <div className="transfer-icon">
                {transfer.transferType === 'account-to-account' ? '↔️' : '👤'}
              </div>
              <div className="transfer-info">
                <h3>
                  {transfer.transferType === 'account-to-account' 
                    ? `${transfer.fromAccount.accountNumber} → ${transfer.toAccount.accountNumber}`
                    : `To: ${transfer.toUser?.firstName} ${transfer.toUser?.lastName}`}
                </h3>
                <p>{transfer.description || 'Money Transfer'}</p>
                <small>Ref: {transfer.referenceNumber}</small>
              </div>
              <div className="transfer-amount">
                <div className="amount">${parseFloat(transfer.amount).toLocaleString()}</div>
                <div className="date">{new Date(transfer.transferredAt).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Send Money</h2>

            <div className="transfer-type-selector">
              <label className={`type-option ${transferType === 'own' ? 'active' : ''}`}>
                <input
                  type="radio"
                  value="own"
                  checked={transferType === 'own'}
                  onChange={(e) => {
                    setTransferType(e.target.value);
                    setFormData({
                      fromAccountId: '',
                      toAccountId: '',
                      recipientEmail: '',
                      amount: '',
                      description: ''
                    });
                  }}
                />
                <span>↔️ Own Accounts</span>
              </label>
              <label className={`type-option ${transferType === 'user' ? 'active' : ''}`}>
                <input
                  type="radio"
                  value="user"
                  checked={transferType === 'user'}
                  onChange={(e) => {
                    setTransferType(e.target.value);
                    setFormData({
                      fromAccountId: '',
                      toAccountId: '',
                      recipientEmail: '',
                      amount: '',
                      description: ''
                    });
                  }}
                />
                <span>👤 To Another User</span>
              </label>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>From Account *</label>
                <select
                  name="fromAccountId"
                  value={formData.fromAccountId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountNumber} ({account.accountType}) - ${parseFloat(account.balance).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {transferType === 'own' ? (
                <div className="form-group">
                  <label>To Account *</label>
                  <select
                    name="toAccountId"
                    value={formData.toAccountId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select account</option>
                    {accounts
                      .filter(a => a.id !== formData.fromAccountId)
                      .map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.accountNumber} ({account.accountType})
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <div className="form-group">
                  <label>Recipient Email *</label>
                  <input
                    type="email"
                    name="recipientEmail"
                    value={formData.recipientEmail}
                    onChange={handleChange}
                    placeholder="recipient@example.com"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>Amount *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  step="0.01"
                  min="1"
                  max={fromAccount?.balance || 999999}
                  required
                />
                {fromAccount && (
                  <small>Available: ${parseFloat(fromAccount.balance).toLocaleString()}</small>
                )}
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="e.g., Payment for rent"
                />
              </div>

              {formData.amount && (
                <div className="card" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0fdf4' }}>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Amount:</strong> ${parseFloat(formData.amount).toLocaleString()}
                  </p>
                  {fromAccount && (
                    <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                      Remaining Balance: $
                      {(parseFloat(fromAccount.balance) - parseFloat(formData.amount || 0)).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Send Money'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transfers;
