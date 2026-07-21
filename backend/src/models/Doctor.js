const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      trim: true,
      default: 'General Physician',
    },
    licenseNumber: {
      type: String,
      trim: true,
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    hospital: {
      type: String,
      trim: true,
    },
    consultationFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    city: {
      type: String,
      trim: true,
    },
    latitude: {
      type: Number,
      default: 19.076,
    },
    longitude: {
      type: Number,
      default: 72.8777,
    },
    availability: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'available',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    diseasesTreated: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

doctorSchema.index({ specialization: 1 });
doctorSchema.index({ city: 1 });
doctorSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
