const mongoose = require('mongoose');

const symptomHistorySchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    symptoms: {
      type: String,
      required: [true, 'Symptoms description is required'],
      trim: true,
      maxlength: [2000, 'Symptoms cannot exceed 2000 characters'],
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [0, 'Age must be at least 0'],
      max: [150, 'Age cannot exceed 150'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['male', 'female', 'other'],
    },
    existingDiseases: {
      type: [String],
      default: [],
    },
    currentMedications: {
      type: [String],
      default: [],
    },
    aiAnalysis: {
      needsMoreInfo: {
        type: Boolean,
        default: false,
      },
      followUpQuestions: {
        type: [String],
        default: [],
      },
      possibleDiseases: [
        {
          name: String,
          confidence: Number,
        },
      ],
      severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
      },
      recommendedSpecialist: String,
      homeCareAdvice: String,
      emergencyWarning: {
        isEmergency: Boolean,
        message: String,
      },
    },
    status: {
      type: String,
      enum: ['analyzed', 'failed'],
      default: 'analyzed',
    },
    errorMessage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

symptomHistorySchema.index({ patient: 1, createdAt: -1 });
symptomHistorySchema.index({ status: 1 });

module.exports = mongoose.model('SymptomHistory', symptomHistorySchema);
