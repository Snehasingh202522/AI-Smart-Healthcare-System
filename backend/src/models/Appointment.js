const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorName: {
      type: String,
      required: [true, 'Doctor name is required'],
    },
    hospital: {
      type: String,
      required: [true, 'Hospital is required'],
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
    },
    date: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    time: {
      type: String,
      required: [true, 'Appointment time is required'],
    },
    status: {
    type: String,
    enum: ['pending', 'confirmed', 'scheduled', 'completed', 'cancelled', 'rejected', 'no-show'],
    default: 'pending',
  },
    reason: {
      type: String,
      required: [true, 'Appointment reason is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    symptoms: {
      type: [String],
      default: [],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ patient: 1, date: 1 });
appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ status: 1, date: 1 });

appointmentSchema.methods.isUpcoming = function () {
  return ['pending', 'confirmed', 'scheduled'].includes(this.status) && new Date(this.date) >= new Date();
};

appointmentSchema.methods.isPast = function () {
  return new Date(this.date) < new Date();
};

module.exports = mongoose.model('Appointment', appointmentSchema);
