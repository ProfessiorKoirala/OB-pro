const pool = require('../config/database');
const Decimal = require('decimal.js');

class FinancialReportService {
  static async getTrialBalance(organizationId, asOfDate = null) {
    const dateCondition = asOfDate ? 'AND le.entry_date <= $2' : '';
    const params = asOfDate ? [organizationId, asOfDate] : [organizationId];
    
    const query = `
      SELECT 
        a.id,
        a.code,
        a.name,
        at.category,
        at.normal_balance,
        COALESCE(SUM(le.debit), 0) as total_debit,
        COALESCE(SUM(le.credit), 0) as total_credit,
        CASE 
          WHEN at.normal_balance = 'debit' THEN 
            COALESCE(SUM(le.debit), 0) - COALESCE(SUM(le.credit), 0)
          ELSE 
            COALESCE(SUM(le.credit), 0) - COALESCE(SUM(le.debit), 0)
        END as balance
      FROM accounts a
      LEFT JOIN account_types at ON a.account_type_id = at.id
      LEFT JOIN ledger_entries le ON a.id = le.account_id ${dateCondition}
      WHERE a.organization_id = $1 AND a.is_active = true
      GROUP BY a.id, a.code, a.name, at.category, at.normal_balance
      HAVING COALESCE(SUM(le.debit), 0) != 0 OR COALESCE(SUM(le.credit), 0) != 0
      ORDER BY a.code
    `;
    
    const result = await pool.query(query, params);
    
    let totalDebits = new Decimal(0);
    let totalCredits = new Decimal(0);
    
    const accounts = result.rows.map(row => {
      const debit = new Decimal(row.total_debit);
      const credit = new Decimal(row.total_credit);
      const balance = new Decimal(row.balance);
      
      totalDebits = totalDebits.plus(debit);
      totalCredits = totalCredits.plus(credit);
      
      return {
        id: row.id,
        code: row.code,
        name: row.name,
        category: row.category,
        normalBalance: row.normal_balance,
        totalDebit: debit.toString(),
        totalCredit: credit.toString(),
        balance: balance.toString()
      };
    });
    
    return {
      asOfDate: asOfDate || new Date().toISOString().split('T')[0],
      accounts,
      totalDebits: totalDebits.toString(),
      totalCredits: totalCredits.toString(),
      isBalanced: totalDebits.equals(totalCredits)
    };
  }
  
  static async getBalanceSheet(organizationId, asOfDate = null) {
    const date = asOfDate || new Date().toISOString().split('T')[0];
    
    const query = `
      SELECT 
        a.id,
        a.code,
        a.name,
        at.category,
        at.normal_balance,
        CASE 
          WHEN at.normal_balance = 'debit' THEN 
            COALESCE(SUM(le.debit), 0) - COALESCE(SUM(le.credit), 0)
          ELSE 
            COALESCE(SUM(le.credit), 0) - COALESCE(SUM(le.debit), 0)
        END as balance
      FROM accounts a
      LEFT JOIN account_types at ON a.account_type_id = at.id
      LEFT JOIN ledger_entries le ON a.id = le.account_id AND le.entry_date <= $2
      WHERE a.organization_id = $1 
        AND at.category IN ('asset', 'liability', 'equity')
        AND a.is_active = true
      GROUP BY a.id, a.code, a.name, at.category, at.normal_balance
      HAVING COALESCE(SUM(le.debit), 0) != 0 OR COALESCE(SUM(le.credit), 0) != 0
      ORDER BY at.category, a.code
    `;
    
    const result = await pool.query(query, [organizationId, date]);
    
    const assets = [];
    const liabilities = [];
    const equity = [];
    
    let totalAssets = new Decimal(0);
    let totalLiabilities = new Decimal(0);
    let totalEquity = new Decimal(0);
    
    for (const row of result.rows) {
      const balance = new Decimal(row.balance);
      
      const item = {
        id: row.id,
        code: row.code,
        name: row.name,
        balance: balance.toString()
      };
      
      if (row.category === 'asset') {
        assets.push(item);
        totalAssets = totalAssets.plus(balance);
      } else if (row.category === 'liability') {
        liabilities.push(item);
        totalLiabilities = totalLiabilities.plus(balance);
      } else if (row.category === 'equity') {
        equity.push(item);
        totalEquity = totalEquity.plus(balance);
      }
    }
    
    const netIncome = await this.getNetIncome(organizationId, null, date);
    totalEquity = totalEquity.plus(new Decimal(netIncome.netIncome));
    
    return {
      asOfDate: date,
      assets,
      liabilities,
      equity,
      totalAssets: totalAssets.toString(),
      totalLiabilities: totalLiabilities.toString(),
      totalEquity: totalEquity.toString(),
      totalLiabilitiesAndEquity: totalLiabilities.plus(totalEquity).toString()
    };
  }
  
