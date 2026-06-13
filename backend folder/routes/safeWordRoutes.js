const express = require('express');
const { setSafeWord, triggerSafeWordSOS } = require('../controllers/safewordController');
const router = express.Router();

router.post('/set', setSafeWord);
router.post('/trigger', triggerSafeWordSOS);

module.exports = router;
