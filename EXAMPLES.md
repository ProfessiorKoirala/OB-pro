# Usage Examples

This guide provides practical examples of using the Advanced Accounting System API.

## Getting Started

### 1. Authentication

First, log in to get your authentication token:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Save the token:
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Basic Accounting Workflows

### Example 1: Recording Initial Capital

**Scenario:** Owner invests $50,000 cash into the business

**Step 1: Create the journal entry**
```bash
curl -X POST http://localhost:3000/api/journal \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entryDate": "2024-02-01",
    "description": "Initial capital investment by owner",
    "reference": "CAP-001",
    "lines": [
      {
        "accountId": "cash-account-uuid",
        "debit": 50000.00,
        "credit": 0,
        "description": "Cash received from owner"
      },
      {
        "accountId": "equity-account-uuid",
        "debit": 0,
        "credit": 50000.00,
        "description": "Owner capital contribution"
      }
    ]
  }'
```

**Step 2: Post the entry**
```bash
curl -X POST http://localhost:3000/api/journal/{entry-id}/post \
  -H "Authorization: Bearer $TOKEN"
```

### Example 2: Recording a Sale

**Scenario:** Sell products for $5,000 (cost: $2,000)

**Step 1: Create invoice**
```bash
curl -X POST http://localhost:3000/api/invoices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-uuid",
    "invoiceDate": "2024-02-05",
    "dueDate": "2024-03-05",
    "currency": "USD",
    "notes": "Thank you for your business",
    "terms": "Net 30",
    "lines": [
      {
        "description": "Product A - Premium Package",
        "quantity": 10,
        "unitPrice": 450.00,
        "taxRate": 10.00,
        "accountId": "sales-revenue-account-uuid"
      },
      {
        "description": "Shipping & Handling",
        "quantity": 1,
        "unitPrice": 50.00,
        "taxRate": 0,
        "accountId": "shipping-revenue-account-uuid"
      }
    ]
  }'
```

**Step 2: Record the sale in journal (automatic when invoice is sent)**
```bash
# Debit: Accounts Receivable 5,500
# Credit: Sales Revenue 4,500
# Credit: Shipping Revenue 50
# Credit: Sales Tax Payable 450
# Credit: Revenue Total 5,000
```

**Step 3: Record COGS**
```bash
curl -X POST http://localhost:3000/api/journal \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entryDate": "2024-02-05",
    "description": "Cost of goods sold for Invoice INV-00001",
    "reference": "INV-00001",
    "lines": [
      {
        "accountId": "cogs-account-uuid",
        "debit": 2000.00,
        "credit": 0,
        "description": "Cost of products sold"
      },
      {
        "accountId": "inventory-account-uuid",
        "debit": 0,
        "credit": 2000.00,
        "description": "Inventory reduction"
      }
    ]
  }'
```

### Example 3: Receiving Payment

**Scenario:** Customer pays $5,500 for invoice

```bash
curl -X POST http://localhost:3000/api/invoices/{invoice-id}/payment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5500.00
  }'
```

This automatically creates:
```
Debit: Cash/Bank 5,500
Credit: Accounts Receivable 5,500
```

### Example 4: Paying Business Expenses

**Scenario:** Pay $1,500 rent for office space

```bash
curl -X POST http://localhost:3000/api/journal \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entryDate": "2024-02-01",
    "description": "Monthly office rent payment",
    "reference": "RENT-FEB-2024",
    "lines": [
      {
        "accountId": "rent-expense-account-uuid",
        "debit": 1500.00,
        "credit": 0,
        "description": "Office rent for February 2024"
      },
      {
        "accountId": "cash-account-uuid",
        "debit": 0,
        "credit": 1500.00,
        "description": "Payment to landlord"
      }
    ]
  }'
```

### Example 5: Recording Vendor Bill

**Scenario:** Receive utility bill for $300

```bash
curl -X POST http://localhost:3000/api/journal \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entryDate": "2024-02-15",
    "description": "Electricity bill for January 2024",
    "reference": "UTIL-JAN-2024",
    "lines": [
      {
        "accountId": "utilities-expense-account-uuid",
        "debit": 300.00,
        "credit": 0,
        "description": "Electricity expense"
      },
      {
        "accountId": "accounts-payable-uuid",
        "debit": 0,
        "credit": 300.00,
        "description": "Amount owed to utility company"
      }
    ]
  }'
```

