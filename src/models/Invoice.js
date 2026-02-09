const pool = require('../config/database');
const Decimal = require('decimal.js');

class Invoice {
  static async create(organizationId, invoiceData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const invoiceNumber = await this.generateInvoiceNumber(organizationId);
      
      let subtotal = new Decimal(0);
      let taxAmount = new Decimal(0);
      
      if (invoiceData.lines && invoiceData.lines.length > 0) {
        for (const line of invoiceData.lines) {
          const lineAmount = new Decimal(line.quantity).times(new Decimal(line.unitPrice));
          subtotal = subtotal.plus(lineAmount);
          
          if (line.taxRate) {
            const lineTax = lineAmount.times(new Decimal(line.taxRate)).dividedBy(100);
            taxAmount = taxAmount.plus(lineTax);
          }
        }
      }
      
      const totalAmount = subtotal.plus(taxAmount);
      
      const invoiceQuery = `
        INSERT INTO invoices (
          organization_id, customer_id, invoice_number, invoice_date, 
          due_date, status, subtotal, tax_amount, total_amount, 
          amount_paid, amount_due, currency, notes, terms
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `;
      
      const invoiceValues = [
        organizationId,
        invoiceData.customerId,
        invoiceNumber,
        invoiceData.invoiceDate,
        invoiceData.dueDate,
        'draft',
        subtotal.toString(),
        taxAmount.toString(),
        totalAmount.toString(),
        0,
        totalAmount.toString(),
        invoiceData.currency || 'USD',
        invoiceData.notes || null,
        invoiceData.terms || null
      ];
      
      const invoiceResult = await client.query(invoiceQuery, invoiceValues);
      const invoice = invoiceResult.rows[0];
      
      if (invoiceData.lines && invoiceData.lines.length > 0) {
        for (let i = 0; i < invoiceData.lines.length; i++) {
          const line = invoiceData.lines[i];
          
          const lineAmount = new Decimal(line.quantity).times(new Decimal(line.unitPrice));
          
          const lineQuery = `
            INSERT INTO invoice_lines (
              invoice_id, description, quantity, unit_price, 
              tax_rate, amount, account_id, line_number
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
          `;
          
          const lineValues = [
            invoice.id,
            line.description,
            line.quantity,
            line.unitPrice,
            line.taxRate || 0,
            lineAmount.toString(),
            line.accountId || null,
            i + 1
          ];
          
          await client.query(lineQuery, lineValues);
        }
      }
      
      await client.query('COMMIT');
      return await this.findById(invoice.id);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  static async findById(id) {
    const invoiceQuery = `
      SELECT i.*, c.name as customer_name, c.email as customer_email
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = $1
    `;
    
    const invoiceResult = await pool.query(invoiceQuery, [id]);
    if (invoiceResult.rows.length === 0) return null;
    
    const invoice = invoiceResult.rows[0];
    
    const linesQuery = `
      SELECT il.*, a.code as account_code, a.name as account_name
      FROM invoice_lines il
      LEFT JOIN accounts a ON il.account_id = a.id
      WHERE il.invoice_id = $1
      ORDER BY il.line_number
    `;
    
    const linesResult = await pool.query(linesQuery, [id]);
    invoice.lines = linesResult.rows;
    
    return invoice;
  }
  
  static async findByOrganization(organizationId, filters = {}) {
    let query = `
      SELECT i.*, c.name as customer_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.organization_id = $1
    `;
    
    const values = [organizationId];
    let paramIndex = 2;
    
    if (filters.status) {
      query += ` AND i.status = $${paramIndex}`;
      values.push(filters.status);
      paramIndex++;
    }
    
    if (filters.customerId) {
      query += ` AND i.customer_id = $${paramIndex}`;
      values.push(filters.customerId);
      paramIndex++;
    }
    
    if (filters.startDate) {
      query += ` AND i.invoice_date >= $${paramIndex}`;
      values.push(filters.startDate);
      paramIndex++;
    }
    
    if (filters.endDate) {
      query += ` AND i.invoice_date <= $${paramIndex}`;
      values.push(filters.endDate);
      paramIndex++;
    }
    
    query += ` ORDER BY i.invoice_date DESC, i.invoice_number DESC`;
    
    const result = await pool.query(query, values);
    return result.rows;
  }
  
  static async updateStatus(id, status) {
    const query = `
      UPDATE invoices
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }
  
  static async recordPayment(invoiceId, paymentAmount) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const invoice = await this.findById(invoiceId);
      if (!invoice) throw new Error('Invoice not found');
      
      const currentAmountPaid = new Decimal(invoice.amount_paid);
      const payment = new Decimal(paymentAmount);
      const totalAmount = new Decimal(invoice.total_amount);
      
      const newAmountPaid = currentAmountPaid.plus(payment);
      const newAmountDue = totalAmount.minus(newAmountPaid);
      
      if (newAmountPaid.greaterThan(totalAmount)) {
        throw new Error('Payment amount exceeds invoice total');
      }
      
      let newStatus = invoice.status;
      if (newAmountDue.isZero()) {
        newStatus = 'paid';
      } else if (newAmountPaid.greaterThan(0)) {
        newStatus = 'partial';
      }
      
      const updateQuery = `
        UPDATE invoices
        SET amount_paid = $1, amount_due = $2, status = $3
        WHERE id = $4
        RETURNING *
      `;
      
      await client.query(updateQuery, [
        newAmountPaid.toString(),
        newAmountDue.toString(),
        newStatus,
        invoiceId
      ]);
      
      await client.query('COMMIT');
      return await this.findById(invoiceId);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  static async generateInvoiceNumber(organizationId) {
    const result = await pool.query(`
      SELECT invoice_number
      FROM invoices
      WHERE organization_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [organizationId]);
    
    if (result.rows.length === 0) {
      return 'INV-00001';
    }
    
    const lastNumber = result.rows[0].invoice_number;
    const match = lastNumber.match(/INV-(\d+)/);
    
    if (match) {
      const nextNumber = parseInt(match[1]) + 1;
      return `INV-${String(nextNumber).padStart(5, '0')}`;
    }
    
    return 'INV-00001';
  }
  
  static async getOverdueInvoices(organizationId) {
    const query = `
      SELECT i.*, c.name as customer_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.organization_id = $1
        AND i.status IN ('sent', 'partial')
        AND i.due_date < CURRENT_DATE
      ORDER BY i.due_date
    `;
    
    const result = await pool.query(query, [organizationId]);
    return result.rows;
  }
}

module.exports = Invoice;
