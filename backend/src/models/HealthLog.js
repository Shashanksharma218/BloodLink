const mongoose = require("mongoose");

const healthLogSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    default: () => new Date()
  },
  hemoglobin: {
    type: Number,
    required: true,
    min: 0,
    max: 25
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 300
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  }
}, { timestamps: true });

healthLogSchema.index({ donor: 1, date: -1 });

module.exports = mongoose.model('HealthLog', healthLogSchema);
