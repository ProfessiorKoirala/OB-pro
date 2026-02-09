const Account = require('../models/Account');
const logger = require('../config/logger');

const accountController = {
  async create(req, res) {
    try {
      const organizationId = req.body.organizationId || req.user.organizationId;
      const account = await Account.create(organizationId, req.body);
      
      logger.info(`Account created: ${account.code}`, { userId: req.user.id });
      res.status(201).json(account);
    } catch (error) {
      logger.error('Error creating account:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  async getById(req, res) {
    try {
      const account = await Account.findById(req.params.id);
      
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }
      
      res.json(account);
    } catch (error) {
      logger.error('Error fetching account:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  async getAll(req, res) {
    try {
      const organizationId = req.query.organizationId || req.user.organizationId;
      const filters = {
        isActive: req.query.isActive === 'true',
        category: req.query.category
      };
      
      const accounts = await Account.findByOrganization(organizationId, filters);
      res.json(accounts);
    } catch (error) {
      logger.error('Error fetching accounts:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  async update(req, res) {
    try {
      const account = await Account.update(req.params.id, req.body);
      
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }
      
      logger.info(`Account updated: ${account.code}`, { userId: req.user.id });
      res.json(account);
    } catch (error) {
      logger.error('Error updating account:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  async getBalance(req, res) {
    try {
      const { id } = req.params;
      const { asOfDate } = req.query;
      
      const balance = await Account.getBalance(id, asOfDate);
      res.json({ accountId: id, balance, asOfDate });
    } catch (error) {
      logger.error('Error fetching account balance:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  async getLedger(req, res) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      
      const entries = await Account.getLedgerEntries(id, startDate, endDate);
      res.json(entries);
    } catch (error) {
      logger.error('Error fetching ledger entries:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = accountController;
