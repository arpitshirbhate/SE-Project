const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register models BEFORE syncing DB so sequelize.sync() creates all tables
require('./models/User');
require('./models/Account');
require('./models/Transaction');
require('./models/Employee');
require('./models/CreditCardApplication');
require('./models/Loan');
require('./models/LoanPayment');
require('./models/Transfer');
require('./models/Notification');
require('./models/AuditLog');
require('./models/DeviceTrust');

// Set up model associations
require('./models/index');

// Database connection (authenticate + sync) happens in start()

// Import routes
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/accounts');
const transactionRoutes = require('./routes/transactions');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const creditCardRoutes = require('./routes/creditcards');
const loanRoutes = require('./routes/loans');
const transferRoutes = require('./routes/transfers');
const notificationRoutes = require('./routes/notifications');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/credit-cards', creditCardRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Bank Management API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

const PORT = process.env.PORT || 5000;

// Seed a default admin employee if missing
async function seedAdmin() {
  try {
    const Employee = require('./models/Employee');

    const email = process.env.ADMIN_EMAIL || 'admin@bank.local';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';
    const firstName = process.env.ADMIN_FIRST_NAME || 'Admin';
    const lastName = process.env.ADMIN_LAST_NAME || 'User';
    const phoneNumber = process.env.ADMIN_PHONE || '0000000000';
    const position = process.env.ADMIN_POSITION || 'Administrator';
    const department = process.env.ADMIN_DEPARTMENT || 'Administration';
    const salary = process.env.ADMIN_SALARY || 0;
    const hireDate = process.env.ADMIN_HIRE_DATE || new Date();

    const existing = await Employee.findOne({ where: { email } });
    if (!existing) {
      await Employee.create({
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        position,
        department,
        salary,
        hireDate,
        role: 'admin',
        status: 'active'
      });
      console.log(`✓ Default admin seeded (${email})`);
    } else {
      console.log(`• Admin present (${email})`);
    }
  } catch (e) {
    console.error('✗ Failed to seed admin:', e.message);
  }
}

async function start() {
  try {
    await connectDB();
    await seedAdmin();

    const server = app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying port ${Number(PORT) + 1}...`);
        server.listen(Number(PORT) + 1);
      } else {
        console.error('Server error:', err);
      }
    });
  } catch (err) {
    console.error('✗ Startup failed:', err.message);
    process.exit(1);
  }
}

start();
