const JournalEntry = require('../models/JournalEntry');
const logger = require('../config/logger');

const journalController = {
  async create(req, res) {
    try {
      const organizationId = req.body.organizationId || req.user.organizationId;
      const journalEntry = await JournalEntry.create(organizationId, req.body, req.user.id);
      
      logger.info(`Journal entry created: ${journalEntry.entry_number}`, { userId: req.user.id });
      res.status(201).json(journalEntry);
    } catch (error) {
      logger.error('Error creating journal entry:', error);
      res.status(400).json({ error: error.message });
    }
  },
  
  async getById(req, res) {
    try {
      const journalEntry = await JournalEntry.findById(req.params.id);
      
      if (!journalEntry) {
        return res.status(404).json({ error: 'Journal entry not found' });
      }
      
      res.json(journalEntry);
    } catch (error) {
      logger.error('Error fetching journal entry:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  async getAll(req, res) {
    try {
      const organizationId = req.query.organizationId || req.user.organizationId;
      const filters = {
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };
      
      const entries = await JournalEntry.findByOrganization(organizationId, filters);
      res.json(entries);
    } catch (error) {
      logger.error('Error fetching journal entries:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  async post(req, res) {
    try {
      const journalEntry = await JournalEntry.post(req.params.id);
      
      logger.info(`Journal entry posted: ${journalEntry.entry_number}`, { userId: req.user.id });
      res.json(journalEntry);
    } catch (error) {
      logger.error('Error posting journal entry:', error);
      res.status(400).json({ error: error.message });
    }
  },
  
  async void(req, res) {
    try {
      const journalEntry = await JournalEntry.void(req.params.id);
      
      logger.info(`Journal entry voided: ${journalEntry.entry_number}`, { userId: req.user.id });
      res.json(journalEntry);
    } catch (error) {
      logger.error('Error voiding journal entry:', error);
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = journalController;
