import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Accounts from './components/Accounts/Accounts';
import Transactions from './components/Transactions/Transactions';
import CreditCards from './components/CreditCards/CreditCards';
import Loans from './components/Loans/Loans';
import Transfers from './components/Transfers/Transfers';
import Profile from './components/Profile/Profile';
import AdminPortal from './components/Admin/AdminPortal';
import Navbar from './components/Layout/Navbar';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Check if current route is admin
  const isAdminRoute = window.location.pathname === '/admin';

  return (
    <Router>
      <div className="App">
        {isAuthenticated && !isAdminRoute && <Navbar user={user} onLogout={handleLogout} />}
        <Routes>
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? 
              <Login onLogin={handleLogin} /> : 
              <Navigate to="/dashboard" />
            } 
          />
          <Route 
            path="/register" 
            element={
              !isAuthenticated ? 
              <Register onRegister={handleLogin} /> : 
              <Navigate to="/dashboard" />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
              <Dashboard user={user} /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/accounts" 
            element={
              isAuthenticated ? 
              <Accounts /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/transactions" 
            element={
              isAuthenticated ? 
              <Transactions /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/credit-cards" 
            element={
              isAuthenticated ? 
              <CreditCards /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/loans" 
            element={
              isAuthenticated ? 
              <Loans /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/transfers" 
            element={
              isAuthenticated ? 
              <Transfers /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/profile" 
            element={
              isAuthenticated ? 
              <Profile user={user} setUser={setUser} /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/admin" 
            element={
              isAuthenticated && (user?.role === 'admin' || user?.role === 'manager' || user?.employeeId) ? 
              <AdminPortal /> : 
              <Navigate to="/dashboard" />
            } 
          />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
