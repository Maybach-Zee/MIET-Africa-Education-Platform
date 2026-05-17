const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const { getAll, create, update, remove, addFacilitator, getTeachers, getUnassignedManagers, updateTeacher, toggleTeacherActive } = require('../controllers/userController');
const router = express.Router();

router.get('/', verifyToken, authorize('ADMIN'), getAll);
router.post('/', verifyToken, authorize('ADMIN'), create);
router.put('/:id', verifyToken, authorize('ADMIN'), update);
router.delete('/:id', verifyToken, authorize('ADMIN'), remove);
router.get('/unassigned-managers', verifyToken, authorize('ADMIN'), getUnassignedManagers);
router.post('/facilitator', verifyToken, authorize('MANAGER'), addFacilitator);
router.get('/teachers', verifyToken, authorize('MANAGER'), getTeachers);
router.put('/teacher/:id', verifyToken, authorize('MANAGER'), updateTeacher);
router.put('/teacher/:id/toggle-active', verifyToken, authorize('MANAGER'), toggleTeacherActive);

module.exports = router;