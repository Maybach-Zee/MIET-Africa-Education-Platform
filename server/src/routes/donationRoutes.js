const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const { getAll, create } = require('../controllers/donationController');
const router = express.Router();

router.get('/', verifyToken, authorize('ADMIN', 'MANAGER', 'DONOR'), getAll);
router.post('/', verifyToken, authorize('ADMIN', 'MANAGER'), create);

module.exports = router;