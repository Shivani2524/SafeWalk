const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['manual', 'voice', 'safe_word'],
      default: 'manual'
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'CANCELLED'],
      default: 'ACTIVE'
    },
    audioSnippetUrl: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SosAlert', sosAlertSchema);
