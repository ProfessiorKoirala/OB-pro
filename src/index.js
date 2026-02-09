const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const logger = require('./config/logger');
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/accounts');
const journalRoutes = require('./routes/journal');
const invoiceRoutes = require('./routes/invoices');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

app.get('/', (req, res) => {
  res.json({
    name: 'Advanced Accounting System API',
    version: '1.0.0',
    status: 'running',
    features: [
      'Double-entry bookkeeping',
      'Chart of Accounts',
      'Journal Entries',
      'General Ledger',
      'Invoicing',
      'Financial Reporting (Trial Balance, Balance Sheet, Income Statement, Cash Flow)',
      'Accounts Receivable/Payable Aging',
      'Multi-currency support',
      'Audit trail',
      'Budget tracking'
    ],
    endpoints: {
      auth: '/api/auth',
      accounts: '/api/accounts',
      journal: '/api/journal',
      invoices: '/api/invoices',
      reports: '/api/reports'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reports', reportRoutes);

app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  logger.info(`Advanced Accounting System API running on port ${PORT}`);
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`\nAPI Documentation:`);
  console.log(`- Health Check: GET http://localhost:${PORT}/health`);
  console.log(`- Authentication: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`- Accounts: http://localhost:${PORT}/api/accounts`);
  console.log(`- Journal Entries: http://localhost:${PORT}/api/journal`);
  console.log(`- Invoices: http://localhost:${PORT}/api/invoices`);
  console.log(`- Reports: http://localhost:${PORT}/api/reports`);
});

module.exports = app;
