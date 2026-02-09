const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');

async function seed() {
  const client = await pool.connect();
  
  try {
    logger.info('Starting database seeding...');
    
    await client.query('BEGIN');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const userResult = await client.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, ['admin@example.com', hashedPassword, 'Admin', 'User', 'admin']);
    
    const userId = userResult.rows[0].id;
    
    const orgResult = await client.query(`
      INSERT INTO organizations (name, currency, fiscal_year_start)
      VALUES ($1, $2, $3)
      RETURNING id
    `, ['Demo Company', 'USD', 1]);
    
    const orgId = orgResult.rows[0].id;
    
    const accountTypes = [
      { name: 'Cash', category: 'asset', normal_balance: 'debit', description: 'Cash and cash equivalents' },
      { name: 'Accounts Receivable', category: 'asset', normal_balance: 'debit', description: 'Money owed by customers' },
      { name: 'Inventory', category: 'asset', normal_balance: 'debit', description: 'Goods for sale' },
      { name: 'Fixed Assets', category: 'asset', normal_balance: 'debit', description: 'Long-term assets' },
      { name: 'Accounts Payable', category: 'liability', normal_balance: 'credit', description: 'Money owed to vendors' },
      { name: 'Short-term Debt', category: 'liability', normal_balance: 'credit', description: 'Loans due within a year' },
      { name: 'Long-term Debt', category: 'liability', normal_balance: 'credit', description: 'Loans due after a year' },
      { name: 'Equity', category: 'equity', normal_balance: 'credit', description: 'Owner\'s equity' },
      { name: 'Revenue', category: 'revenue', normal_balance: 'credit', description: 'Income from operations' },
      { name: 'Cost of Goods Sold', category: 'expense', normal_balance: 'debit', description: 'Direct costs of goods sold' },
      { name: 'Operating Expenses', category: 'expense', normal_balance: 'debit', description: 'Day-to-day operating costs' },
      { name: 'Other Income', category: 'revenue', normal_balance: 'credit', description: 'Non-operating income' },
      { name: 'Other Expenses', category: 'expense', normal_balance: 'debit', description: 'Non-operating expenses' }
    ];
    
    const accountTypeIds = {};
    for (const type of accountTypes) {
      const result = await client.query(`
        INSERT INTO account_types (name, category, normal_balance, description)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [type.name, type.category, type.normal_balance, type.description]);
      accountTypeIds[type.name] = result.rows[0].id;
    }
    
    const accounts = [
      { code: '1000', name: 'Cash', type: 'Cash' },
      { code: '1010', name: 'Petty Cash', type: 'Cash' },
      { code: '1100', name: 'Checking Account', type: 'Cash' },
      { code: '1110', name: 'Savings Account', type: 'Cash' },
      { code: '1200', name: 'Accounts Receivable', type: 'Accounts Receivable' },
      { code: '1300', name: 'Inventory', type: 'Inventory' },
      { code: '1500', name: 'Equipment', type: 'Fixed Assets' },
      { code: '1510', name: 'Furniture', type: 'Fixed Assets' },
      { code: '1520', name: 'Vehicles', type: 'Fixed Assets' },
      { code: '2000', name: 'Accounts Payable', type: 'Accounts Payable' },
      { code: '2100', name: 'Credit Card Payable', type: 'Short-term Debt' },
      { code: '2200', name: 'Short-term Loans', type: 'Short-term Debt' },
      { code: '2500', name: 'Long-term Loans', type: 'Long-term Debt' },
      { code: '3000', name: 'Owner\'s Equity', type: 'Equity' },
      { code: '3100', name: 'Retained Earnings', type: 'Equity' },
      { code: '4000', name: 'Sales Revenue', type: 'Revenue' },
      { code: '4100', name: 'Service Revenue', type: 'Revenue' },
      { code: '4200', name: 'Interest Income', type: 'Other Income' },
      { code: '5000', name: 'Cost of Goods Sold', type: 'Cost of Goods Sold' },
      { code: '6000', name: 'Salaries and Wages', type: 'Operating Expenses' },
      { code: '6100', name: 'Rent Expense', type: 'Operating Expenses' },
      { code: '6200', name: 'Utilities Expense', type: 'Operating Expenses' },
      { code: '6300', name: 'Office Supplies', type: 'Operating Expenses' },
      { code: '6400', name: 'Insurance Expense', type: 'Operating Expenses' },
      { code: '6500', name: 'Marketing Expense', type: 'Operating Expenses' },
      { code: '6600', name: 'Depreciation Expense', type: 'Operating Expenses' },
      { code: '7000', name: 'Interest Expense', type: 'Other Expenses' }
    ];
    
    for (const account of accounts) {
      await client.query(`
        INSERT INTO accounts (organization_id, account_type_id, code, name, is_system)
        VALUES ($1, $2, $3, $4, $5)
      `, [orgId, accountTypeIds[account.type], account.code, account.name, true]);
    }
    
    const currencies = [
      { code: 'USD', name: 'US Dollar', symbol: '$', decimal_places: 2 },
      { code: 'EUR', name: 'Euro', symbol: '€', decimal_places: 2 },
      { code: 'GBP', name: 'British Pound', symbol: '£', decimal_places: 2 },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimal_places: 0 },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimal_places: 2 },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimal_places: 2 }
    ];
    
    for (const currency of currencies) {
      await client.query(`
        INSERT INTO currencies (code, name, symbol, decimal_places)
        VALUES ($1, $2, $3, $4)
      `, [currency.code, currency.name, currency.symbol, currency.decimal_places]);
    }
    
    const taxRates = [
      { name: 'Standard VAT', rate: 20.00 },
      { name: 'Reduced VAT', rate: 10.00 },
      { name: 'Sales Tax', rate: 8.50 },
      { name: 'Zero Rate', rate: 0.00 }
    ];
    
    for (const tax of taxRates) {
      await client.query(`
        INSERT INTO tax_rates (organization_id, name, rate)
        VALUES ($1, $2, $3)
      `, [orgId, tax.name, tax.rate]);
    }
    
    await client.query('COMMIT');
    
    logger.info('Database seeding completed successfully');
    logger.info('Default admin credentials:');
    logger.info('Email: admin@example.com');
    logger.info('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

seed();
