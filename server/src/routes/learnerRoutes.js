const express = require('express');
const router = express.Router();
const { verifyToken, authorize } = require('../middleware/auth');
const { getByCentre, create, update, remove, toggleStatus } = require('../controllers/learnerController');

router.get('/', verifyToken, authorize('ADMIN', 'MANAGER', 'FACILITATOR'), getByCentre);
router.post('/', verifyToken, authorize('ADMIN', 'MANAGER'), create);
router.put('/:id', verifyToken, authorize('ADMIN', 'MANAGER'), update);
router.delete('/:id', verifyToken, authorize('ADMIN', 'MANAGER'), remove);
router.put('/:id/toggle-status', verifyToken, authorize('ADMIN', 'MANAGER'), toggleStatus);

module.exports = router;