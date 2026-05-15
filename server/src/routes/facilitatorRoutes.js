const express = require('express');
const router = express.Router();
const { verifyToken, authorize } = require('../middleware/auth');
const {
  getMyCourses,
  getMySessions,
  getMyAssessments,
  getMyAttendance,
  getSessionLearners,
  saveAttendance,
  getCourseLearners,
  createAssessment
} = require('../controllers/facilitatorController');

router.get('/courses', verifyToken, authorize('FACILITATOR'), getMyCourses);
router.get('/sessions', verifyToken, authorize('FACILITATOR'), getMySessions);
router.get('/assessments', verifyToken, authorize('FACILITATOR'), getMyAssessments);
router.get('/attendance', verifyToken, authorize('FACILITATOR'), getMyAttendance);
router.get('/sessions/:sessionId/learners', verifyToken, authorize('FACILITATOR'), getSessionLearners);
router.post('/sessions/:sessionId/attendance', verifyToken, authorize('FACILITATOR'), saveAttendance);
router.get('/courses/:courseId/learners', verifyToken, authorize('FACILITATOR'), getCourseLearners);
router.post('/assessments', verifyToken, authorize('FACILITATOR'), createAssessment);

module.exports = router;