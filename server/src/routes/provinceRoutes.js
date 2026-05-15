const express = require('express');
const { getAll } = require('../controllers/provinceController');
const router = express.Router();

router.get('/', getAll);

module.exports = router;