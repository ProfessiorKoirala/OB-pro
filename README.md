# Advanced Accounting System

A comprehensive, enterprise-grade accounting system built with Node.js, Express, and PostgreSQL. This system implements full double-entry bookkeeping, financial reporting, and advanced accounting features.

## 🚀 Features

### Core Accounting
- ✅ **Double-Entry Bookkeeping** - Complete implementation with automatic balance validation
- ✅ **Chart of Accounts** - Hierarchical account structure with account types
- ✅ **Journal Entries** - Create, post, and void journal entries
- ✅ **General Ledger** - Complete transaction history with running balances
- ✅ **Trial Balance** - Real-time balance verification

### Financial Reporting
- 📊 **Balance Sheet** - Assets, Liabilities, and Equity statements
- 📊 **Income Statement** - Profit & Loss with revenue and expense breakdown
- 📊 **Cash Flow Statement** - Operating, Investing, and Financing activities
- 📊 **Account Summary** - Detailed transaction history for any account
- 📊 **Aging Reports** - Accounts Receivable and Payable aging analysis

### Business Operations
- 💰 **Invoicing** - Create and manage customer invoices with line items
- 💳 **Payment Tracking** - Record and apply payments to invoices/bills
- 📝 **Bills Management** - Vendor bill tracking and payment
- 👥 **Customer/Vendor Management** - Complete contact and relationship management

### Advanced Features
- 🌍 **Multi-Currency Support** - Handle transactions in multiple currencies
- 💹 **Exchange Rate Management** - Track and apply currency conversions
- 📈 **Budget Tracking** - Create budgets and track variance
- 🏦 **Bank Reconciliation** - Match bank transactions with ledger entries
- 🔒 **Audit Trail** - Complete history of all changes
- 👤 **Role-Based Access Control** - User permissions and authentication
- 📊 **Tax Management** - Multiple tax rates and automatic calculations

## 📋 Prerequisites

- Node.js 14.x or higher
- PostgreSQL 12.x or higher
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd advanced-accounting-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure your database connection:
   ```env
   NODE_ENV=development
   PORT=3000
   
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=accounting_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   
   DEFAULT_CURRENCY=USD
   TIMEZONE=UTC
   ```

4. **Create the database**
   ```bash
   createdb accounting_db
   ```

5. **Run migrations**
   ```bash
   npm run migrate
   ```

6. **Seed initial data** (optional)
   ```bash
   npm run seed
   ```
   
   This creates:
   - Demo admin user (email: admin@example.com, password: admin123)
   - Sample organization
   - Standard chart of accounts
   - Common currencies
   - Sample tax rates

7. **Start the server**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

All endpoints except `/auth/login` and `/auth/register` require authentication via JWT token.

Include the token in the Authorization header:
```
Authorization: Bearer <your-token>
```

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### Chart of Accounts

#### Create Account
```http
POST /api/accounts
Content-Type: application/json
Authorization: Bearer <token>

{
  "accountTypeId": "uuid",
  "code": "1000",
  "name": "Cash",
  "description": "Primary cash account",
  "currency": "USD",
  "isActive": true
}
```

#### Get All Accounts
```http
GET /api/accounts?organizationId=uuid&category=asset&isActive=true
Authorization: Bearer <token>
```

#### Get Account Balance
```http
GET /api/accounts/:id/balance?asOfDate=2024-12-31
Authorization: Bearer <token>
```

#### Get Account Ledger
```http
GET /api/accounts/:id/ledger?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

### Journal Entries

#### Create Journal Entry
```http
POST /api/journal
Content-Type: application/json
Authorization: Bearer <token>

{
  "entryDate": "2024-02-09",
  "description": "Initial capital contribution",
  "reference": "CAP-001",
  "lines": [
    {
      "accountId": "cash-account-uuid",
      "debit": 10000.00,
      "credit": 0,
      "description": "Cash received"
    },
    {
      "accountId": "equity-account-uuid",
      "debit": 0,
      "credit": 10000.00,
      "description": "Owner's capital"
    }
  ]
}
```

#### Post Journal Entry
```http
POST /api/journal/:id/post
Authorization: Bearer <token>
```

#### Void Journal Entry
```http
POST /api/journal/:id/void
Authorization: Bearer <token>
```

#### Get All Journal Entries
```http
GET /api/journal?status=posted&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

### Invoices

#### Create Invoice
```http
POST /api/invoices
Content-Type: application/json
Authorization: Bearer <token>

{
  "customerId": "customer-uuid",
  "invoiceDate": "2024-02-09",
  "dueDate": "2024-03-09",
  "currency": "USD",
  "notes": "Payment terms: Net 30",
  "terms": "Payment due within 30 days",
  "lines": [
    {
      "description": "Consulting Services",
      "quantity": 10,
      "unitPrice": 150.00,
      "taxRate": 10.00,
      "accountId": "revenue-account-uuid"
    }
  ]
}
```

#### Get All Invoices
```http
GET /api/invoices?status=sent&customerId=uuid
Authorization: Bearer <token>
```

#### Get Overdue Invoices
```http
GET /api/invoices/overdue
Authorization: Bearer <token>
```

#### Record Payment
```http
POST /api/invoices/:id/payment
Content-Type: application/json
Authorization: Bearer <token>

{
  "amount": 1650.00
}
```

### Financial Reports

#### Trial Balance
```http
GET /api/reports/trial-balance?asOfDate=2024-12-31
Authorization: Bearer <token>
```

