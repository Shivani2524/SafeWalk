const express = require('express');
const { updateLocation, getLocation } = require('../controllers/locationController');
const router = express.Router();

router.post('/update', updateLocation);
router.get('/:userId', getLocation);

module.exports = router;
