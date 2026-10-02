const express = require('express');
const router = express.Router();
const { getCentres, getCentreById } = require('../controllers/centreController');

router.get('/', getCentres);
router.get('/:id', getCentreById);

module.exports = router;
