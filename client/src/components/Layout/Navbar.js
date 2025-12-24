import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Check if user is admin - admins have 'role' and 'employeeId' properties
  const isAdmin = user?.role && (user?.role === 'admin' || user?.role === 'manager' || user?.employeeId);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/dashboard" className="navbar-logo">
          🏦 Bank
        </Link>
        
        {/* Menu Toggle for Mobile */}
        <button 
          className="navbar-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
        
        {/* Navigation Menu */}
        <div className={`navbar-menu-wrapper ${mobileMenuOpen ? 'active' : ''}`}>
          <ul className="navbar-menu">
            {/* Main Services */}
            <li className="menu-section-label">Services</li>
            <li><Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link></li>
            <li><Link to="/accounts" onClick={() => setMobileMenuOpen(false)}>Accounts</Link></li>
            <li><Link to="/transactions" onClick={() => setMobileMenuOpen(false)}>Transactions</Link></li>
            
            {/* Financial Products */}
            <li className="menu-section-label">Products</li>
            <li><Link to="/credit-cards" onClick={() => setMobileMenuOpen(false)}>Credit Cards</Link></li>
            <li><Link to="/loans" onClick={() => setMobileMenuOpen(false)}>Loans</Link></li>
            <li><Link to="/transfers" onClick={() => setMobileMenuOpen(false)}>Transfers</Link></li>
            
            {/* Personal */}
            <li className="menu-section-label">Account</li>
            <li><Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link></li>
            
            {/* Admin */}
            {isAdmin && (
              <>
                <li className="menu-section-label">Management</li>
                <li><Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin Portal</Link></li>
              </>
            )}
          </ul>
        </div>
        
        {/* User Section */}
        <div className="navbar-user">
          <div className="user-info">
            <span className="user-welcome">Welcome, {user?.firstName}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
