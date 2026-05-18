const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const {
  getDonorImpact,
  getLearnerSummary,
  getMonthlyReport,
  getQuarterlyReport,
  getSchoolReport,
  getSchoolQuarterlyReport
} = require('../controllers/reportController');

const router = express.Router();

// Admin reports
router.get('/impact', verifyToken, authorize('ADMIN'), getDonorImpact);
router.get('/learner-summary', verifyToken, authorize('ADMIN'), getLearnerSummary);
router.get('/monthly', verifyToken, authorize('ADMIN'), getMonthlyReport);
router.get('/quarterly', verifyToken, authorize('ADMIN'), getQuarterlyReport);

// Principal reports (own school)
router.get('/school/monthly', verifyToken, authorize('MANAGER'), getSchoolReport);
router.get('/school/quarterly', verifyToken, authorize('MANAGER'), getSchoolQuarterlyReport);

module.exports = router;