### Example 6: Paying Vendor Bill

**Scenario:** Pay the $300 utility bill

```bash
curl -X POST http://localhost:3000/api/journal \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entryDate": "2024-02-20",
    "description": "Payment of electricity bill",
    "reference": "PAY-UTIL-JAN",
    "lines": [
      {
        "accountId": "accounts-payable-uuid",
        "debit": 300.00,
        "credit": 0,
        "description": "Clear accounts payable"
      },
      {
        "accountId": "cash-account-uuid",
        "debit": 0,
        "credit": 300.00,
        "description": "Payment made"
      }
    ]
  }'
```

## Financial Reporting Examples

### Example 7: Generate Trial Balance

```bash
curl -X GET "http://localhost:3000/api/reports/trial-balance?asOfDate=2024-02-28" \
  -H "Authorization: Bearer $TOKEN"
```

**Sample Response:**
```json
{
  "asOfDate": "2024-02-28",
  "accounts": [
    {
      "code": "1000",
      "name": "Cash",
      "category": "asset",
      "totalDebit": "50000.00",
      "totalCredit": "6800.00",
      "balance": "43200.00"
    },
    {
      "code": "1200",
      "name": "Accounts Receivable",
      "category": "asset",
      "totalDebit": "5500.00",
      "totalCredit": "5500.00",
      "balance": "0.00"
    }
  ],
  "totalDebits": "58000.00",
  "totalCredits": "58000.00",
  "isBalanced": true
}
```

### Example 8: Generate Income Statement

```bash
curl -X GET "http://localhost:3000/api/reports/income-statement?startDate=2024-01-01&endDate=2024-02-28" \
  -H "Authorization: Bearer $TOKEN"
```

**Sample Response:**
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-02-28",
  "revenue": [
    {
      "code": "4000",
      "name": "Sales Revenue",
      "amount": "5000.00"
    }
  ],
  "expenses": [
    {
      "code": "5000",
      "name": "Cost of Goods Sold",
      "amount": "2000.00"
    },
    {
      "code": "6100",
      "name": "Rent Expense",
      "amount": "1500.00"
    },
    {
      "code": "6200",
      "name": "Utilities Expense",
      "amount": "300.00"
    }
  ],
  "totalRevenue": "5000.00",
  "totalExpenses": "3800.00",
  "netIncome": "1200.00"
}
```

### Example 9: Generate Balance Sheet

```bash
curl -X GET "http://localhost:3000/api/reports/balance-sheet?asOfDate=2024-02-28" \
  -H "Authorization: Bearer $TOKEN"
```

**Sample Response:**
```json
{
  "asOfDate": "2024-02-28",
  "assets": [
    {
      "code": "1000",
      "name": "Cash",
      "balance": "43200.00"
    },
    {
      "code": "1300",
      "name": "Inventory",
      "balance": "8000.00"
    }
  ],
  "liabilities": [
    {
      "code": "2000",
      "name": "Accounts Payable",
      "balance": "0.00"
    }
  ],
  "equity": [
    {
      "code": "3000",
      "name": "Owner's Equity",
      "balance": "50000.00"
    }
  ],
  "totalAssets": "51200.00",
  "totalLiabilities": "0.00",
  "totalEquity": "51200.00"
}
```

### Example 10: Get Accounts Receivable Aging

```bash
curl -X GET "http://localhost:3000/api/reports/aging?type=receivable" \
  -H "Authorization: Bearer $TOKEN"
```

**Sample Response:**
```json
{
  "reportType": "receivable",
  "generatedAt": "2024-02-28T10:00:00Z",
  "aging": {
    "current": [
      {
        "documentNumber": "INV-00001",
        "entityName": "Acme Corporation",
        "amountDue": "5500.00",
        "daysOverdue": -5
      }
    ],
    "days_1_30": [],
    "days_31_60": [],
    "days_61_90": [],
    "over_90": []
  },
  "totals": {
    "current": "5500.00",
    "days_1_30": "0.00",
    "days_31_60": "0.00",
    "days_61_90": "0.00",
    "over_90": "0.00",
    "grandTotal": "5500.00"
  }
}
```

## Advanced Examples

### Example 11: Multi-Currency Transaction

```bash
curl -X POST http://localhost:3000/api/journal \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entryDate": "2024-02-15",
    "description": "Sale to European customer (EUR)",
    "reference": "EUR-SALE-001",
    "lines": [
      {
        "accountId": "accounts-receivable-eur-uuid",
        "debit": 4500.00,
        "credit": 0,
        "description": "AR in EUR (converted to USD: 4500)"
      },
      {
        "accountId": "sales-revenue-uuid",
        "debit": 0,
        "credit": 4500.00,
        "description": "Revenue from EUR sale"
      }
    ]
  }'
