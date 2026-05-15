const express = require('express');
const router = express.Router();
const { verifyToken, authorize } = require('../middleware/auth');
const { getAll, getMyCourses, create } = require('../controllers/courseController');

router.get('/', verifyToken, authorize('ADMIN', 'MANAGER'), getAll);
router.get('/mine', verifyToken, authorize('MANAGER'), getMyCourses);
router.post('/', verifyToken, authorize('ADMIN', 'MANAGER'), create);

module.exports = router;