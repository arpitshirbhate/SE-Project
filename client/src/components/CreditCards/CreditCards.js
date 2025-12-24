import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './CreditCards.css';

function CreditCards() {
  const [applications, setApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [cardTypes] = useState([
    { id: 'classic', name: 'Classic Card', minIncome: 25000, desc: 'Great for everyday purchases' },
    { id: 'gold', name: 'Gold Card', minIncome: 50000, desc: 'Enhanced rewards & benefits' },
    { id: 'platinum', name: 'Platinum Card', minIncome: 100000, desc: 'Premium services & rewards' },
    { id: 'business', name: 'Business Card', minIncome: 75000, desc: 'For business owners' }
  ]);
  const [formData, setFormData] = useState({
    cardType: 'classic',
    cardName: '',
    annualIncome: '',
    employmentStatus: 'employed'
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/credit-cards');
      if (response.data.success) {
        setApplications(response.data.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
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
      const response = await api.post('/credit-cards', formData);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Card application submitted successfully! Admin will review it shortly.' });
        setShowModal(false);
        fetchApplications();
        setFormData({
          cardType: 'classic',
          cardName: '',
          annualIncome: '',
          employmentStatus: 'employed'
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to submit application' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this application?')) {
      try {
        const response = await api.delete(`/credit-cards/${id}`);
        if (response.data.success) {
          setMessage({ type: 'success', text: 'Application cancelled' });
          fetchApplications();
        }
      } catch (error) {
        setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to cancel application' });
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: '#fef3c7', color: '#92400e', label: '⏳ Pending' },
      approved: { bg: '#dcfce7', color: '#166534', label: '✓ Approved' },
      rejected: { bg: '#fee2e2', color: '#991b1b', label: '✗ Rejected' }
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Credit Cards</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Apply for Card
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="card">
          <p>No card applications yet. Apply for your first card to get started!</p>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map((app) => {
            const badge = getStatusBadge(app.status);
            return (
              <div key={app.id} className="application-card">
                <div className="app-header">
                  <div>
                    <h3>{app.cardName}</h3>
                    <p className="card-type">{app.cardType.charAt(0).toUpperCase() + app.cardType.slice(1)} Card</p>
                  </div>
                  <div className="status-badge" style={{ backgroundColor: badge.bg, color: badge.color }}>
                    {badge.label}
                  </div>
                </div>
                
                <div className="app-details">
                  <div className="detail">
                    <span className="label">Applied Date:</span>
                    <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Annual Income:</span>
                    <span>${parseFloat(app.annualIncome).toLocaleString()}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Employment:</span>
                    <span>{app.employmentStatus.charAt(0).toUpperCase() + app.employmentStatus.slice(1)}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Credit Limit:</span>
                    <span className="limit">${parseFloat(app.creditLimit).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>

                {app.status === 'approved' && (
                  <div className="approval-info">
                    <p><strong>✓ Approved!</strong> Your card will be issued within 5-7 business days.</p>
                  </div>
                )}

                {app.status === 'rejected' && app.remarks && (
                  <div className="rejection-info">
                    <p><strong>Reason:</strong> {app.remarks}</p>
                  </div>
                )}

                {app.status === 'pending' && (
                  <div className="app-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleCancel(app.id)}
                    >
                      Cancel Application
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Apply for Credit Card</h2>
            
            <div className="card-selection">
              <p style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>Select Card Type:</p>
              {cardTypes.map((card) => (
                <label key={card.id} className={`card-option ${formData.cardType === card.id ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="cardType"
                    value={card.id}
                    checked={formData.cardType === card.id}
                    onChange={handleChange}
                  />
                  <div className="card-option-content">
                    <strong>{card.name}</strong>
                    <p>{card.desc}</p>
                    <small>Min. Income: ${card.minIncome.toLocaleString()}</small>
                  </div>
                </label>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Cardholder Name *</label>
                <input
                  type="text"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleChange}
                  placeholder="Enter name as it should appear on card"
                  required
                />
              </div>

              <div className="form-group">
                <label>Annual Income *</label>
                <input
                  type="number"
                  name="annualIncome"
                  value={formData.annualIncome}
                  onChange={handleChange}
                  placeholder="Enter your annual income"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Employment Status *</label>
                <select
                  name="employmentStatus"
                  value={formData.employmentStatus}
                  onChange={handleChange}
                  required
                >
                  <option value="employed">Employed</option>
                  <option value="self-employed">Self-Employed</option>
                  <option value="retired">Retired</option>
                  <option value="student">Student</option>
                </select>
              </div>

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
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreditCards;
