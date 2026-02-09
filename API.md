# API Reference

Complete API documentation for the Advanced Accounting System.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication via JWT token.

### Headers
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

## Response Format

### Success Response
```json
{
  "data": { ... },
  "message": "Success"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": [ ... ]
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication Endpoints

### POST /api/auth/register

Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  },
  "token": "jwt-token"
}
```

### POST /api/auth/login

Authenticate and get JWT token.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  },
  "token": "jwt-token"
}
```

---

## Account Endpoints

### POST /api/accounts

Create a new account.

**Request Body:**
```json
{
  "accountTypeId": "uuid",
  "code": "1000",
  "name": "Cash",
  "description": "Primary cash account",
  "currency": "USD",
  "isActive": true
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "code": "1000",
  "name": "Cash",
  "balance": "0.00",
  ...
}
```

### GET /api/accounts

Get all accounts.

**Query Parameters:**
- `organizationId` (optional) - Filter by organization
- `isActive` (optional) - Filter by active status
- `category` (optional) - Filter by category (asset, liability, equity, revenue, expense)

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "code": "1000",
    "name": "Cash",
    "category": "asset",
    "balance": "50000.00",
    ...
  }
]
```

### GET /api/accounts/:id

Get account by ID.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "code": "1000",
  "name": "Cash",
  "accountTypeName": "Cash",
  "category": "asset",
  "normalBalance": "debit",
  "balance": "50000.00",
  ...
}
```

### PUT /api/accounts/:id

Update account.

**Request Body:**
```json
{
  "name": "Updated Account Name",
  "description": "New description",
  "isActive": true
}
```

**Response:** `200 OK`

### GET /api/accounts/:id/balance

Get account balance.

**Query Parameters:**
- `asOfDate` (optional) - Date in YYYY-MM-DD format

**Response:** `200 OK`
```json
{
  "accountId": "uuid",
  "balance": "50000.00",
  "asOfDate": "2024-02-09"
}
```

### GET /api/accounts/:id/ledger

Get account ledger entries.

**Query Parameters:**
- `startDate` (optional) - Start date in YYYY-MM-DD format
- `endDate` (optional) - End date in YYYY-MM-DD format

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "entryDate": "2024-02-01",
    "description": "Initial capital",
    "debit": "50000.00",
    "credit": "0.00",
    "balance": "50000.00",
    "entryNumber": "JE-00001"
  }
]
```

---

## Journal Entry Endpoints

### POST /api/journal

Create a new journal entry.

**Request Body:**
```json
{
  "entryDate": "2024-02-09",
  "description": "Payment received from customer",
  "reference": "PAY-001",
  "lines": [
    {
      "accountId": "cash-account-uuid",
      "debit": 1000.00,
      "credit": 0,
      "description": "Cash received"
    },
    {
      "accountId": "ar-account-uuid",
      "debit": 0,
      "credit": 1000.00,
      "description": "Clear receivable"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "entryNumber": "JE-00001",
  "entryDate": "2024-02-09",
  "description": "Payment received from customer",
  "status": "draft",
  "lines": [ ... ]
}
```

### GET /api/journal

Get all journal entries.

**Query Parameters:**
- `organizationId` (optional)
- `status` (optional) - draft, posted, void
- `startDate` (optional)
- `endDate` (optional)

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "entryNumber": "JE-00001",
    "entryDate": "2024-02-09",
    "description": "...",
    "status": "posted",
    "lineCount": 2
  }
]
```

### GET /api/journal/:id

Get journal entry by ID.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "entryNumber": "JE-00001",
  "entryDate": "2024-02-09",
  "description": "...",
  "status": "posted",
  "lines": [
    {
      "accountId": "uuid",
      "accountCode": "1000",
      "accountName": "Cash",
      "debit": "1000.00",
      "credit": "0.00",
      "description": "..."
    }
  ]
}
```

### POST /api/journal/:id/post

Post a draft journal entry.

**Response:** `200 OK`

Posts the entry to the general ledger and updates account balances.

### POST /api/journal/:id/void

Void a journal entry.

**Response:** `200 OK`

Reverses the entry and updates account balances.

---

## Invoice Endpoints

### POST /api/invoices

Create a new invoice.

**Request Body:**
```json
{
  "customerId": "uuid",
  "invoiceDate": "2024-02-09",
  "dueDate": "2024-03-09",
  "currency": "USD",
  "notes": "Thank you for your business",
  "terms": "Net 30",
  "lines": [
    {
      "description": "Consulting services",
      "quantity": 10,
      "unitPrice": 150.00,
      "taxRate": 10.00,
      "accountId": "revenue-account-uuid"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "invoiceNumber": "INV-00001",
  "invoiceDate": "2024-02-09",
  "dueDate": "2024-03-09",
  "status": "draft",
  "subtotal": "1500.00",
  "taxAmount": "150.00",
  "totalAmount": "1650.00",
  "amountDue": "1650.00",
  "lines": [ ... ]
}
```

### GET /api/invoices

Get all invoices.

**Query Parameters:**
- `organizationId` (optional)
- `customerId` (optional)
- `status` (optional) - draft, sent, paid, overdue, void, partial
- `startDate` (optional)
- `endDate` (optional)

