const express = require('express');
const router = express.Router();
const { publicImpact, publicDonate } = require('../controllers/donationController');
const { publicList } = require('../controllers/centreController');

router.get('/impact', publicImpact);
router.get('/schools', publicList);
router.post('/donate', publicDonate);

module.exports = router;