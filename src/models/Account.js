const pool = require('../config/database');
const Decimal = require('decimal.js');

class Account {
  static async create(organizationId, accountData) {
    const query = `
      INSERT INTO accounts (
        organization_id, account_type_id, code, name, 
        description, parent_account_id, currency, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      organizationId,
      accountData.accountTypeId,
      accountData.code,
      accountData.name,
      accountData.description || null,
      accountData.parentAccountId || null,
      accountData.currency || 'USD',
      accountData.isActive !== undefined ? accountData.isActive : true
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  static async findById(id) {
    const query = `
      SELECT a.*, at.name as account_type_name, at.category, at.normal_balance
      FROM accounts a
      LEFT JOIN account_types at ON a.account_type_id = at.id
      WHERE a.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
  
  static async findByOrganization(organizationId, filters = {}) {
    let query = `
      SELECT a.*, at.name as account_type_name, at.category, at.normal_balance
      FROM accounts a
      LEFT JOIN account_types at ON a.account_type_id = at.id
      WHERE a.organization_id = $1
    `;
    
    const values = [organizationId];
    let paramIndex = 2;
    
    if (filters.isActive !== undefined) {
      query += ` AND a.is_active = $${paramIndex}`;
      values.push(filters.isActive);
      paramIndex++;
    }
    
    if (filters.category) {
      query += ` AND at.category = $${paramIndex}`;
      values.push(filters.category);
      paramIndex++;
    }
    
    query += ` ORDER BY a.code`;
    
    const result = await pool.query(query, values);
    return result.rows;
  }
  
  static async update(id, accountData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;
    
    if (accountData.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      values.push(accountData.name);
      paramIndex++;
    }
    
    if (accountData.description !== undefined) {
      fields.push(`description = $${paramIndex}`);
      values.push(accountData.description);
      paramIndex++;
    }
    
    if (accountData.isActive !== undefined) {
      fields.push(`is_active = $${paramIndex}`);
      values.push(accountData.isActive);
      paramIndex++;
    }
    
    if (fields.length === 0) {
      return await this.findById(id);
    }
    
    values.push(id);
    const query = `
      UPDATE accounts
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  static async updateBalance(accountId, amount, operation = 'add') {
    const account = await this.findById(accountId);
    if (!account) throw new Error('Account not found');
    
    const currentBalance = new Decimal(account.balance);
    const changeAmount = new Decimal(amount);
    
    let newBalance;
    if (operation === 'add') {
      newBalance = currentBalance.plus(changeAmount);
    } else {
      newBalance = currentBalance.minus(changeAmount);
    }
    
    const query = `
      UPDATE accounts
      SET balance = $1
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [newBalance.toString(), accountId]);
    return result.rows[0];
  }
  
  static async getBalance(accountId, asOfDate = null) {
    let query = `
      SELECT COALESCE(SUM(debit), 0) - COALESCE(SUM(credit), 0) as balance
      FROM ledger_entries
      WHERE account_id = $1
    `;
    
    const values = [accountId];
    
    if (asOfDate) {
      query += ` AND entry_date <= $2`;
      values.push(asOfDate);
    }
    
    const result = await pool.query(query, values);
    return result.rows[0].balance;
  }
  
  static async getLedgerEntries(accountId, startDate = null, endDate = null) {
    let query = `
      SELECT le.*, je.entry_number, je.description as journal_description
      FROM ledger_entries le
      LEFT JOIN journal_entries je ON le.journal_entry_id = je.id
      WHERE le.account_id = $1
    `;
    
    const values = [accountId];
    let paramIndex = 2;
    
    if (startDate) {
      query += ` AND le.entry_date >= $${paramIndex}`;
      values.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      query += ` AND le.entry_date <= $${paramIndex}`;
      values.push(endDate);
      paramIndex++;
    }
    
    query += ` ORDER BY le.entry_date, le.created_at`;
    
    const result = await pool.query(query, values);
    return result.rows;
  }
}

module.exports = Account;