**Response:** `200 OK`

### GET /api/invoices/overdue

Get overdue invoices.

**Response:** `200 OK`

### GET /api/invoices/:id

Get invoice by ID.

**Response:** `200 OK`

### PUT /api/invoices/:id/status

Update invoice status.

**Request Body:**
```json
{
  "status": "sent"
}
```

**Response:** `200 OK`

### POST /api/invoices/:id/payment

Record a payment on invoice.

**Request Body:**
```json
{
  "amount": 1650.00
}
```

**Response:** `200 OK`

Updates invoice status to 'paid' or 'partial' and adjusts amount due.

---

## Report Endpoints

### GET /api/reports/trial-balance

Generate trial balance report.

**Query Parameters:**
- `organizationId` (optional)
- `asOfDate` (optional) - Date in YYYY-MM-DD format

**Response:** `200 OK`
```json
{
  "asOfDate": "2024-02-09",
  "accounts": [
    {
      "code": "1000",
      "name": "Cash",
      "category": "asset",
      "totalDebit": "50000.00",
      "totalCredit": "0.00",
      "balance": "50000.00"
    }
  ],
  "totalDebits": "100000.00",
  "totalCredits": "100000.00",
  "isBalanced": true
}
```

### GET /api/reports/balance-sheet

Generate balance sheet.

**Query Parameters:**
- `organizationId` (optional)
- `asOfDate` (optional)

**Response:** `200 OK`
```json
{
  "asOfDate": "2024-02-09",
  "assets": [ ... ],
  "liabilities": [ ... ],
  "equity": [ ... ],
  "totalAssets": "100000.00",
  "totalLiabilities": "30000.00",
  "totalEquity": "70000.00",
  "totalLiabilitiesAndEquity": "100000.00"
}
```

### GET /api/reports/income-statement

Generate income statement (P&L).

**Query Parameters:**
- `organizationId` (optional)
- `startDate` (optional)
- `endDate` (optional)

**Response:** `200 OK`
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-02-09",
  "revenue": [ ... ],
  "expenses": [ ... ],
  "totalRevenue": "50000.00",
  "totalExpenses": "30000.00",
  "netIncome": "20000.00"
}
```

### GET /api/reports/cash-flow

Generate cash flow statement.

**Query Parameters:**
- `organizationId` (optional)
- `startDate` (optional)
- `endDate` (optional)

**Response:** `200 OK`
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-02-09",
  "operatingActivities": "15000.00",
  "investingActivities": "-5000.00",
  "financingActivities": "10000.00",
  "netCashFlow": "20000.00"
}
```

### GET /api/reports/aging

Generate accounts receivable/payable aging report.

**Query Parameters:**
- `organizationId` (optional)
- `type` (optional) - 'receivable' or 'payable' (default: receivable)

**Response:** `200 OK`
```json
{
  "reportType": "receivable",
  "generatedAt": "2024-02-09T10:00:00Z",
  "aging": {
    "current": [ ... ],
    "days_1_30": [ ... ],
    "days_31_60": [ ... ],
    "days_61_90": [ ... ],
    "over_90": [ ... ]
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

### GET /api/reports/account/:accountId/summary

Generate account summary report.

**Query Parameters:**
- `organizationId` (optional)
- `startDate` (required)
- `endDate` (required)

**Response:** `200 OK`
```json
{
  "accountId": "uuid",
  "startDate": "2024-01-01",
  "endDate": "2024-02-09",
  "openingBalance": "0.00",
  "transactions": [
    {
      "date": "2024-02-01",
      "description": "...",
      "entryNumber": "JE-00001",
      "debit": "50000.00",
      "credit": "0.00",
      "balance": "50000.00"
    }
  ],
  "closingBalance": "50000.00"
}
```

---

## Error Handling

### Validation Errors

**Status:** `400 Bad Request`
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "entryDate",
      "message": "\"entryDate\" is required"
    }
  ]
}
```

### Authentication Errors

**Status:** `401 Unauthorized`
```json
{
  "error": "Authentication required"
}
```

### Permission Errors

**Status:** `403 Forbidden`
```json
{
  "error": "Insufficient permissions"
}
```

### Not Found Errors

**Status:** `404 Not Found`
```json
{
  "error": "Resource not found"
}
```

### Business Logic Errors

**Status:** `400 Bad Request`
```json
{
  "error": "Journal entry is not balanced. Debits must equal credits."
}
```

---

## Rate Limiting

Currently not implemented. Consider adding rate limiting for production:
- 100 requests per 15 minutes per IP
- 1000 requests per hour per user

## Pagination

For endpoints that return large datasets, pagination will be added:

```
GET /api/accounts?page=1&limit=50
```

Response will include:
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "totalPages": 10,
    "totalItems": 500
  }
}
```

## Filtering and Sorting

Most list endpoints support filtering and sorting:

```
GET /api/journal?status=posted&startDate=2024-01-01&sort=-entryDate
```

- `sort` - Field to sort by (prefix with `-` for descending)

## Webhooks

Future feature: Configure webhooks for events:
- Invoice paid
- Payment received
- Journal entry posted
- Report generated
