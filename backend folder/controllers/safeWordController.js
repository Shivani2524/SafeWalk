const User = require('../models/User');
const SosAlert = require('../models/SosAlert');
const Contact = require('../models/Contact');
const { sendAlertsToContacts } = require('../utils/smsSimulator');
const { emitSosAlert } = require('../sockets/socketManager');

/**
 * @desc    Set a safe word for the user
 * @route   POST /api/safeword/set
 * @access  Public
 */
const setSafeWord = async (req, res, next) => {
  try {
    const { userId, word } = req.body;

    if (!userId || !word) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both userId and word'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { safeWord: word.trim() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found`
      });
    }

    console.log(`🤐 [SAFE WORD] Safe word updated for user ${user.name}: "${word}"`);

    res.status(200).json({
      success: true,
      message: 'Safe word updated successfully',
      data: {
        userId: user._id,
        safeWord: user.safeWord
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Trigger SOS via safe word detection
 * @route   POST /api/safeword/trigger
 * @access  Public
 */
const triggerSafeWordSOS = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found`
      });
    }

    // Use stored current location or default
    const latitude = user.currentLocation?.lat || 0;
    const longitude = user.currentLocation?.lng || 0;

    console.log(`🤐 [SAFE WORD] Detected for user ${user.name}! Auto-triggering SOS...`);

    // Reuse SOS creation logic
    const sosAlert = await SosAlert.create({
      userId,
      latitude,
      longitude,
      type: 'safe_word',
      status: 'ACTIVE'
    });

    // Emit socket event
    emitSosAlert(userId, {
      sosId: sosAlert._id,
      latitude,
      longitude,
      type: 'safe_word',
      status: 'ACTIVE',
      userName: user.name
    });

    // Simulate notifying contacts
    try {
      const contacts = await Contact.find({ userId });
      const contactsList = contacts.length > 0 ? contacts : (user.contacts || []);
      const userWithContacts = { name: user.name, email: user.email, contacts: contactsList };
      sendAlertsToContacts(userWithContacts, { lat: latitude, lng: longitude }, null);
    } catch (err) {
      console.warn('⚠️ Could not fetch contacts for notification:', err.message);
    }

    res.status(201).json({
      success: true,
      message: '🚨 Safe word detected. SOS triggered automatically!',
      data: sosAlert
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  setSafeWord,
  triggerSafeWordSOS
};
