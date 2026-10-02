const express = require('express');
const router = express.Router();
const { getTests, getTestById } = require('../controllers/testController');

router.get('/', getTests);
router.get('/:id', getTestById);

module.exports = router;
