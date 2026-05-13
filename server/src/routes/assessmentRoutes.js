const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const { getAll, create } = require('../controllers/assessmentController');
const router = express.Router();

router.get('/', verifyToken, authorize('ADMIN', 'MANAGER', 'FACILITATOR'), getAll);
router.post('/', verifyToken, authorize('ADMIN', 'MANAGER', 'FACILITATOR'), create);

module.exports = router;