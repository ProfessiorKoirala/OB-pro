const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

router.use(authenticate);

router.post('/', validate(schemas.createInvoice), invoiceController.create);
router.get('/', invoiceController.getAll);
router.get('/overdue', invoiceController.getOverdue);
router.get('/:id', invoiceController.getById);
router.put('/:id/status', invoiceController.updateStatus);
router.post('/:id/payment', invoiceController.recordPayment);

module.exports = router;
