import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

function Login({ onLogin }) {
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [adminFormData, setAdminFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    position: '',
    department: '',
    salary: '',
    hireDate: ''
  });
  const [showAdminRegister, setShowAdminRegister] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      
      if (response.data.success) {
        onLogin(response.data.token, response.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.post('/auth/admin-login', formData);
      
      if (response.data.success) {
        onLogin(response.data.token, response.data.employee);
        navigate('/admin');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.post('/auth/admin-register', {
        ...adminFormData,
        role: 'admin'
      });
      
      if (response.data.success) {
        setSuccess('Admin account created successfully! Please login.');
        setShowAdminRegister(false);
        setAdminFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          phoneNumber: '',
          position: '',
          department: '',
          salary: '',
          hireDate: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Admin registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Bank Management System</h2>
        
        <div className="login-toggle">
          <button 
            className={!isAdminLogin ? 'active' : ''} 
            onClick={() => { 
              setIsAdminLogin(false); 
              setShowAdminRegister(false); 
              setError(''); 
              setSuccess('');
            }}
          >
            Customer Login
          </button>
          <button 
            className={isAdminLogin ? 'active' : ''} 
            onClick={() => { 
              setIsAdminLogin(true); 
              setShowAdminRegister(false); 
              setError(''); 
              setSuccess('');
            }}
          >
            Admin Login
          </button>
        </div>

        <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
          {isAdminLogin ? (showAdminRegister ? 'Create Admin Account' : 'Admin Login') : 'Customer Login'}
        </h3>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        {!isAdminLogin ? (
          <>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                />
              </div>
              
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            
            <div className="auth-link">
              Don't have an account? <Link to="/register">Register here</Link>
            </div>
          </>
        ) : (
          <>
            {!showAdminRegister ? (
              <>
                <form onSubmit={handleAdminLogin}>
                  <div className="form-group">
                    <label>Admin Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter admin email"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter admin password"
                    />
                  </div>
                  
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Logging in...' : 'Admin Login'}
                  </button>
                </form>
                
                <div className="auth-link">
                  Don't have an admin account? <button className="link-button" onClick={() => setShowAdminRegister(true)}>Create here</button>
                </div>
              </>
            ) : (
              <>
                <form onSubmit={handleAdminRegister}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        value={adminFormData.firstName}
                        onChange={(e) => setAdminFormData({ ...adminFormData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        value={adminFormData.lastName}
                        onChange={(e) => setAdminFormData({ ...adminFormData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={adminFormData.email}
                      onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      value={adminFormData.password}
                      onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                      required
                      minLength="6"
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={adminFormData.phoneNumber}
                      onChange={(e) => setAdminFormData({ ...adminFormData, phoneNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Position</label>
                      <input
                        type="text"
                        value={adminFormData.position}
                        onChange={(e) => setAdminFormData({ ...adminFormData, position: e.target.value })}
                        required
                        placeholder="e.g., Bank Manager"
                      />
                    </div>
                    <div className="form-group">
                      <label>Department</label>
                      <input
                        type="text"
                        value={adminFormData.department}
                        onChange={(e) => setAdminFormData({ ...adminFormData, department: e.target.value })}
                        required
                        placeholder="e.g., Administration"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Salary</label>
                      <input
                        type="number"
                        value={adminFormData.salary}
                        onChange={(e) => setAdminFormData({ ...adminFormData, salary: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Hire Date</label>
                      <input
                        type="date"
                        value={adminFormData.hireDate}
                        onChange={(e) => setAdminFormData({ ...adminFormData, hireDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Admin Account'}
                  </button>
                </form>

                <div className="auth-link">
                  Already have an account? <button className="link-button" onClick={() => setShowAdminRegister(false)}>Login here</button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
