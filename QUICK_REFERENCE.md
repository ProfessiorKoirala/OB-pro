# Quick Reference Card

## 🚀 Installation (2 minutes)

```bash
npm install
cp .env.example .env
# Edit .env with database credentials
createdb accounting_db
npm run migrate
npm run seed
npm start
```

## 🔑 Default Credentials

```
Email: admin@example.com
Password: admin123
```

## 📡 Key Endpoints

### Authentication
```bash
POST /api/auth/login
POST /api/auth/register
```

### Chart of Accounts
```bash
GET    /api/accounts
POST   /api/accounts
GET    /api/accounts/:id
PUT    /api/accounts/:id
GET    /api/accounts/:id/balance
GET    /api/accounts/:id/ledger
```

### Journal Entries
```bash
GET    /api/journal
POST   /api/journal
GET    /api/journal/:id
POST   /api/journal/:id/post
POST   /api/journal/:id/void
```

### Invoices
```bash
GET    /api/invoices
POST   /api/invoices
GET    /api/invoices/:id
GET    /api/invoices/overdue
PUT    /api/invoices/:id/status
POST   /api/invoices/:id/payment
```

### Financial Reports
```bash
GET /api/reports/trial-balance?asOfDate=YYYY-MM-DD
GET /api/reports/balance-sheet?asOfDate=YYYY-MM-DD
GET /api/reports/income-statement?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
GET /api/reports/cash-flow?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
GET /api/reports/aging?type=receivable|payable
GET /api/reports/account/:accountId/summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

## 🔐 Authentication Header

```bash
Authorization: Bearer <your-jwt-token>
```

## 📝 Common Request Examples

### Login
```json
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### Create Journal Entry
```json
POST /api/journal
{
  "entryDate": "2024-02-09",
  "description": "Cash payment",
  "lines": [
    {
      "accountId": "uuid",
      "debit": 1000.00,
      "credit": 0
    },
    {
      "accountId": "uuid",
      "debit": 0,
      "credit": 1000.00
    }
  ]
}
```

### Create Invoice
```json
POST /api/invoices
{
  "customerId": "uuid",
  "invoiceDate": "2024-02-09",
  "dueDate": "2024-03-09",
  "lines": [
    {
      "description": "Service",
      "quantity": 1,
      "unitPrice": 100.00,
      "taxRate": 10.00
    }
  ]
}
```

## 🏗️ Chart of Accounts Structure

```
1000-1999: Assets
2000-2999: Liabilities
3000-3999: Equity
4000-4999: Revenue
5000-5999: Cost of Goods Sold
6000-6999: Operating Expenses
7000-7999: Other Expenses
```

## 📊 Account Normal Balances

```
Assets:    Debit  (increases with debits)
Expenses:  Debit  (increases with debits)

Liabilities: Credit (increases with credits)
Equity:      Credit (increases with credits)
Revenue:     Credit (increases with credits)
```

## 💡 Quick Tips

1. **Always verify balance**: Debits must equal credits
2. **Post entries**: Draft entries don't affect balances
3. **Void, don't delete**: Keep audit trail
4. **Use references**: Track transaction sources
5. **Check trial balance**: Verify books regularly

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild
docker-compose build
```

## 🔧 Development Commands

```bash
npm start          # Production mode
npm run dev        # Development mode (auto-reload)
npm test           # Run tests
npm run migrate    # Run database migrations
npm run seed       # Seed sample data
```

## 📁 Important Files

```
.env                    # Configuration
src/index.js            # Main application
src/database/schema.sql # Database schema
README.md               # Full documentation
API.md                  # API reference
EXAMPLES.md             # Usage examples
```

## 🔍 Debugging

```bash
# Check logs
tail -f logs/combined.log
tail -f logs/error.log

# Check database
psql -U accounting_admin -d accounting_db

# Test API
curl http://localhost:3000/health

# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## ⚠️ Common Issues

**Connection Error**
- Check .env database credentials
- Verify PostgreSQL is running
- Check port 5432 is available

**Authentication Failed**
- Check JWT_SECRET is set
- Verify token is valid
- Check email/password

**Migration Failed**
- Ensure database exists
- Check PostgreSQL version (12+)
- Verify user permissions

**Port 3000 in use**
- Change PORT in .env
- Or: `lsof -i :3000` and kill process

## 📞 Getting Help

1. Check error logs: `logs/error.log`
2. Review documentation: `README.md`
3. See examples: `EXAMPLES.md`
4. Check API docs: `API.md`
5. Review features: `FEATURES.md`

## 🎯 Typical Workflow

1. **Login** → Get JWT token
2. **Create Accounts** → Set up chart of accounts
3. **Record Transactions** → Post journal entries
4. **Create Invoices** → Bill customers
5. **Record Payments** → Track cash flow
6. **Generate Reports** → Financial statements
7. **Review Trial Balance** → Verify accuracy

## 📈 Health Check

```bash
curl http://localhost:3000/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-02-09T10:00:00.000Z"
}
```

## 🔗 Resource Links

- **Full Documentation**: README.md
- **Setup Guide**: SETUP.md
- **API Reference**: API.md
- **Examples**: EXAMPLES.md
- **Features**: FEATURES.md
- **Overview**: PROJECT_OVERVIEW.md

## 📊 Sample Test Sequence

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.token')

# 2. Get accounts
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/accounts

# 3. Get trial balance
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/reports/trial-balance"

# 4. Get balance sheet
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/reports/balance-sheet"
```

---

**Need more details?** See the complete documentation in README.md
