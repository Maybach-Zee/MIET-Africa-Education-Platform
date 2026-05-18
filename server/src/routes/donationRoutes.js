const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const { getAll, create, processDonation } = require('../controllers/donationController');
const router = express.Router();

router.get('/', verifyToken, authorize('ADMIN', 'MANAGER', 'DONOR'), getAll);
router.post('/', verifyToken, authorize('ADMIN', 'MANAGER'), create);
router.put('/:id/process', verifyToken, authorize('ADMIN', 'DONOR'), processDonation);

module.exports = router;