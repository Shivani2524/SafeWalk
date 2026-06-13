const express = require('express');
const { simulateThreat } = require('../controllers/threatController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/simulate', protect, simulateThreat);

module.exports = router;
