const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['appointment_booked', 'appointment_accepted', 'appointment_rejected', 'appointment_cancelled', 'appointment_completed', 'prescription_created', 'system'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    relatedAppointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    relatedPrescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);
