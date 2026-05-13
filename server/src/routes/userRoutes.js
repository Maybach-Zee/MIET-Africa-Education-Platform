const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const { getAll, create, update, remove } = require('../controllers/userController');
const router = express.Router();

router.get('/', verifyToken, authorize('ADMIN'), getAll);
router.post('/', verifyToken, authorize('ADMIN'), create);
router.put('/:id', verifyToken, authorize('ADMIN'), update);
router.delete('/:id', verifyToken, authorize('ADMIN'), remove);

module.exports = router;