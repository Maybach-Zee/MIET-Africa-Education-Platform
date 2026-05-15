const express = require('express');
const router = express.Router();
const { verifyToken, authorize } = require('../middleware/auth');
const { getAll, getPrincipalEvents, create, cancel,  getFacilitatorEvents, registerForEvent, cancelRegistration, getMyRegistrations, sendReminders } = require('../controllers/eventController');

router.get('/', verifyToken, getAll);
router.get('/principal', verifyToken, authorize('MANAGER'), getPrincipalEvents);
router.post('/', verifyToken, authorize('ADMIN', 'MANAGER'), create);
router.put('/:id/cancel', verifyToken, authorize('ADMIN', 'MANAGER'), cancel);

// Facilitator specific
router.get('/facilitator', verifyToken, authorize('FACILITATOR'), getFacilitatorEvents);
router.post('/register', verifyToken, authorize('FACILITATOR'), registerForEvent);
router.delete('/register', verifyToken, authorize('FACILITATOR'), cancelRegistration); // using DELETE with body
router.get('/my-registrations', verifyToken, authorize('FACILITATOR'), getMyRegistrations);

// Reminders (admin only)
router.post('/send-reminders', verifyToken, authorize('ADMIN'), sendReminders);

module.exports = router;