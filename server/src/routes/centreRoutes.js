const express = require('express');

const {
  verifyToken,
  authorize
} = require('../middleware/auth');

const {
  getAll,
  register,
  approve,
  reject,
  getMyCentre
} = require('../controllers/centreController');

const router = express.Router();

// ========================================
// ADMIN + MANAGER
// VIEW ALL CENTRES
// ========================================

router.get(
  '/',
  verifyToken,
  authorize('ADMIN', 'MANAGER'),
  getAll
);

// ========================================
// REGISTER SCHOOL
// ========================================

router.post(
  '/register',
  verifyToken,
  authorize('ADMIN', 'MANAGER'),
  register
);

// ========================================
// GET MY SCHOOL
// ========================================

router.get(
  '/my-centre',
  verifyToken,
  authorize('MANAGER'),
  getMyCentre
);

// ========================================
// ADMIN ACTIONS
// ========================================

router.put(
  '/:id/approve',
  verifyToken,
  authorize('ADMIN'),
  approve
);

router.put(
  '/:id/reject',
  verifyToken,
  authorize('ADMIN'),
  reject
);

module.exports = router;