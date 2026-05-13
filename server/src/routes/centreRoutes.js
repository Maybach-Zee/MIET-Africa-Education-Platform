const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const { getAll, register, approve } = require('../controllers/centreController');
const router = express.Router();

router.get('/', verifyToken, authorize('ADMIN', 'MANAGER'), getAll);
router.post('/register', verifyToken, authorize('ADMIN', 'MANAGER'), register);
router.put('/:id/approve', verifyToken, authorize('ADMIN'), approve);

module.exports = router;