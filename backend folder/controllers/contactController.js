const Contact = require('../models/Contact');
const User = require('../models/User');

/**
 * @desc    Add emergency contact
 * @route   POST /api/contacts/add
 * @access  Public
 */
const addContact = async (req, res, next) => {
  try {
    const { userId, name, phone } = req.body;

    if (!userId || !name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all fields: userId, name, phone'
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found`
      });
    }

    // Save contact
    const contact = await Contact.create({
      userId,
      name,
      phone
    });

    console.log(`👤 [CONTACT] Added contact ${name} for User ID ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Contact added successfully',
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all contacts for a specific user
 * @route   GET /api/contacts/:userId
 * @access  Public
 */
const getContacts = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const contacts = await Contact.find({ userId });

    res.status(200).json({
      success: true,
      data: contacts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete contact by ID
 * @route   DELETE /api/contacts/:id
 * @access  Public
 */
const removeContact = async (req, res, next) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: `Contact with ID ${id} not found`
      });
    }

    console.log(`👤 [CONTACT] Removed Contact ID ${id} for User ID ${contact.userId}`);

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully',
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addContact,
  getContacts,
  removeContact
};
