const User = require('../models/User');
const Journey = require('../models/Journey');

/**
 * @desc    Start a journey
 * @route   POST /api/journey/start
 * @access  Public
 */
const startJourney = async (req, res, next) => {
  try {
    const { userId, startLocation } = req.body;

    if (!userId || !startLocation || startLocation.latitude === undefined || startLocation.longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId and startLocation { latitude, longitude }'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found`
      });
    }

    if (user.journeyActive) {
      return res.status(400).json({
        success: false,
        message: 'A journey is already active for this user. End it first.'
      });
    }

    // Create journey record
    const journey = await Journey.create({
      userId,
      status: 'active',
      startLocation: {
        latitude: startLocation.latitude,
        longitude: startLocation.longitude
      },
      history: [{ latitude: startLocation.latitude, longitude: startLocation.longitude }]
    });

    // Mark user as journey active
    user.journeyActive = true;
    user.currentLocation = { lat: startLocation.latitude, lng: startLocation.longitude };
    await user.save();

    console.log(`🚶 [JOURNEY] Started for User ${user.name} at ${startLocation.latitude}, ${startLocation.longitude}`);

    res.status(201).json({
      success: true,
      message: 'Journey started successfully',
      data: journey
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    End a journey
 * @route   POST /api/journey/end
 * @access  Public
 */
const endJourney = async (req, res, next) => {
  try {
    const { userId, endLocation } = req.body;

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

    // Find the active journey
    const journey = await Journey.findOne({ userId, status: 'active' });
    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'No active journey found for this user'
      });
    }

    // Determine end coordinates (use provided or fallback to current location)
    const endLat = endLocation?.latitude ?? user.currentLocation?.lat ?? 0;
    const endLng = endLocation?.longitude ?? user.currentLocation?.lng ?? 0;

    // Update journey record
    journey.status = 'completed';
    journey.endLocation = { latitude: endLat, longitude: endLng };
    journey.history.push({ latitude: endLat, longitude: endLng });
    await journey.save();

    // Reset user journey status
    user.journeyActive = false;
    user.currentLocation = { lat: endLat, lng: endLng };
    await user.save();

    console.log(`🏁 [JOURNEY] Completed for User ${user.name} at ${endLat}, ${endLng}`);

    res.status(200).json({
      success: true,
      message: 'Journey ended successfully',
      data: journey
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get journey history for a user
 * @route   GET /api/journey/history
 * @access  Public
 */
const getJourneyHistory = async (req, res, next) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId as a query parameter (?userId=...)'
      });
    }

    const journeys = await Journey.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: journeys
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startJourney,
  endJourney,
  getJourneyHistory
};
