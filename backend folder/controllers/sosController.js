const User = require('../models/User');
const SosAlert = require('../models/SosAlert');
const Contact = require('../models/Contact');
const { sendAlertsToContacts } = require('../utils/smsSimulator');
const { emitSosAlert } = require('../sockets/socketManager');

/**
 * @desc    Trigger SOS alert
 * @route   POST /api/sos/trigger
 * @access  Public
 */
const triggerSos = async (req, res, next) => {
  try {
    const { userId, latitude, longitude, type } = req.body;

    if (!userId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all fields: userId, latitude, longitude'
      });
    }

    const alarmType = type || 'manual';

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found`
      });
    }

    // Save SOS alert to database
    const sosAlert = await SosAlert.create({
      userId,
      latitude,
      longitude,
      type: alarmType,
      status: 'ACTIVE'
    });

    console.log(`🚨 [SOS] Triggered by User ${user.name} (${userId}). Location: ${latitude}, ${longitude}. Type: ${alarmType}`);

    // Emit live Socket.io alert event
    emitSosAlert(userId, {
      sosId: sosAlert._id,
      latitude,
      longitude,
      type: alarmType,
      status: 'ACTIVE',
      userName: user.name
    });

    // Proactively simulate contact warnings in the console
    try {
      // Find user contacts from the Contact model or User model fallback
      let contacts = await Contact.find({ userId });
      if (contacts.length === 0 && user.contacts && user.contacts.length > 0) {
        contacts = user.contacts;
      }
      
      const userWithContacts = {
        name: user.name,
        email: user.email,
        contacts: contacts
      };

      sendAlertsToContacts(userWithContacts, { lat: latitude, lng: longitude }, null);
    } catch (contactErr) {
      console.warn('⚠️ Warning: Failed to retrieve user contacts for simulated notification broadcast', contactErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'SOS triggered successfully',
      data: sosAlert
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an active SOS alert
 * @route   POST /api/sos/cancel
 * @access  Public
 */
const cancelSos = async (req, res, next) => {
  try {
    const { sosId } = req.body;

    if (!sosId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide sosId to cancel'
      });
    }

    const sosAlert = await SosAlert.findById(sosId);
    if (!sosAlert) {
      return res.status(404).json({
        success: false,
        message: `SOS alert with ID ${sosId} not found`
      });
    }

    // Update status to CANCELLED
    sosAlert.status = 'CANCELLED';
    await sosAlert.save();

    console.log(`🟢 [SOS] Cancelled Alert ID: ${sosId} for User ID: ${sosAlert.userId}`);

    res.status(200).json({
      success: true,
      message: 'SOS cancelled successfully',
      data: sosAlert
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get SOS history for a user
 * @route   GET /api/sos/history
 * @access  Public
 */
const getSosHistory = async (req, res, next) => {
  try {
    // Check both query param and body for userId
    const userId = req.query.userId || req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId as a query parameter (?userId=...) or in request body'
      });
    }

    const history = await SosAlert.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  triggerSos,
  cancelSos,
  getSosHistory
};
