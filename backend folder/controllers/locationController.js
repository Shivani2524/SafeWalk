const User = require('../models/User');
const Journey = require('../models/Journey');
const { emitLocationUpdate } = require('../sockets/socketManager');

/**
 * @desc    Update user location
 * @route   POST /api/location/update
 * @access  Public
 */
const updateLocation = async (req, res, next) => {
  try {
    const { userId, latitude, longitude } = req.body;

    if (!userId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all fields: userId, latitude, longitude'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found`
      });
    }

    // Save location to User profile
    user.currentLocation = { lat: latitude, lng: longitude };
    await user.save();

    // If user has an active journey, append coordinates to history
    if (user.journeyActive) {
      const activeJourney = await Journey.findOne({ userId, status: 'active' });
      if (activeJourney) {
        activeJourney.history.push({ latitude, longitude });
        await activeJourney.save();
        console.log(`📍 [JOURNEY] Logged breadcrumb for User ${userId}`);
      }
    }

    // Emit live Socket.io update event
    emitLocationUpdate(userId, { latitude, longitude });

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: {
        userId,
        latitude,
        longitude,
        journeyActive: user.journeyActive
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get latest location for a user
 * @route   GET /api/location/:userId
 * @access  Public
 */
const getLocation = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('name email currentLocation journeyActive');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found`
      });
    }

    // Map internal lat/lng format to latitude/longitude for client consistency
    const responseData = {
      userId: user._id,
      name: user.name,
      latitude: user.currentLocation.lat,
      longitude: user.currentLocation.lng,
      journeyActive: user.journeyActive
    };

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateLocation,
  getLocation
};
