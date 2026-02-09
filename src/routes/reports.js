const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/trial-balance', reportController.getTrialBalance);
router.get('/balance-sheet', reportController.getBalanceSheet);
router.get('/income-statement', reportController.getIncomeStatement);
router.get('/cash-flow', reportController.getCashFlowStatement);
router.get('/aging', reportController.getAgingReport);
router.get('/account/:accountId/summary', reportController.getAccountSummary);

module.exports = router;
