const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const journeySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active'
    },
    startLocation: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    endLocation: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    history: [pointSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Journey', journeySchema);
