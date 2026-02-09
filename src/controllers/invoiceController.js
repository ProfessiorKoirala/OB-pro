const Invoice = require('../models/Invoice');
const logger = require('../config/logger');

const invoiceController = {
  async create(req, res) {
    try {
      const organizationId = req.body.organizationId || req.user.organizationId;
      const invoice = await Invoice.create(organizationId, req.body);
      
      logger.info(`Invoice created: ${invoice.invoice_number}`, { userId: req.user.id });
      res.status(201).json(invoice);
    } catch (error) {
      logger.error('Error creating invoice:', error);
      res.status(400).json({ error: error.message });
    }
  },
  
  async getById(req, res) {
    try {
      const invoice = await Invoice.findById(req.params.id);
      
      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      
      res.json(invoice);
    } catch (error) {
      logger.error('Error fetching invoice:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  async getAll(req, res) {
    try {
      const organizationId = req.query.organizationId || req.user.organizationId;
      const filters = {
        status: req.query.status,
        customerId: req.query.customerId,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };
      
      const invoices = await Invoice.findByOrganization(organizationId, filters);
      res.json(invoices);
    } catch (error) {
      logger.error('Error fetching invoices:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const invoice = await Invoice.updateStatus(req.params.id, status);
      
      logger.info(`Invoice status updated: ${invoice.invoice_number}`, { userId: req.user.id });
      res.json(invoice);
    } catch (error) {
      logger.error('Error updating invoice status:', error);
      res.status(400).json({ error: error.message });
    }
  },
  
  async recordPayment(req, res) {
    try {
      const { amount } = req.body;
      const invoice = await Invoice.recordPayment(req.params.id, amount);
      
      logger.info(`Payment recorded for invoice: ${invoice.invoice_number}`, { userId: req.user.id });
      res.json(invoice);
    } catch (error) {
      logger.error('Error recording payment:', error);
      res.status(400).json({ error: error.message });
    }
  },
  
  async getOverdue(req, res) {
    try {
      const organizationId = req.query.organizationId || req.user.organizationId;
      const invoices = await Invoice.getOverdueInvoices(organizationId);
      
      res.json(invoices);
    } catch (error) {
      logger.error('Error fetching overdue invoices:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = invoiceController;
