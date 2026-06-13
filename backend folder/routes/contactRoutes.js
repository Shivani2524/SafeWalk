const express = require('express');
const { addContact, getContacts, removeContact } = require('../controllers/contactController');
const router = express.Router();

router.post('/add', addContact);
router.get('/:userId', getContacts);
router.delete('/:id', removeContact);

module.exports = router;
