const User = require('../models/User');
const SosAlert = require('../models/SosAlert');
const { sendAlertsToContacts } = require('../utils/smsSimulator');
const { emitSosAlert } = require('../sockets/socketManager');

/**
 * @desc    Simulate ambient threat detection (yelling, scream, crash, etc.)
 * @route   POST /api/threat/simulate
 * @access  Private/Public (supports JWT and direct userId)
 */
const simulateThreat = async (req, res, next) => {
  try {
    const userId = req.body.userId || (req.user ? req.user.id : null);
    const { threatType = 'scream/yell', location } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a userId or authenticate with JWT'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let alertLocation = location;
    if (!alertLocation || alertLocation.lat === undefined || alertLocation.lng === undefined) {
      alertLocation = user.currentLocation;
    }

    // Print mandatory threat detection log
    console.log(`\n⚠️  Threat detected: ${threatType} (User: ${user.name})`);
    console.log(`🚨 [THREAT SIMULATOR] Auto-triggering emergency SOS system...`);

    // Log the SOS to DB
    const sosAlert = await SosAlert.create({
      userId,
      location: alertLocation,
      status: 'active'
    });

    console.log(`⏱️ [THREAT SIMULATOR] Commencing 5-second validation delay...`);

    // 5-second asynchronous delay simulation
    setTimeout(async () => {
      try {
        console.log(`⏱️ [THREAT SIMULATOR] 5-second delay elapsed. Dispatching alerts...`);
        
        user.currentLocation = alertLocation;
        await user.save();

        await sendAlertsToContacts(user, alertLocation, null);
        emitSosAlert(userId, {
          alertId: sosAlert._id,
          location: alertLocation,
          userName: user.name,
          triggerSource: `Ambient Threat Detected: ${threatType}`
        });
      } catch (err) {
        console.error('❌ Error executing background threat SOS alert:', err.message);
      }
    }, 5000);

    res.status(202).json({
      success: true,
      threatDetected: true,
      threatType,
      message: `⚠️ Threat detected: ${threatType}! SOS triggered automatically. Dispatching alerts in 5 seconds.`,
      data: {
        alertId: sosAlert._id,
        userId,
        location: alertLocation,
        delaySeconds: 5
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  simulateThreat
};