  static async getIncomeStatement(organizationId, startDate, endDate) {
    const start = startDate || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];
    
    const query = `
      SELECT 
        a.id,
        a.code,
        a.name,
        at.category,
        at.normal_balance,
        CASE 
          WHEN at.normal_balance = 'debit' THEN 
            COALESCE(SUM(le.debit), 0) - COALESCE(SUM(le.credit), 0)
          ELSE 
            COALESCE(SUM(le.credit), 0) - COALESCE(SUM(le.debit), 0)
        END as balance
      FROM accounts a
      LEFT JOIN account_types at ON a.account_type_id = at.id
      LEFT JOIN ledger_entries le ON a.id = le.account_id 
        AND le.entry_date >= $2 AND le.entry_date <= $3
      WHERE a.organization_id = $1 
        AND at.category IN ('revenue', 'expense')
        AND a.is_active = true
      GROUP BY a.id, a.code, a.name, at.category, at.normal_balance
      ORDER BY at.category DESC, a.code
    `;
    
    const result = await pool.query(query, [organizationId, start, end]);
    
    const revenue = [];
    const expenses = [];
    
    let totalRevenue = new Decimal(0);
    let totalExpenses = new Decimal(0);
    
    for (const row of result.rows) {
      const balance = new Decimal(row.balance);
      
      const item = {
        id: row.id,
        code: row.code,
        name: row.name,
        amount: balance.toString()
      };
      
      if (row.category === 'revenue') {
        revenue.push(item);
        totalRevenue = totalRevenue.plus(balance);
      } else if (row.category === 'expense') {
        expenses.push(item);
        totalExpenses = totalExpenses.plus(balance);
      }
    }
    
    const netIncome = totalRevenue.minus(totalExpenses);
    
