const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const { getDonorImpact, getLearnerSummary, getAttendanceReport, getFeeCollection } = require('../controllers/reportController');
const router = express.Router();

router.get('/impact', verifyToken, authorize('ADMIN', 'MANAGER', 'DONOR'), getDonorImpact);
router.get('/learner-summary', verifyToken, authorize('ADMIN', 'MANAGER'), getLearnerSummary);
router.get('/attendance', verifyToken, authorize('ADMIN', 'MANAGER'), getAttendanceReport);
router.get('/fee-collection', verifyToken, authorize('ADMIN', 'MANAGER'), getFeeCollection);

module.exports = router;