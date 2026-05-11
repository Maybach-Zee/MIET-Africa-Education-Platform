const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getAll, getAllAdmin, create, approve, remove } = require('../controllers/resourceController');
const router = express.Router();

router.get('/', getAll); // approved only (for teachers)
router.get('/admin', verifyToken, authorize('ADMIN', 'MANAGER'), getAllAdmin);
router.post('/', verifyToken, authorize('ADMIN', 'MANAGER'), upload.single('file'), create);
router.put('/:id/approve', verifyToken, authorize('ADMIN', 'MANAGER'), approve);
router.delete('/:id', verifyToken, authorize('ADMIN', 'MANAGER'), remove);

module.exports = router;