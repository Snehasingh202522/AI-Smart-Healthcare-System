const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    reportType: {
      type: String,
      enum: ['lab-result', 'imaging', 'prescription', 'discharge-summary', 'other'],
      required: [true, 'Report type is required'],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reportDate: {
      type: Date,
      default: Date.now,
    },
    isConfidential: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

medicalReportSchema.index({ patient: 1, reportDate: -1 });
medicalReportSchema.index({ reportType: 1 });
medicalReportSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('MedicalReport', medicalReportSchema);
