const mongoose = require('mongoose');

const doctorRecommendationHistorySchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
   specialist: {
  type: String,
  default: "",
},
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      city: {
        type: String,
        trim: true,
      },
      pincode: {
        type: String,
        trim: true,
      },
    },
    recommendations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
      },
    ],
    searchRadius: {
      type: Number,
      default: 10,
    },
    totalResults: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

doctorRecommendationHistorySchema.index({ patient: 1, createdAt: -1 });
doctorRecommendationHistorySchema.index({ specialist: 1, city: 1 });

module.exports = mongoose.model('DoctorRecommendationHistory', doctorRecommendationHistorySchema);