    return {
      startDate: start,
      endDate: end,
      revenue,
      expenses,
      totalRevenue: totalRevenue.toString(),
      totalExpenses: totalExpenses.toString(),
      netIncome: netIncome.toString()
    };
  }
  
  static async getCashFlowStatement(organizationId, startDate, endDate) {
    const start = startDate || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];
    
    const query = `
      SELECT 
        le.entry_date,
        le.description,
        le.debit,
        le.credit,
        a.name as account_name,
        at.category
      FROM ledger_entries le
      LEFT JOIN accounts a ON le.account_id = a.id
      LEFT JOIN account_types at ON a.account_type_id = at.id
      WHERE le.organization_id = $1
        AND le.entry_date >= $2 
        AND le.entry_date <= $3
        AND at.category IN ('asset', 'liability', 'equity', 'revenue', 'expense')
      ORDER BY le.entry_date
    `;
    
    const result = await pool.query(query, [organizationId, start, end]);
    
    let operatingActivities = new Decimal(0);
    let investingActivities = new Decimal(0);
    let financingActivities = new Decimal(0);
    
    for (const row of result.rows) {
      const debit = new Decimal(row.debit);
      const credit = new Decimal(row.credit);
      const netChange = credit.minus(debit);
      
      if (row.category === 'revenue' || row.category === 'expense') {
        operatingActivities = operatingActivities.plus(netChange);
      } else if (row.account_name.toLowerCase().includes('equipment') || 
                 row.account_name.toLowerCase().includes('investment')) {
        investingActivities = investingActivities.plus(netChange);
      } else if (row.account_name.toLowerCase().includes('loan') || 
                 row.account_name.toLowerCase().includes('equity')) {
        financingActivities = financingActivities.plus(netChange);
      }
    }
    
    const netCashFlow = operatingActivities.plus(investingActivities).plus(financingActivities);
    
    return {
      startDate: start,
      endDate: end,
      operatingActivities: operatingActivities.toString(),
      investingActivities: investingActivities.toString(),
      financingActivities: financingActivities.toString(),
      netCashFlow: netCashFlow.toString()
    };
  }
  
  static async getNetIncome(organizationId, startDate, endDate) {
    const start = startDate || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];
    
    const query = `
      SELECT 
        at.category,
        COALESCE(SUM(le.credit), 0) - COALESCE(SUM(le.debit), 0) as net_amount
      FROM ledger_entries le
      LEFT JOIN accounts a ON le.account_id = a.id
      LEFT JOIN account_types at ON a.account_type_id = at.id
      WHERE le.organization_id = $1
        AND le.entry_date >= $2 
        AND le.entry_date <= $3
        AND at.category IN ('revenue', 'expense')
      GROUP BY at.category
    `;
    
    const result = await pool.query(query, [organizationId, start, end]);
    
    let revenue = new Decimal(0);
    let expenses = new Decimal(0);
    
    for (const row of result.rows) {
      const amount = new Decimal(row.net_amount);
      
      if (row.category === 'revenue') {
        revenue = amount;
      } else if (row.category === 'expense') {
        expenses = amount.negated();
      }
    }
    
    const netIncome = revenue.minus(expenses);
    
    return {
      startDate: start,
      endDate: end,
      revenue: revenue.toString(),
      expenses: expenses.toString(),
      netIncome: netIncome.toString()
    };
  }
  
  static async getAccountSummary(organizationId, accountId, startDate, endDate) {
    const query = `
      SELECT 
        le.entry_date,
        le.description,
        le.debit,
        le.credit,
        le.balance,
        je.entry_number,
        je.reference
      FROM ledger_entries le
      LEFT JOIN journal_entries je ON le.journal_entry_id = je.id
      WHERE le.organization_id = $1
        AND le.account_id = $2
        AND le.entry_date >= $3
        AND le.entry_date <= $4
      ORDER BY le.entry_date, le.created_at
    `;
    
    const result = await pool.query(query, [organizationId, accountId, startDate, endDate]);
    
    let openingBalance = new Decimal(0);
    const transactions = result.rows.map(row => ({
      date: row.entry_date,
      description: row.description,
      reference: row.reference,
      entryNumber: row.entry_number,
      debit: row.debit,
      credit: row.credit,
      balance: row.balance
    }));
    
    if (result.rows.length > 0) {
      const firstBalance = new Decimal(result.rows[0].balance);
      const firstDebit = new Decimal(result.rows[0].debit);
      const firstCredit = new Decimal(result.rows[0].credit);
      openingBalance = firstBalance.minus(firstCredit).plus(firstDebit);
    }
    
    return {
      accountId,
      startDate,
      endDate,
      openingBalance: openingBalance.toString(),
      transactions,
      closingBalance: result.rows.length > 0 ? result.rows[result.rows.length - 1].balance : '0'
    };
  }
  
  static async getAgingReport(organizationId, reportType = 'receivable') {
    const table = reportType === 'receivable' ? 'invoices' : 'bills';
    const entityField = reportType === 'receivable' ? 'customer_id' : 'vendor_id';
    const entityTable = reportType === 'receivable' ? 'customers' : 'vendors';
    
    const query = `
      SELECT 
        t.id,
        t.${table === 'invoices' ? 'invoice' : 'bill'}_number as document_number,
        t.${table === 'invoices' ? 'invoice' : 'bill'}_date as document_date,
        t.due_date,
        t.amount_due,
        e.name as entity_name,
        CURRENT_DATE - t.due_date as days_overdue
      FROM ${table} t
      LEFT JOIN ${entityTable} e ON t.${entityField} = e.id
      WHERE t.organization_id = $1
        AND t.amount_due > 0
        AND t.status NOT IN ('paid', 'void')
      ORDER BY t.due_date
    `;
    
    const result = await pool.query(query, [organizationId]);
    
    const aging = {
      current: [],
      days_1_30: [],
      days_31_60: [],
      days_61_90: [],
      over_90: []
    };
    
    let totalCurrent = new Decimal(0);
    let total1_30 = new Decimal(0);
    let total31_60 = new Decimal(0);
    let total61_90 = new Decimal(0);
    let totalOver90 = new Decimal(0);
    
    for (const row of result.rows) {
      const amount = new Decimal(row.amount_due);
      const days = parseInt(row.days_overdue);
      
      const item = {
        id: row.id,
        documentNumber: row.document_number,
        documentDate: row.document_date,
        dueDate: row.due_date,
        entityName: row.entity_name,
        amountDue: amount.toString(),
        daysOverdue: days
      };
      
      if (days <= 0) {
        aging.current.push(item);
        totalCurrent = totalCurrent.plus(amount);
      } else if (days <= 30) {
        aging.days_1_30.push(item);
        total1_30 = total1_30.plus(amount);
      } else if (days <= 60) {
        aging.days_31_60.push(item);
        total31_60 = total31_60.plus(amount);
      } else if (days <= 90) {
        aging.days_61_90.push(item);
        total61_90 = total61_90.plus(amount);
      } else {
        aging.over_90.push(item);
        totalOver90 = totalOver90.plus(amount);
      }
    }
    
    const grandTotal = totalCurrent.plus(total1_30).plus(total31_60).plus(total61_90).plus(totalOver90);
    
    return {
      reportType,
      generatedAt: new Date().toISOString(),
      aging,
      totals: {
        current: totalCurrent.toString(),
        days_1_30: total1_30.toString(),
        days_31_60: total31_60.toString(),
        days_61_90: total61_90.toString(),
        over_90: totalOver90.toString(),
        grandTotal: grandTotal.toString()
      }
    };
  }
}

module.exports = FinancialReportService;
