# Advanced Features Guide

This document explains the advanced accounting features available in the system.

## Table of Contents

1. [Double-Entry Bookkeeping](#double-entry-bookkeeping)
2. [Chart of Accounts](#chart-of-accounts)
3. [Journal Entries](#journal-entries)
4. [Financial Reporting](#financial-reporting)
5. [Multi-Currency Support](#multi-currency-support)
6. [Bank Reconciliation](#bank-reconciliation)
7. [Budget Management](#budget-management)
8. [Tax Management](#tax-management)
9. [Audit Trail](#audit-trail)
10. [Invoice Management](#invoice-management)

---

## Double-Entry Bookkeeping

The system implements full double-entry bookkeeping, which means:

### Principles

1. **Every transaction has two sides**: A debit and a credit
2. **Debits must equal credits**: The accounting equation must always balance
3. **Accounts have normal balances**: 
   - Assets & Expenses: Debit (left side)
   - Liabilities, Equity & Revenue: Credit (right side)

### The Accounting Equation

```
Assets = Liabilities + Equity
```

Or expanded:
```
Assets + Expenses = Liabilities + Equity + Revenue
```

### Example Transaction

Recording a cash sale of $1,000:

```
Debit:  Cash                $1,000  (Asset increases)
Credit: Sales Revenue       $1,000  (Revenue increases)
```

### Validation

The system automatically validates:
- Debits equal credits in every journal entry
- Account balances are updated correctly
- The accounting equation remains balanced

---

## Chart of Accounts

### Account Structure

Accounts are organized hierarchically:

```
1000-1999: Assets
  1000-1099: Current Assets (Cash, Bank, AR)
  1100-1199: Fixed Assets (Equipment, Buildings)
  1200-1299: Other Assets

2000-2999: Liabilities
  2000-2099: Current Liabilities (AP, Short-term debt)
  2100-2199: Long-term Liabilities

3000-3999: Equity
  3000-3099: Owner's Equity
  3100-3199: Retained Earnings

4000-4999: Revenue
  4000-4099: Sales Revenue
  4100-4199: Service Revenue
  4200-4299: Other Income

5000-5999: Cost of Goods Sold
  5000-5099: Product Costs
  5100-5199: Service Costs

6000-6999: Operating Expenses
  6000-6099: Personnel Costs
  6100-6199: Facility Costs
  6200-6299: Operating Costs
  6300-6399: Marketing & Sales

7000-7999: Other Expenses
  7000-7099: Interest & Finance Charges
  7100-7199: Depreciation
```

### Account Types

**Asset Accounts** (Normal Balance: Debit)
- Cash and cash equivalents
- Accounts Receivable
- Inventory
- Fixed Assets
- Prepaid Expenses

**Liability Accounts** (Normal Balance: Credit)
- Accounts Payable
- Accrued Expenses
- Loans Payable
- Deferred Revenue

**Equity Accounts** (Normal Balance: Credit)
- Owner's Capital
- Retained Earnings
- Common Stock
- Dividends (contra-equity)

**Revenue Accounts** (Normal Balance: Credit)
- Sales Revenue
- Service Revenue
- Interest Income
- Other Income

**Expense Accounts** (Normal Balance: Debit)
- Cost of Goods Sold
- Salaries & Wages
- Rent
- Utilities
- Depreciation

### Creating Custom Accounts

You can create custom accounts to match your business needs:

```javascript
{
  "code": "6350",
  "name": "Social Media Advertising",
  "accountTypeId": "operating-expense-type-uuid",
  "description": "Facebook, Instagram, LinkedIn ads",
  "parentAccountId": "marketing-expense-uuid"
}
```

---

## Journal Entries

### Types of Journal Entries

1. **Regular Entries**: Day-to-day transactions
2. **Adjusting Entries**: Month/year-end adjustments
3. **Closing Entries**: Transfer net income to retained earnings
4. **Reversing Entries**: Reverse accruals at period start

### Common Journal Entry Patterns

#### 1. Recording a Sale
```
Debit:  Accounts Receivable    $1,000
Credit: Sales Revenue                  $1,000

Debit:  Cost of Goods Sold     $600
Credit: Inventory                      $600
```

#### 2. Receiving Payment
```
Debit:  Cash                   $1,000
Credit: Accounts Receivable            $1,000
```

#### 3. Paying an Expense
```
Debit:  Rent Expense           $2,000
Credit: Cash                           $2,000
```

#### 4. Recording Depreciation
```
Debit:  Depreciation Expense   $500
Credit: Accumulated Depreciation       $500
```

#### 5. Accruing an Expense
```
Debit:  Utilities Expense      $300
Credit: Utilities Payable              $300
```

#### 6. Prepaying an Expense
```
Debit:  Prepaid Insurance      $1,200
Credit: Cash                           $1,200
```

Later, as time passes:
```
Debit:  Insurance Expense      $100
Credit: Prepaid Insurance              $100
```

### Entry Status Workflow

1. **Draft**: Entry is created but not posted
   - Can be edited or deleted
   - Does not affect account balances

2. **Posted**: Entry is posted to the ledger
   - Cannot be edited
   - Account balances are updated
   - Appears on financial reports

3. **Void**: Entry is cancelled
   - Reverses the effect on balances
   - Remains in system for audit trail

---

## Financial Reporting

### Trial Balance

Verifies that debits equal credits across all accounts.

**When to run:**
- Before generating financial statements
- After posting journal entries
- During month-end close

**What it shows:**
- All active accounts
- Total debits and credits per account
- Account balances
- Overall debit/credit totals

### Balance Sheet

Shows financial position at a specific point in time.

**Formula:**
```
Assets = Liabilities + Equity
```

**Sections:**
1. **Assets**
   - Current Assets (< 1 year)
   - Fixed Assets (> 1 year)
   - Other Assets

2. **Liabilities**
   - Current Liabilities (< 1 year)
   - Long-term Liabilities (> 1 year)

3. **Equity**
   - Invested Capital
   - Retained Earnings
   - Current Period Net Income

### Income Statement (P&L)

Shows financial performance over a period.

**Formula:**
```
Net Income = Revenue - Expenses
```

**Sections:**
1. **Revenue**
   - Sales Revenue
   - Service Revenue
   - Other Income

2. **Cost of Goods Sold**
   - Direct product costs
   - Direct service costs

3. **Gross Profit** = Revenue - COGS

4. **Operating Expenses**
   - Salaries & Wages
   - Rent
   - Utilities
   - Marketing
   - Other expenses

5. **Operating Income** = Gross Profit - Operating Expenses

6. **Other Income/Expenses**
   - Interest income
   - Interest expense
   - Gains/losses on assets

7. **Net Income** = Operating Income + Other Income - Other Expenses

### Cash Flow Statement

Shows how cash moved during a period.

**Sections:**

1. **Operating Activities**
   - Cash from customers
   - Cash to suppliers
   - Cash for expenses
   - Net cash from operations

2. **Investing Activities**
   - Purchase of equipment
   - Sale of assets
   - Investments
   - Net cash from investing

3. **Financing Activities**
   - Loans received
   - Loan payments
   - Owner contributions
   - Dividends paid
   - Net cash from financing

**Net Cash Flow** = Sum of all three sections

### Aging Reports

Track outstanding receivables and payables.

**Accounts Receivable Aging:**
- Current (not yet due)
- 1-30 days past due
- 31-60 days past due
- 61-90 days past due
- Over 90 days past due

**Uses:**
- Identify collection issues
- Evaluate customer credit risk
- Calculate bad debt reserves
- Improve cash flow management

---

## Multi-Currency Support

### Features

1. **Base Currency**: Set organization's primary currency (USD, EUR, etc.)
2. **Foreign Transactions**: Record transactions in any currency
3. **Exchange Rates**: Track daily exchange rates
4. **Currency Conversion**: Automatic conversion for reporting
5. **Realized Gains/Losses**: Record when foreign currency is converted
6. **Unrealized Gains/Losses**: Mark-to-market for outstanding foreign balances

### Example: Recording Foreign Currency Sale

Sale to European customer for €1,000 when rate is 1.10:

```javascript
{
  "entryDate": "2024-02-09",
  "description": "Sale to EU customer",
  "lines": [
    {
      "accountId": "ar-eur-account",
      "debit": 1100.00,  // $1,100 USD equivalent
      "credit": 0,
      "description": "AR in EUR"
    },
    {
      "accountId": "sales-revenue",
      "debit": 0,
      "credit": 1100.00,
      "description": "Revenue from EUR sale"
    }
  ]
}
```

When payment received at rate 1.08:
```javascript
{
  "entryDate": "2024-03-09",
  "description": "Payment from EU customer",
  "lines": [
    {
      "accountId": "cash-usd",
      "debit": 1080.00,  // $1,080 received
      "credit": 0
    },
    {
      "accountId": "foreign-exchange-loss",
      "debit": 20.00,  // $20 loss on conversion
      "credit": 0
    },
    {
      "accountId": "ar-eur-account",
      "debit": 0,
      "credit": 1100.00
    }
  ]
}
```

---

## Bank Reconciliation

### Purpose

Match bank statement transactions with general ledger entries.

### Process

1. **Import Bank Transactions**
   - Manual entry or file import
   - Date, description, amount

2. **Match Transactions**
   - Automatic matching by amount and date
   - Manual matching for complex items

3. **Identify Differences**
   - Outstanding checks
   - Deposits in transit
   - Bank fees
   - Interest earned
   - Errors

4. **Create Adjusting Entries**
   - Record bank fees
   - Record interest income
   - Correct errors

5. **Reconcile Balance**
   - Book balance
   - Add: Deposits in transit
   - Less: Outstanding checks
   - Should equal bank balance

### Example Reconciliation

**Book Balance**: $10,000
**Bank Balance**: $9,500

**Reconciliation:**
```
Book Balance:           $10,000
Add: Interest earned        $10
Less: Bank fees            -$15
Adjusted Book Balance:   $9,995

Bank Balance:            $9,500
Add: Deposits in transit   $800
Less: Outstanding checks  -$305
Adjusted Bank Balance:   $9,995 ✓
```

**Adjusting Entry:**
```
Debit:  Cash                   $10
Debit:  Bank Fees              $15
Credit: Interest Income             $10
Credit: Cash                        $15
```

---

## Budget Management

### Creating Budgets

1. Set fiscal year and period
2. Budget by account and month
3. Set targets based on:
   - Historical data
   - Growth projections
   - Strategic plans

### Budget vs. Actual Analysis

Compare budgeted amounts to actual results:

```
Account: Marketing Expense
Budget:    $5,000
Actual:    $6,200
Variance: -$1,200 (unfavorable)
% Variance: 24% over budget
```

### Variance Analysis

**Favorable Variances:**
- Revenue higher than budget
- Expenses lower than budget

**Unfavorable Variances:**
- Revenue lower than budget
- Expenses higher than budget

### Budget Reporting

1. **Budget vs. Actual Report**
   - Line-by-line comparison
   - Variance amounts and percentages

2. **Budget Summary**
   - High-level overview
   - By department or category

3. **Forecast Report**
   - Projected year-end results
   - Based on actuals to date

---

## Tax Management

### Tax Rate Configuration

Set up multiple tax rates:
```javascript
{
  "name": "Standard VAT",
  "rate": 20.00,
  "description": "UK standard VAT rate"
}
```

### Tax Calculation

Automatic tax calculation on invoices:
```
Subtotal:      $1,000.00
Tax (10%):       $100.00
Total:         $1,100.00
```

### Tax Reporting

Track tax collected and paid:

**Sales Tax Payable:**
- Tax collected from customers
- Tax owed to government
- Payment due dates

**Input Tax:**
- Tax paid on purchases
- Reclaimable from government

**Net Tax:**
```
Tax Collected - Tax Paid = Net Tax Due/Refund
```

### Tax Reports

1. **Tax Summary Report**
   - Total tax collected
   - Total tax paid
   - Net tax position

2. **Tax Detail Report**
   - Transaction-level detail
   - By tax rate and period

3. **Tax Return Data**
   - Formatted for government filing
   - Supporting documentation

---

## Audit Trail

### What is Logged

Every significant action is recorded:

1. **Entity Changes**
   - Create, update, delete operations
   - Old values and new values
   - Timestamp and user

2. **Financial Transactions**
   - Journal entries created
   - Entries posted or voided
   - Payments recorded

3. **System Access**
   - Login attempts
   - Permission changes
   - Configuration updates

### Audit Log Structure

```javascript
{
  "id": "uuid",
  "timestamp": "2024-02-09T10:30:00Z",
  "userId": "user-uuid",
  "action": "UPDATE",
  "entityType": "Account",
  "entityId": "account-uuid",
  "oldValues": {
    "name": "Old Account Name"
  },
  "newValues": {
    "name": "New Account Name"
  },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0..."
}
```

### Compliance

Audit trails help with:
- SOX compliance
- Financial audits
- Fraud detection
- Security investigations
- Performance monitoring

---

## Invoice Management

### Invoice Lifecycle

1. **Draft**: Invoice created but not sent
2. **Sent**: Invoice sent to customer
3. **Partial**: Partial payment received
4. **Paid**: Fully paid
5. **Overdue**: Past due date
6. **Void**: Cancelled

### Invoice Features

**Line Items:**
- Description
- Quantity
- Unit price
- Tax rate
- Amount

**Calculations:**
```
Line Total = Quantity × Unit Price
Line Tax = Line Total × Tax Rate
Invoice Subtotal = Sum of Line Totals
Invoice Tax = Sum of Line Taxes
Invoice Total = Subtotal + Tax
Amount Due = Total - Payments
```

**Payment Terms:**
- Net 30: Payment due in 30 days
- Net 15: Payment due in 15 days
- Due on receipt: Immediate payment
- Custom terms

### Recurring Invoices

Future feature for subscription billing:
- Monthly/quarterly/annual recurring
- Automatic generation
- Email notifications
- Auto-payment processing

### Credit Notes

Issue credit for returns or adjustments:
```
Original Invoice: $1,000
Credit Note:      -$200
Net Amount:       $800
```

---

## Best Practices

### 1. Regular Reconciliation
- Reconcile bank accounts monthly
- Review accounts receivable weekly
- Check accounts payable before payments

### 2. Consistent Coding
- Use consistent account codes
- Include descriptive references
- Tag transactions by department/project

### 3. Period-End Procedures
- Review trial balance
- Post adjusting entries
- Generate financial statements
- Close the period

### 4. Access Control
- Limit who can post entries
- Separate duties (entry vs. approval)
- Review audit logs regularly

### 5. Backup and Security
- Daily database backups
- Secure password policies
- Regular security audits
- Disaster recovery plan

### 6. Documentation
- Document accounting policies
- Maintain procedure manuals
- Train staff on system use
- Keep audit documentation

---

## Future Enhancements

Planned features:
- [ ] Inventory management
- [ ] Fixed asset tracking
- [ ] Payroll integration
- [ ] Project accounting
- [ ] Consolidated statements
- [ ] Advanced budgeting
- [ ] Automated bank feeds
- [ ] OCR for bill capture
- [ ] Mobile app
- [ ] API webhooks
- [ ] Advanced analytics
- [ ] Machine learning fraud detection

---

## Support

For questions about these features, see:
- [README.md](README.md) - Overview and setup
- [API.md](API.md) - API documentation
- [EXAMPLES.md](EXAMPLES.md) - Usage examples
- [SETUP.md](SETUP.md) - Installation guide
