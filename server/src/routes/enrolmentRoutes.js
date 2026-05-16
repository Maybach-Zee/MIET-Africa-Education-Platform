const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const { getAll, create, updateStatus, getForSchool } = require('../controllers/enrolmentController');
const router = express.Router();

router.get('/', verifyToken, authorize('ADMIN', 'MANAGER'), getAll);
router.post('/', verifyToken, authorize('ADMIN', 'MANAGER'), create);
router.put('/:id/status', verifyToken, authorize('ADMIN', 'MANAGER'), updateStatus);
router.get('/mine', verifyToken, authorize('MANAGER'), getForSchool);

module.exports = router;