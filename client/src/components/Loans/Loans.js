import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './Loans.css';

function Loans() {
  const [loans, setLoans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [formData, setFormData] = useState({
    loanType: 'personal',
    principalAmount: '',
    tenureMonths: 12,
    interestRate: 8.5
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await api.get('/loans');
      if (response.data.success) {
        setLoans(response.data.loans);
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateEMI = (principal, rate, months) => {
    const monthlyRate = rate / 12 / 100;
    if (monthlyRate === 0) return principal / months;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
               (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi * 100) / 100;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.post('/loans', formData);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Loan application submitted successfully!' });
        setShowModal(false);
        fetchLoans();
        setFormData({
          loanType: 'personal',
          principalAmount: '',
          tenureMonths: 12,
          interestRate: 8.5
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to apply for loan' });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.post(`/loans/${selectedLoan.id}/payment`, {
        amount: paymentAmount
      });
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Payment recorded successfully!' });
        setPaymentModal(false);
        setPaymentAmount('');
        fetchLoans();
        setSelectedLoan(null);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Payment failed' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: '#fef3c7', color: '#92400e', label: '⏳ Pending' },
      approved: { bg: '#dbeafe', color: '#1e40af', label: '✓ Approved' },
      active: { bg: '#dcfce7', color: '#166534', label: '💰 Active' },
      closed: { bg: '#e5e7eb', color: '#374151', label: '✓ Closed' },
      rejected: { bg: '#fee2e2', color: '#991b1b', label: '✗ Rejected' },
      defaulted: { bg: '#fecaca', color: '#7f1d1d', label: '⚠ Defaulted' }
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Loans</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Apply for Loan
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {loans.length === 0 ? (
        <div className="card">
          <p>No loans yet. Apply for a loan to get started!</p>
        </div>
      ) : (
        <div className="loans-grid">
          {loans.map((loan) => {
            const badge = getStatusBadge(loan.status);
            const emi = loan.monthlyEmi || 0;
            const remaining = Math.ceil(loan.outstandingBalance / emi);
            
            return (
              <div key={loan.id} className="loan-card">
                <div className="loan-header">
                  <div>
                    <h3 style={{ textTransform: 'capitalize', margin: '0 0 5px 0' }}>
                      {loan.loanType} Loan
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                      Applied: {new Date(loan.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="status-badge" style={{ backgroundColor: badge.bg, color: badge.color }}>
                    {badge.label}
                  </div>
                </div>

                <div className="loan-details">
                  <div className="detail">
                    <span className="label">Principal Amount:</span>
                    <span className="value">${parseFloat(loan.principalAmount).toLocaleString()}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Monthly EMI:</span>
                    <span className="value">${emi.toFixed(2)}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Interest Rate:</span>
                    <span className="value">{loan.interestRate}% p.a.</span>
                  </div>
                  <div className="detail">
                    <span className="label">Tenure:</span>
                    <span className="value">{loan.tenureMonths} months</span>
                  </div>
                  <div className="detail">
                    <span className="label">Outstanding Balance:</span>
                    <span className="value highlight">${parseFloat(loan.outstandingBalance).toLocaleString()}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Remaining Payments:</span>
                    <span className="value">{Math.max(0, remaining)} months</span>
                  </div>
                </div>

                {loan.status === 'active' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setSelectedLoan(loan);
                      setPaymentModal(true);
                    }}
                    style={{ width: '100%', marginTop: '15px' }}
                  >
                    Make Payment
                  </button>
                )}

                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedLoan(loan);
                    setShowModal(true);
                  }}
                  style={{ width: '100%', marginTop: loan.status === 'active' ? '8px' : '15px' }}
                >
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      )}

      {paymentModal && selectedLoan && (
        <div className="modal-overlay" onClick={() => setPaymentModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Make Payment</h2>
            <div className="card" style={{ marginBottom: '20px', padding: '15px' }}>
              <p><strong>EMI Amount Due:</strong> ${parseFloat(selectedLoan.monthlyEmi).toFixed(2)}</p>
              <p><strong>Outstanding Balance:</strong> ${parseFloat(selectedLoan.outstandingBalance).toLocaleString()}</p>
            </div>

            <form onSubmit={handlePayment}>
              <div className="form-group">
                <label>Payment Amount *</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter payment amount"
                  step="0.01"
                  min="1"
                  max={selectedLoan.monthlyEmi}
                  required
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setPaymentModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && !selectedLoan && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Apply for Loan</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Loan Type *</label>
                <select
                  name="loanType"
                  value={formData.loanType}
                  onChange={handleChange}
                  required
                >
                  <option value="personal">Personal Loan</option>
                  <option value="home">Home Loan</option>
                  <option value="auto">Auto Loan</option>
                  <option value="business">Business Loan</option>
                  <option value="education">Education Loan</option>
                </select>
              </div>

              <div className="form-group">
                <label>Loan Amount (Principal) *</label>
                <input
                  type="number"
                  name="principalAmount"
                  value={formData.principalAmount}
                  onChange={handleChange}
                  placeholder="Enter loan amount"
                  min="1000"
                  max="1000000"
                  required
                />
                <small>Min: $1,000 | Max: $1,000,000</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tenure (Months) *</label>
                  <input
                    type="number"
                    name="tenureMonths"
                    value={formData.tenureMonths}
                    onChange={handleChange}
                    min="6"
                    max="360"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Interest Rate (%) *</label>
                  <input
                    type="number"
                    name="interestRate"
                    value={formData.interestRate}
                    onChange={handleChange}
                    step="0.1"
                    min="1"
                    max="20"
                    required
                  />
                </div>
              </div>

              {formData.principalAmount && formData.tenureMonths && (
                <div className="card" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0fdf4' }}>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Estimated Monthly EMI:</strong> $
                    {calculateEMI(
                      parseFloat(formData.principalAmount),
                      parseFloat(formData.interestRate),
                      parseInt(formData.tenureMonths)
                    ).toFixed(2)}
                  </p>
                  <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                    Total Interest: $
                    {(calculateEMI(
                      parseFloat(formData.principalAmount),
                      parseFloat(formData.interestRate),
                      parseInt(formData.tenureMonths)
                    ) * parseInt(formData.tenureMonths) - parseFloat(formData.principalAmount)).toFixed(2)}
                  </p>
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
                  {loading ? 'Submitting...' : 'Apply for Loan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Loans;
