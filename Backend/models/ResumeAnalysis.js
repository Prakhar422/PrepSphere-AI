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
    atsAnalysis: {
      score: { type: Number },
      label: { type: String }
    },
    diagnostics: {
      title: { type: String },
      description: { type: String },
      skillsMatch: { type: Number },
      formatting: { type: Number }
    },
    placementReadiness: {
      currentStage: { type: Number },
      stages: [
        {
          title: { type: String },
          completed: { type: Boolean },
          description: { type: String }
        }
      ]
    },
    improvementSuggestions: [
      {
        title: { type: String },
        priority: { type: String },
        description: { type: String }
      }
    ],
    missingKeywords: [{ type: String }],
    sectionAnalysis: [
      {
        section: { type: String },
        score: { type: Number },
        status: { type: String },
        suggestions: { type: String }
      }
    ],
    overallReport: {
      rating: { type: Number },
      strengths: { type: String },
      weaknesses: { type: String },
      recruiterPerspective: { type: String },
      finalAdvice: { type: String }
    },
    analysisStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    analysisCompletedAt: {
      type: Date
    },
  },
  {
    timestamps: true,
  }
);

const ResumeAnalysis = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);

export default ResumeAnalysis;
