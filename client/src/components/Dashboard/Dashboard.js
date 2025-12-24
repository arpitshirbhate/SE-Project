import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

function Dashboard({ user }) {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalAccounts: 0,
    recentTransactions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [accountsRes, transactionsRes] = await Promise.all([
        api.get('/accounts'),
        api.get('/transactions')
      ]);

      if (accountsRes.data.success) {
        const accountsData = accountsRes.data.accounts;
        setAccounts(accountsData);
        
        const totalBalance = accountsData.reduce((sum, acc) => sum + acc.balance, 0);
        setStats({
          totalBalance,
          totalAccounts: accountsData.length,
          recentTransactions: transactionsRes.data.transactions?.length || 0
        });
      }

      if (transactionsRes.data.success) {
        setTransactions(transactionsRes.data.transactions.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container"><p>Loading...</p></div>;
  }

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Welcome back, {user?.firstName} {user?.lastName}!
      </p>

      <div className="dashboard-grid">
        <div className="stat-card primary">
          <h3>Total Balance</h3>
          <div className="value">${stats.totalBalance.toFixed(2)}</div>
        </div>
        
        <div className="stat-card success">
          <h3>Active Accounts</h3>
          <div className="value">{stats.totalAccounts}</div>
        </div>
        
        <div className="stat-card info">
          <h3>Recent Transactions</h3>
          <div className="value">{stats.recentTransactions}</div>
        </div>
      </div>

      <div className="card">
        <h2>Your Accounts</h2>
        {accounts.length === 0 ? (
          <p>No accounts found. Create your first account!</p>
        ) : (
          <div className="accounts-grid">
            {accounts.map((account) => (
              <div key={account._id} className="account-card">
                <div className="account-type">{account.accountType}</div>
                <div className="account-number">{account.accountNumber}</div>
                <div className="balance">${account.balance.toFixed(2)}</div>
                <div className="status">{account.status}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p>No recent transactions.</p>
        ) : (
          <div className="transaction-list">
            {transactions.map((transaction) => (
              <div key={transaction._id} className="transaction-item">
                <div>
                  <div className="type">{transaction.type.toUpperCase()}</div>
                  <div className="description">{transaction.description}</div>
                  <div className="date">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className={`amount ${transaction.type === 'deposit' ? 'positive' : 'negative'}`}>
                  {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
