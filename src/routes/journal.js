const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

router.use(authenticate);

router.post('/', validate(schemas.createJournalEntry), journalController.create);
router.get('/', journalController.getAll);
router.get('/:id', journalController.getById);
router.post('/:id/post', journalController.post);
router.post('/:id/void', journalController.void);

module.exports = router;
