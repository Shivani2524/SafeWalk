const express = require('express');
const { triggerSos, cancelSos, getSosHistory } = require('../controllers/sosController');
const router = express.Router();

router.post('/trigger', triggerSos);
router.post('/cancel', cancelSos);
router.get('/history', getSosHistory);

module.exports = router;
