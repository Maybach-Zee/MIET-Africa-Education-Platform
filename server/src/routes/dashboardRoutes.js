const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const { getSummary, getProvinceStats, getMonthlyRegistrations, getCourseStats, getSchoolSummary, getAdminStats } = require('../controllers/dashboardController');
const router = express.Router();

router.get('/summary', verifyToken, authorize('ADMIN', 'MANAGER'), getSummary);
router.get('/province-stats', verifyToken, authorize('ADMIN', 'MANAGER'), getProvinceStats);
router.get('/monthly-registrations', verifyToken, authorize('ADMIN', 'MANAGER'), getMonthlyRegistrations);
router.get('/course-stats', verifyToken, authorize('ADMIN', 'MANAGER'), getCourseStats);
router.get('/school-summary', verifyToken, authorize('ADMIN', 'MANAGER'), getSchoolSummary);
router.get('/admin-stats', verifyToken, authorize('ADMIN'), getAdminStats);

module.exports = router;