**Response:**
```json
{
  "asOfDate": "2024-12-31",
  "accounts": [
    {
      "id": "uuid",
      "code": "1000",
      "name": "Cash",
      "category": "asset",
      "normalBalance": "debit",
      "totalDebit": "50000.00",
      "totalCredit": "20000.00",
      "balance": "30000.00"
    }
  ],
  "totalDebits": "150000.00",
  "totalCredits": "150000.00",
  "isBalanced": true
}
```

#### Balance Sheet
```http
GET /api/reports/balance-sheet?asOfDate=2024-12-31
Authorization: Bearer <token>
```

**Response:**
```json
{
  "asOfDate": "2024-12-31",
  "assets": [...],
  "liabilities": [...],
  "equity": [...],
  "totalAssets": "100000.00",
  "totalLiabilities": "30000.00",
  "totalEquity": "70000.00",
  "totalLiabilitiesAndEquity": "100000.00"
}
```

#### Income Statement
```http
GET /api/reports/income-statement?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

**Response:**
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "revenue": [...],
  "expenses": [...],
  "totalRevenue": "200000.00",
  "totalExpenses": "120000.00",
  "netIncome": "80000.00"
}
```

#### Cash Flow Statement
```http
GET /api/reports/cash-flow?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

#### Aging Report
```http
GET /api/reports/aging?type=receivable
Authorization: Bearer <token>
```

**Response:**
```json
{
  "reportType": "receivable",
  "generatedAt": "2024-02-09T10:00:00Z",
  "aging": {
    "current": [...],
    "days_1_30": [...],
    "days_31_60": [...],
    "days_61_90": [...],
    "over_90": [...]
  },
  "totals": {
    "current": "10000.00",
    "days_1_30": "5000.00",
    "days_31_60": "2000.00",
    "days_61_90": "1000.00",
    "over_90": "500.00",
    "grandTotal": "18500.00"
  }
}
```

#### Account Summary
```http
GET /api/reports/account/:accountId/summary?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

## 🏗️ Architecture

### Database Schema

The system uses a comprehensive PostgreSQL schema with the following main entities:

- **Users & Organizations** - Multi-tenant support with user authentication
- **Chart of Accounts** - Hierarchical account structure
- **Journal Entries & Ledger** - Complete double-entry bookkeeping
- **Customers & Vendors** - Business relationship management
- **Invoices & Bills** - Accounts receivable and payable
- **Payments** - Payment tracking and application
- **Bank Accounts** - Bank account management and reconciliation
- **Budgets** - Budget planning and variance analysis
- **Currencies & Exchange Rates** - Multi-currency support
- **Audit Logs** - Complete audit trail

### Key Design Principles

1. **Double-Entry Bookkeeping** - Every transaction has equal debits and credits
2. **Immutable Ledger** - Once posted, entries create immutable ledger records
3. **Audit Trail** - All changes are logged for compliance
4. **Data Integrity** - Database constraints ensure data validity
5. **Performance** - Indexed queries for fast reporting
6. **Scalability** - Designed for multi-tenant usage

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- SQL injection prevention via parameterized queries
- Input validation with Joi
- Helmet.js security headers
- CORS configuration

## 🧪 Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

## 📊 Example Workflows

### Recording a Sale

1. Create a customer invoice
2. Post journal entry (debit AR, credit Revenue)
3. Receive payment
4. Post journal entry (debit Cash, credit AR)

### Paying a Bill

1. Receive vendor bill
2. Post journal entry (debit Expense, credit AP)
3. Make payment
4. Post journal entry (debit AP, credit Cash)

### Month-End Close

1. Generate trial balance
2. Review and post adjusting entries
3. Generate financial statements
4. Create budget variance report

## 🛠️ Development

### Project Structure
```
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── database/        # Database migrations and seeds
│   ├── middleware/      # Express middleware
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── index.js         # Application entry point
├── logs/                # Application logs
├── .env                 # Environment variables
└── package.json         # Dependencies
```

### Adding New Features

1. Create model in `src/models/`
2. Add business logic to `src/services/`
3. Create controller in `src/controllers/`
4. Define routes in `src/routes/`
5. Add validation schemas in `src/middleware/validation.js`
6. Update database schema if needed

## 📝 Best Practices

1. **Always validate journal entries** - Ensure debits equal credits
2. **Post entries atomically** - Use database transactions
3. **Don't delete posted entries** - Void them instead
4. **Keep audit trail** - Log all significant operations
5. **Regular backups** - Schedule database backups
6. **Test balance regularly** - Run trial balance reports

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secret
- [ ] Configure secure database password
- [ ] Enable HTTPS
- [ ] Set up log rotation
- [ ] Configure database backups
- [ ] Set up monitoring
- [ ] Review security headers
- [ ] Configure rate limiting
- [ ] Set up CI/CD pipeline

### Environment Variables

See `.env.example` for all available configuration options.

## 📄 License

MIT License - see LICENSE file for details

## 👥 Support

For issues, questions, or contributions, please open an issue on the repository.

## 🎯 Roadmap

- [ ] Multi-company consolidation
- [ ] Advanced budget forecasting
- [ ] Inventory management
- [ ] Fixed asset depreciation
- [ ] Payroll integration
- [ ] Tax filing reports
- [ ] API rate limiting
- [ ] GraphQL API
- [ ] Real-time notifications
- [ ] Mobile app

## 🙏 Credits

Built with modern technologies:
- Express.js
- PostgreSQL
- JWT Authentication
- Decimal.js for precise calculations
- Winston for logging
