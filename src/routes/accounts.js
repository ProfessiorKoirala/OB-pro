const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

router.use(authenticate);

router.post('/', validate(schemas.createAccount), accountController.create);
router.get('/', accountController.getAll);
router.get('/:id', accountController.getById);
router.put('/:id', accountController.update);
router.get('/:id/balance', accountController.getBalance);
router.get('/:id/ledger', accountController.getLedger);

module.exports = router;
