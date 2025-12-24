# Bank Management Application

A full-stack bank management system built with React, Node.js, Express, and MongoDB.

## Features

### User Management
- User registration and authentication
- Secure login with JWT tokens
- Profile management
- Role-based access (customer/admin)

### Account Management
- Create multiple accounts (Savings, Checking, Business)
- View account details and balances
- Account status management (Active, Frozen, Closed)
- Unique account number generation

### Transaction Management
- Deposit funds
- Withdraw funds
- Transfer between accounts
- Transaction history with detailed records
- Real-time balance updates

### Dashboard
- Overview of all accounts
- Total balance display
- Recent transaction summary
- Quick access to key features

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS enabled

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- Responsive CSS design

## Prerequisites

Before running this application, make sure you have:

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas account)
- npm or yarn package manager

## Installation

### 1. Clone or navigate to the project directory

```powershell
cd d:\BANK
```

### 2. Install backend dependencies

```powershell
npm install
```

### 3. Install frontend dependencies

```powershell
cd client
npm install
cd ..
```

### 4. Configure Environment Variables

The `.env` file is already created with default values:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bankmanagement
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

**Important:** Change the `JWT_SECRET` to a secure random string in production!

### 5. Start MongoDB

Make sure MongoDB is running on your system:

```powershell
# If MongoDB is installed as a service
net start MongoDB

# Or start manually
mongod
```

## Running the Application

### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```powershell
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd client
npm start
```

### Option 2: Run Both Concurrently

```powershell
npm run dev-all
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Accounts
- `GET /api/accounts` - Get all user accounts
- `GET /api/accounts/:id` - Get single account
- `POST /api/accounts` - Create new account
- `PATCH /api/accounts/:id/status` - Update account status
- `GET /api/accounts/:id/balance` - Get account balance

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/account/:accountId` - Get account transactions
- `POST /api/transactions/deposit` - Deposit funds
- `POST /api/transactions/withdraw` - Withdraw funds
- `POST /api/transactions/transfer` - Transfer between accounts

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Default Test Users

You can create test users through the registration page. Here's sample data:

**Customer Account:**
- First Name: John
- Last Name: Doe
- Email: john@example.com
- Password: password123
- Phone: (555) 123-4567
- Date of Birth: 1990-01-01

## Project Structure

```
BANK/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Account.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── accounts.js
│   │   ├── transactions.js
│   │   └── users.js
│   └── server.js
├── client/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── Auth/
│       │   │   ├── Login.js
│       │   │   └── Register.js
│       │   ├── Dashboard/
│       │   │   └── Dashboard.js
│       │   ├── Accounts/
│       │   │   └── Accounts.js
│       │   ├── Transactions/
│       │   │   └── Transactions.js
│       │   ├── Profile/
│       │   │   └── Profile.js
│       │   └── Layout/
│       │       ├── Navbar.js
│       │       └── Navbar.css
│       ├── utils/
│       │   └── api.js
│       ├── App.js
│       ├── App.css
│       ├── index.js
│       └── index.css
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Protected API routes with authentication middleware
- Input validation
- CORS configuration
- Environment variable protection

## Database Schema

### User Schema
- Personal information (name, email, phone, address)
- Hashed password
- Role (customer/admin)
- Account status

### Account Schema
- Unique account number
- Account type (savings/checking/business)
- Balance
- Status (active/frozen/closed)
- Owner reference

### Transaction Schema
- Transaction type (deposit/withdrawal/transfer)
- Amount
- Source and destination accounts
- Balance after transaction
- Timestamp

## Future Enhancements

- Admin dashboard for user management
- Transaction reports and analytics
- Email notifications
- Account statements (PDF generation)
- Two-factor authentication
- Interest calculation for savings accounts
- Loan management system
- Bill payment integration

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify MongoDB port (default: 27017)

### Port Already in Use
- Change PORT in `.env` file
- Kill process using the port: `Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process`

### Module Not Found
- Run `npm install` in root directory
- Run `npm install` in client directory

## License

MIT License - feel free to use this project for learning and development.

## Support

For issues and questions, please create an issue in the repository.

---

**Happy Banking! 🏦**
