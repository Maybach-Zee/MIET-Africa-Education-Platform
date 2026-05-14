// server/src/routes/resourceRoutes.js
const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getAll, getAllAdmin, create, update, approve, archive, remove } = require('../controllers/resourceController');
const router = express.Router();

router.get('/', getAll);
router.get('/admin', verifyToken, authorize('ADMIN', 'MANAGER'), getAllAdmin);
router.post('/', verifyToken, authorize('ADMIN', 'MANAGER'), upload.single('file'), create);
router.put('/:id', verifyToken, authorize('ADMIN', 'MANAGER'), upload.single('file'), update);
router.put('/:id/approve', verifyToken, authorize('ADMIN', 'MANAGER'), approve);
router.put('/:id/archive', verifyToken, authorize('ADMIN', 'MANAGER'), archive);
router.delete('/:id', verifyToken, authorize('ADMIN', 'MANAGER'), remove);

module.exports = router;