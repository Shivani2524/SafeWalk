const User = require('../models/User');
const { generateToken } = require('../utils/jwtHelper');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, safeWord } = req.body;

    if (!name || !email || !password || !safeWord) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all fields: name, email, password, safeWord'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      safeWord
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          safeWord: user.safeWord,
          contacts: user.contacts,
          currentLocation: user.currentLocation,
          journeyActive: user.journeyActive
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        safeWord: user.safeWord,
        contacts: user.contacts,
        currentLocation: user.currentLocation,
        journeyActive: user.journeyActive
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login
};
