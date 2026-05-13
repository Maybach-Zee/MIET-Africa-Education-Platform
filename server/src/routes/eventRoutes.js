const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const { getAll, create, cancel } = require('../controllers/eventController');
const router = express.Router();

router.get('/', verifyToken, getAll); // any logged-in user can view events
router.post('/', verifyToken, authorize('ADMIN', 'MANAGER'), create);
router.put('/:id/cancel', verifyToken, authorize('ADMIN', 'MANAGER'), cancel);

module.exports = router;