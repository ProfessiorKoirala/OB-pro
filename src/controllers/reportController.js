const FinancialReportService = require('../services/FinancialReportService');
const logger = require('../config/logger');

const reportController = {
  async getTrialBalance(req, res) {
    try {
      const organizationId = req.query.organizationId || req.user.organizationId;
      const { asOfDate } = req.query;
      
      const report = await FinancialReportService.getTrialBalance(organizationId, asOfDate);
      
      logger.info('Trial balance generated', { userId: req.user.id });
      res.json(report);
    } catch (error) {
      logger.error('Error generating trial balance:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  async getBalanceSheet(req, res) {
    try {
      const organizationId = req.query.organizationId || req.user.organizationId;
      const { asOfDate } = req.query;
      
      const report = await FinancialReportService.getBalanceSheet(organizationId, asOfDate);
      
      logger.info('Balance sheet generated', { userId: req.user.id });
      res.json(report);
    } catch (error) {
      logger.error('Error generating balance sheet:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  async getIncomeStatement(req, res) {
    try {
      const organizationId = req.query.organizationId || req.user.organizationId;
      const { startDate, endDate } = req.query;
      
      const report = await FinancialReportService.getIncomeStatement(organizationId, startDate, endDate);
      
      logger.info('Income statement generated', { userId: req.user.id });
      res.json(report);
    } catch (error) {
      logger.error('Error generating income statement:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  async getCashFlowStatement(req, res) {
    try {
      const organizationId = req.query.organizationId || req.user.organizationId;
      const { startDate, endDate } = req.query;
      
      const report = await FinancialReportService.getCashFlowStatement(organizationId, startDate, endDate);
      
      logger.info('Cash flow statement generated', { userId: req.user.id });
      res.json(report);
    } catch (error) {
      logger.error('Error generating cash flow statement:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  async getAccountSummary(req, res) {
    try {
      const organizationId = req.query.organizationId || req.user.organizationId;
      const { accountId } = req.params;
      const { startDate, endDate } = req.query;
      
      const report = await FinancialReportService.getAccountSummary(
        organizationId, 
        accountId, 
        startDate, 
        endDate
      );
      
      logger.info('Account summary generated', { userId: req.user.id, accountId });
      res.json(report);
    } catch (error) {
      logger.error('Error generating account summary:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  async getAgingReport(req, res) {
    try {
      const organizationId = req.query.organizationId || req.user.organizationId;
      const { type } = req.query;
      
      const report = await FinancialReportService.getAgingReport(
        organizationId, 
        type || 'receivable'
      );
      
      logger.info('Aging report generated', { userId: req.user.id, type });
      res.json(report);
    } catch (error) {
      logger.error('Error generating aging report:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = reportController;
