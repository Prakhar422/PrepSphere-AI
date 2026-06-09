import mongoose from 'mongoose';

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    resumeName: {
      type: String,
      required: [true, 'Resume filename is required'],
      trim: true,
    },
    resumeUrl: {
      type: String,
      required: [true, 'Resume URL is required'],
    },
    cloudinaryPublicId: {
      type: String,
      required: [true, 'Cloudinary public ID is required'],
    },
    fileType: {
      type: String,
      required: [true, 'File type is required'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
    },
    uploadStatus: {
      type: String,
      enum: ['uploaded', 'processing', 'analyzed', 'failed'],
      default: 'uploaded',
    },
  },
  {
    timestamps: true,
  }
);

const ResumeAnalysis = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);

export default ResumeAnalysis;
