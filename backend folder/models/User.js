const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Contact phone number is required'],
    trim: true
  },
  relationship: {
    type: String,
    required: [true, 'Relationship type is required (e.g. Family, Friend, etc.)'],
    enum: ['Family', 'Friend', 'Work', 'Partner', 'Other'],
    default: 'Friend'
  }
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    safeWord: {
      type: String,
      required: [true, 'Please add a safe word'],
      trim: true
    },
    contacts: [contactSchema],
    currentLocation: {
      lat: {
        type: Number,
        default: 0.0
      },
      lng: {
        type: Number,
        default: 0.0
      }
    },
    journeyActive: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving to DB
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
