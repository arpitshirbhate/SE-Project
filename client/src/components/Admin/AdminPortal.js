import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './AdminPortal.css';

function AdminPortal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [cardApplications, setCardApplications] = useState([]);
  const [cardApplicationFilter, setCardApplicationFilter] = useState('all');
  const [loans, setLoans] = useState([]);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showLoanRemarkModal, setShowLoanRemarkModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loanRemark, setLoanRemark] = useState('');
  const [employeeForm, setEmployeeForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    position: '',
    department: '',
    salary: '',
    hireDate: '',
    role: 'employee'
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'dashboard') fetchDashboard();
    else if (activeTab === 'customers') fetchCustomers();
    else if (activeTab === 'employees') fetchEmployees();
    else if (activeTab === 'accounts') fetchAccounts();
    else if (activeTab === 'transactions') fetchTransactions();
    else if (activeTab === 'creditcards') fetchCardApplications();
    else if (activeTab === 'loans') fetchLoans();
  }, [activeTab]);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/admin/stats');
      if (response.data.success) {
        setStats(response.data.stats);
        setTransactions(response.data.recentTransactions);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to fetch dashboard data' });
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/admin/customers');
      if (response.data.success) {
        setCustomers(response.data.customers);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to fetch customers' });
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/admin/employees');
      if (response.data.success) {
        setEmployees(response.data.employees);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to fetch employees' });
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/admin/accounts');
      if (response.data.success) {
        setAccounts(response.data.accounts);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to fetch accounts' });
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/admin/transactions');
      if (response.data.success) {
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to fetch transactions' });
    }
  };

  const fetchCardApplications = async () => {
    try {
      const response = await api.get('/admin/credit-cards/applications');
      if (response.data.success) {
        setCardApplications(response.data.applications);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to fetch card applications' });
    }
  };

  const fetchLoans = async () => {
    try {
      const response = await api.get('/admin/loans/pending');
      if (response.data.success) {
        setLoans(response.data.loans);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to fetch loans' });
    }
  };

  const handleApproveLoan = async (loanId) => {
    setLoading(true);
    try {
      const response = await api.patch(`/admin/loans/${loanId}/approve`, { remarks: loanRemark });
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Loan approved successfully' });
        setShowLoanRemarkModal(false);
        setLoanRemark('');
        setSelectedLoan(null);
        fetchLoans();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to approve loan' });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectLoan = async (loanId) => {
    setLoading(true);
    try {
      const response = await api.patch(`/admin/loans/${loanId}/reject`, { remarks: loanRemark });
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Loan rejected successfully' });
        setShowLoanRemarkModal(false);
        setLoanRemark('');
        setSelectedLoan(null);
        fetchLoans();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to reject loan' });
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.post('/admin/employees', employeeForm);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Employee added successfully!' });
        setShowEmployeeModal(false);
        setEmployeeForm({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          phoneNumber: '',
          position: '',
          department: '',
          salary: '',
          hireDate: '',
          role: 'employee'
        });
        fetchEmployees();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to add employee' });
    } finally {
      setLoading(false);
    }
  };

  const toggleCustomerStatus = async (customerId, currentStatus) => {
    try {
      const response = await api.patch(`/admin/customers/${customerId}/status`, {
        isActive: !currentStatus
      });
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Customer status updated' });
        fetchCustomers();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update customer status' });
    }
  };

  const toggleAccountStatus = async (accountId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'frozen' : 'active';
    try {
      const response = await api.patch(`/admin/accounts/${accountId}/status`, {
        status: newStatus
      });
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Account status updated' });
        fetchAccounts();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update account status' });
    }
  };

  const approveCardApplication = async (appId) => {
    const remarks = prompt('Enter remarks (optional):');
    try {
      const response = await api.patch(`/admin/credit-cards/${appId}/approve`, {
        remarks: remarks || ''
      });
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Card application approved!' });
        fetchCardApplications();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to approve application' });
    }
  };

  const rejectCardApplication = async (appId) => {
    const remarks = prompt('Enter reason for rejection:');
    if (!remarks) return;
    try {
      const response = await api.patch(`/admin/credit-cards/${appId}/reject`, {
        remarks
      });
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Card application rejected' });
        fetchCardApplications();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to reject application' });
    }
  };

  return (
    <div className="admin-portal">
      <div className="admin-header">
        <h1>Admin Portal</h1>
      </div>

      <div className="admin-tabs">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={activeTab === 'customers' ? 'active' : ''}
          onClick={() => setActiveTab('customers')}
        >
          Customers
        </button>
        <button
          className={activeTab === 'employees' ? 'active' : ''}
          onClick={() => setActiveTab('employees')}
        >
          Employees
        </button>
        <button
          className={activeTab === 'accounts' ? 'active' : ''}
          onClick={() => setActiveTab('accounts')}
        >
          Accounts
        </button>
        <button
          className={activeTab === 'transactions' ? 'active' : ''}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
        <button
          className={activeTab === 'creditcards' ? 'active' : ''}
          onClick={() => setActiveTab('creditcards')}
        >
          Credit Cards
        </button>
        <button
          className={activeTab === 'loans' ? 'active' : ''}
          onClick={() => setActiveTab('loans')}
        >
          Loans
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="admin-content">
        {activeTab === 'dashboard' && stats && (
          <div>
            <div className="dashboard-grid">
              <div className="stat-card primary">
                <h3>Total Customers</h3>
                <div className="value">{stats.totalCustomers}</div>
              </div>
              <div className="stat-card success">
                <h3>Total Accounts</h3>
                <div className="value">{stats.totalAccounts}</div>
              </div>
              <div className="stat-card info">
                <h3>Total Employees</h3>
                <div className="value">{stats.totalEmployees}</div>
              </div>
              <div className="stat-card warning">
                <h3>Total Balance</h3>
                <div className="value">${parseFloat(stats.totalBalance).toFixed(2)}</div>
              </div>
            </div>

            <div className="card">
              <h2>Recent Transactions</h2>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Account</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{new Date(transaction.createdAt).toLocaleString()}</td>
                      <td>{transaction.account?.accountNumber}</td>
                      <td style={{ textTransform: 'capitalize' }}>{transaction.type}</td>
                      <td style={{ color: transaction.type === 'deposit' ? '#28a745' : '#dc3545' }}>
                        {transaction.type === 'deposit' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                      </td>
                      <td>{transaction.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="card">
            <h2>All Customers</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Accounts</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.firstName} {customer.lastName}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phoneNumber}</td>
                    <td>{customer.Accounts?.length || 0}</td>
                    <td>
                      <span style={{ color: customer.isActive ? '#28a745' : '#dc3545' }}>
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        onClick={() => toggleCustomerStatus(customer.id, customer.isActive)}
                      >
                        {customer.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2>All Employees</h2>
              <button className="btn btn-primary" onClick={() => setShowEmployeeModal(true)}>
                + Add Employee
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.employeeId}</td>
                    <td>{employee.firstName} {employee.lastName}</td>
                    <td>{employee.email}</td>
                    <td>{employee.position}</td>
                    <td>{employee.department}</td>
                    <td>${parseFloat(employee.salary).toFixed(2)}</td>
                    <td>{employee.status}</td>
                    <td style={{ textTransform: 'capitalize' }}>{employee.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="card">
            <h2>All Accounts</h2>
            <table>
              <thead>
                <tr>
                  <th>Account Number</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td>{account.accountNumber}</td>
                    <td>{account.User?.firstName} {account.User?.lastName}</td>
                    <td style={{ textTransform: 'capitalize' }}>{account.accountType}</td>
                    <td>${parseFloat(account.balance).toFixed(2)}</td>
                    <td>{account.status}</td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        onClick={() => toggleAccountStatus(account.id, account.status)}
                      >
                        {account.status === 'active' ? 'Freeze' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="card">
            <h2>All Transactions</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Account</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Balance After</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{new Date(transaction.createdAt).toLocaleString()}</td>
                    <td>{transaction.account?.accountNumber}</td>
                    <td style={{ textTransform: 'capitalize' }}>{transaction.type}</td>
                    <td style={{ color: transaction.type === 'deposit' ? '#28a745' : '#dc3545' }}>
                      {transaction.type === 'deposit' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                    </td>
                    <td>${parseFloat(transaction.balanceAfter).toFixed(2)}</td>
                    <td>{transaction.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'creditcards' && (
          <div className="card">
            <div style={{ marginBottom: '20px' }}>
              <h2>Credit Card Applications</h2>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button 
                  className={`btn ${cardApplicationFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setCardApplicationFilter('all')}
                >
                  All
                </button>
                <button 
                  className={`btn ${cardApplicationFilter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setCardApplicationFilter('pending')}
                >
                  Pending
                </button>
                <button 
                  className={`btn ${cardApplicationFilter === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setCardApplicationFilter('approved')}
                >
                  Approved
                </button>
                <button 
                  className={`btn ${cardApplicationFilter === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setCardApplicationFilter('rejected')}
                >
                  Rejected
                </button>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Card Type</th>
                  <th>Annual Income</th>
                  <th>Credit Limit</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cardApplications
                  .filter(app => cardApplicationFilter === 'all' || app.status === cardApplicationFilter)
                  .map((app) => (
                    <tr key={app.id}>
                      <td>{app.User?.firstName} {app.User?.lastName}</td>
                      <td>{app.User?.email}</td>
                      <td style={{ textTransform: 'capitalize' }}>{app.cardType}</td>
                      <td>${parseFloat(app.annualIncome).toLocaleString()}</td>
                      <td>${parseFloat(app.creditLimit).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                      <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                      <td>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: 
                            app.status === 'approved' ? '#dcfce7' :
                            app.status === 'rejected' ? '#fee2e2' :
                            '#fef3c7',
                          color:
                            app.status === 'approved' ? '#166534' :
                            app.status === 'rejected' ? '#991b1b' :
                            '#92400e'
                        }}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        {app.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                              className="btn btn-success"
                              onClick={() => approveCardApplication(app.id)}
                              style={{ fontSize: '12px', padding: '6px 10px' }}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => rejectCardApplication(app.id)}
                              style={{ fontSize: '12px', padding: '6px 10px' }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>
                            {app.reviewedAt ? 'Reviewed' : '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showEmployeeModal && (
        <div className="modal-overlay" onClick={() => setShowEmployeeModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Employee</h2>
            <form onSubmit={handleEmployeeSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={employeeForm.firstName}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={employeeForm.lastName}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={employeeForm.email}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={employeeForm.password}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={employeeForm.phoneNumber}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, phoneNumber: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Position</label>
                  <input
                    type="text"
                    value={employeeForm.position}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, position: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    value={employeeForm.department}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Salary</label>
                  <input
                    type="number"
                    value={employeeForm.salary}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, salary: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hire Date</label>
                  <input
                    type="date"
                    value={employeeForm.hireDate}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, hireDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={employeeForm.role}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEmployeeModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'loans' && (
        <div className="card">
          <h2>Loan Applications</h2>
          
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Loan Type</th>
                <th>Amount</th>
                <th>Tenure</th>
                <th>EMI</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans.map(loan => (
                <tr key={loan.id}>
                  <td>{loan.User?.firstName} {loan.User?.lastName}</td>
                  <td>{loan.loanType}</td>
                  <td>₹{loan.principalAmount.toFixed(2)}</td>
                  <td>{loan.tenureMonths} months</td>
                  <td>₹{loan.monthlyEmi.toFixed(2)}</td>
                  <td>
                    <span className={`badge badge-${loan.status}`}>
                      {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                    </span>
                  </td>
                  <td>{new Date(loan.appliedAt).toLocaleDateString()}</td>
                  <td>
                    {loan.status === 'pending' && (
                      <>
                        <button 
                          className="btn btn-small btn-success"
                          onClick={() => {
                            setSelectedLoan(loan);
                            setLoanRemark('');
                            setShowLoanRemarkModal(true);
                          }}
                        >
                          Approve
                        </button>
                        <button 
                          className="btn btn-small btn-danger"
                          onClick={() => {
                            setSelectedLoan(loan);
                            setLoanRemark('');
                            setShowLoanRemarkModal(true);
                          }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {loan.status !== 'pending' && (
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        {loan.remarks}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showLoanRemarkModal && (
        <div className="modal-overlay" onClick={() => setShowLoanRemarkModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Loan Decision</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleApproveLoan(selectedLoan.id);
            }}>
              <div className="form-group">
                <label>Remarks</label>
                <textarea
                  value={loanRemark}
                  onChange={(e) => setLoanRemark(e.target.value)}
                  placeholder="Enter your remarks..."
                  rows="4"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowLoanRemarkModal(false)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => handleRejectLoan(selectedLoan.id)}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Reject'}
                </button>
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Approve'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPortal;
