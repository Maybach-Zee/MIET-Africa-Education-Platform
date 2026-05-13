const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const { getAll, approve, issue } = require('../controllers/certificateController');
const router = express.Router();

router.get('/', verifyToken, getAll); // all logged-in users
router.put('/:id/approve', verifyToken, authorize('ADMIN', 'MANAGER'), approve);
router.put('/:id/issue', verifyToken, authorize('ADMIN', 'MANAGER'), issue);

module.exports = router;