```

### Example 12: Recording Depreciation

```bash
curl -X POST http://localhost:3000/api/journal \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entryDate": "2024-02-28",
    "description": "Monthly depreciation expense",
    "reference": "DEP-FEB-2024",
    "lines": [
      {
        "accountId": "depreciation-expense-uuid",
        "debit": 500.00,
        "credit": 0,
        "description": "Depreciation for February"
      },
      {
        "accountId": "accumulated-depreciation-uuid",
        "debit": 0,
        "credit": 500.00,
        "description": "Accumulated depreciation increase"
      }
    ]
  }'
```

### Example 13: Month-End Closing

```bash
# 1. Generate trial balance to verify books are balanced
curl -X GET "http://localhost:3000/api/reports/trial-balance?asOfDate=2024-02-28" \
  -H "Authorization: Bearer $TOKEN"

# 2. Record any adjusting entries (accruals, prepayments, depreciation)
# ... post adjusting entries ...

# 3. Generate financial statements
curl -X GET "http://localhost:3000/api/reports/income-statement?startDate=2024-02-01&endDate=2024-02-28" \
  -H "Authorization: Bearer $TOKEN"

curl -X GET "http://localhost:3000/api/reports/balance-sheet?asOfDate=2024-02-28" \
  -H "Authorization: Bearer $TOKEN"

# 4. Close revenue and expense accounts (transfer net income to equity)
curl -X POST http://localhost:3000/api/journal \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entryDate": "2024-02-28",
    "description": "Close revenue and expenses for February 2024",
    "reference": "CLOSE-FEB-2024",
    "lines": [
      {
        "accountId": "sales-revenue-uuid",
        "debit": 5000.00,
        "credit": 0
      },
      {
        "accountId": "cogs-uuid",
        "debit": 0,
        "credit": 2000.00
      },
      {
        "accountId": "rent-expense-uuid",
        "debit": 0,
        "credit": 1500.00
      },
      {
        "accountId": "utilities-expense-uuid",
        "debit": 0,
        "credit": 300.00
      },
      {
        "accountId": "retained-earnings-uuid",
        "debit": 0,
        "credit": 1200.00
      }
    ]
  }'
```

## Complete Business Scenario

### Scenario: One Month of Business Operations

```bash
# Day 1: Start business with $50,000 capital
# (See Example 1)

# Day 5: Purchase inventory for $10,000
curl -X POST http://localhost:3000/api/journal \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entryDate": "2024-02-05",
    "description": "Purchase inventory",
    "lines": [
      {"accountId": "inventory-uuid", "debit": 10000, "credit": 0},
      {"accountId": "cash-uuid", "debit": 0, "credit": 10000}
    ]
  }'

# Day 10: Make sales (See Example 2)

# Day 15: Receive payment (See Example 3)

# Day 20: Pay expenses (See Examples 4, 5, 6)

# Day 28: Generate month-end reports (See Example 13)
```

## Testing Tips

1. **Always check trial balance** after posting multiple entries
2. **Verify invoice totals** before sending to customers
3. **Review aging reports** weekly to manage receivables
4. **Run financial statements** monthly for business insights
5. **Use references** consistently for easy tracking

## Postman Collection

Import this collection to Postman for easy testing:

```json
{
  "info": {
    "name": "Advanced Accounting System",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{jwt_token}}",
        "type": "string"
      }
    ]
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@example.com\",\n  \"password\": \"admin123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{base_url}}/api/auth/login",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "login"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000",
      "type": "string"
    },
    {
      "key": "jwt_token",
      "value": "",
      "type": "string"
    }
  ]
}
```

Save your JWT token in Postman's `jwt_token` variable after login.
