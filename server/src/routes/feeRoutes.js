const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const { getAll, recordPayment } = require('../controllers/feeController');
const router = express.Router();

router.get('/', verifyToken, authorize('ADMIN', 'MANAGER'), getAll);
router.put('/:id/pay', verifyToken, authorize('ADMIN', 'MANAGER'), recordPayment);

module.exports = router;