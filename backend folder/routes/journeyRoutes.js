const express = require('express');
const { startJourney, endJourney, getJourneyHistory } = require('../controllers/journeyController');
const router = express.Router();

router.post('/start', startJourney);
router.post('/end', endJourney);
router.get('/history', getJourneyHistory);

module.exports = router;
