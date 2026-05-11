const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const { getSummary, getProvinceStats, getMonthlyRegistrations, getCourseStats } = require('../controllers/dashboardController');
const router = express.Router();

router.get('/summary', verifyToken, authorize('ADMIN', 'MANAGER'), getSummary);
router.get('/province-stats', verifyToken, authorize('ADMIN', 'MANAGER'), getProvinceStats);
router.get('/monthly-registrations', verifyToken, authorize('ADMIN', 'MANAGER'), getMonthlyRegistrations);
router.get('/course-stats', verifyToken, authorize('ADMIN', 'MANAGER'), getCourseStats);

module.exports = router;