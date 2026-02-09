const pool = require('../config/database');
const Decimal = require('decimal.js');

class JournalEntry {
  static async create(organizationId, entryData, userId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const entryNumber = await this.generateEntryNumber(organizationId);
      
      const entryQuery = `
        INSERT INTO journal_entries (
          organization_id, entry_number, entry_date, 
          description, reference, status, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const entryValues = [
        organizationId,
        entryNumber,
        entryData.entryDate,
        entryData.description,
        entryData.reference || null,
        'draft',
        userId
      ];
      
      const entryResult = await client.query(entryQuery, entryValues);
      const journalEntry = entryResult.rows[0];
      
      if (entryData.lines && entryData.lines.length > 0) {
        let totalDebits = new Decimal(0);
        let totalCredits = new Decimal(0);
        
        for (let i = 0; i < entryData.lines.length; i++) {
          const line = entryData.lines[i];
          
          const lineQuery = `
            INSERT INTO journal_entry_lines (
              journal_entry_id, account_id, debit, credit, 
              description, line_number
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
          `;
          
          const lineValues = [
            journalEntry.id,
            line.accountId,
            line.debit || 0,
            line.credit || 0,
            line.description || null,
            i + 1
          ];
          
          await client.query(lineQuery, lineValues);
          
          totalDebits = totalDebits.plus(new Decimal(line.debit || 0));
          totalCredits = totalCredits.plus(new Decimal(line.credit || 0));
        }
        
        if (!totalDebits.equals(totalCredits)) {
          throw new Error('Journal entry is not balanced. Debits must equal credits.');
        }
      }
      
      await client.query('COMMIT');
      return await this.findById(journalEntry.id);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  static async findById(id) {
    const entryQuery = `
      SELECT je.*, u.email as created_by_email
      FROM journal_entries je
      LEFT JOIN users u ON je.created_by = u.id
      WHERE je.id = $1
    `;
    
    const entryResult = await pool.query(entryQuery, [id]);
    if (entryResult.rows.length === 0) return null;
    
    const journalEntry = entryResult.rows[0];
    
    const linesQuery = `
      SELECT jel.*, a.code as account_code, a.name as account_name
      FROM journal_entry_lines jel
      LEFT JOIN accounts a ON jel.account_id = a.id
      WHERE jel.journal_entry_id = $1
      ORDER BY jel.line_number
    `;
    
    const linesResult = await pool.query(linesQuery, [id]);
    journalEntry.lines = linesResult.rows;
    
    return journalEntry;
  }
  
  static async findByOrganization(organizationId, filters = {}) {
    let query = `
      SELECT je.*, u.email as created_by_email,
             COUNT(jel.id) as line_count
      FROM journal_entries je
      LEFT JOIN users u ON je.created_by = u.id
      LEFT JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
      WHERE je.organization_id = $1
    `;
    
    const values = [organizationId];
    let paramIndex = 2;
    
    if (filters.status) {
      query += ` AND je.status = $${paramIndex}`;
      values.push(filters.status);
      paramIndex++;
    }
    
    if (filters.startDate) {
      query += ` AND je.entry_date >= $${paramIndex}`;
      values.push(filters.startDate);
      paramIndex++;
    }
    
    if (filters.endDate) {
      query += ` AND je.entry_date <= $${paramIndex}`;
      values.push(filters.endDate);
      paramIndex++;
    }
    
    query += ` GROUP BY je.id, u.email ORDER BY je.entry_date DESC, je.entry_number DESC`;
    
    const result = await pool.query(query, values);
    return result.rows;
  }
  
  static async post(id) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const journalEntry = await this.findById(id);
      if (!journalEntry) throw new Error('Journal entry not found');
      
      if (journalEntry.status === 'posted') {
        throw new Error('Journal entry is already posted');
      }
      
      let totalDebits = new Decimal(0);
      let totalCredits = new Decimal(0);
      
      for (const line of journalEntry.lines) {
        totalDebits = totalDebits.plus(new Decimal(line.debit || 0));
        totalCredits = totalCredits.plus(new Decimal(line.credit || 0));
      }
      
      if (!totalDebits.equals(totalCredits)) {
        throw new Error('Cannot post unbalanced journal entry');
      }
      
      for (const line of journalEntry.lines) {
        const account = await client.query('SELECT * FROM accounts WHERE id = $1', [line.account_id]);
        if (account.rows.length === 0) {
          throw new Error(`Account not found: ${line.account_id}`);
        }
        
        const accountInfo = account.rows[0];
        const currentBalance = new Decimal(accountInfo.balance);
        const debit = new Decimal(line.debit || 0);
        const credit = new Decimal(line.credit || 0);
        
        let newBalance;
        if (accountInfo.normal_balance === 'debit') {
          newBalance = currentBalance.plus(debit).minus(credit);
        } else {
          newBalance = currentBalance.plus(credit).minus(debit);
        }
        
        await client.query(
          'UPDATE accounts SET balance = $1 WHERE id = $2',
          [newBalance.toString(), line.account_id]
        );
        
        await client.query(`
          INSERT INTO ledger_entries (
            organization_id, account_id, journal_entry_id, 
            journal_entry_line_id, entry_date, debit, credit, 
            balance, description
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          journalEntry.organization_id,
          line.account_id,
          journalEntry.id,
          line.id,
          journalEntry.entry_date,
          line.debit || 0,
          line.credit || 0,
          newBalance.toString(),
          line.description || journalEntry.description
        ]);
      }
      
      await client.query(
        'UPDATE journal_entries SET status = $1, posted_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['posted', id]
      );
      
      await client.query('COMMIT');
      return await this.findById(id);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  static async void(id) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const journalEntry = await this.findById(id);
      if (!journalEntry) throw new Error('Journal entry not found');
      
      if (journalEntry.status === 'void') {
        throw new Error('Journal entry is already voided');
      }
      
      if (journalEntry.status === 'posted') {
        for (const line of journalEntry.lines) {
          const account = await client.query('SELECT * FROM accounts WHERE id = $1', [line.account_id]);
          const accountInfo = account.rows[0];
          
          const currentBalance = new Decimal(accountInfo.balance);
          const debit = new Decimal(line.debit || 0);
          const credit = new Decimal(line.credit || 0);
          
          let newBalance;
          if (accountInfo.normal_balance === 'debit') {
            newBalance = currentBalance.minus(debit).plus(credit);
          } else {
            newBalance = currentBalance.minus(credit).plus(debit);
          }
          
          await client.query(
            'UPDATE accounts SET balance = $1 WHERE id = $2',
            [newBalance.toString(), line.account_id]
          );
        }
        
        await client.query(
          'DELETE FROM ledger_entries WHERE journal_entry_id = $1',
          [id]
        );
      }
      
      await client.query(
        'UPDATE journal_entries SET status = $1, voided_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['void', id]
      );
      
      await client.query('COMMIT');
      return await this.findById(id);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  static async generateEntryNumber(organizationId) {
    const result = await pool.query(`
      SELECT entry_number
      FROM journal_entries
      WHERE organization_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [organizationId]);
    
    if (result.rows.length === 0) {
      return 'JE-00001';
    }
    
    const lastNumber = result.rows[0].entry_number;
    const match = lastNumber.match(/JE-(\d+)/);
    
    if (match) {
      const nextNumber = parseInt(match[1]) + 1;
      return `JE-${String(nextNumber).padStart(5, '0')}`;
    }
    
    return 'JE-00001';
  }
}

module.exports = JournalEntry;
