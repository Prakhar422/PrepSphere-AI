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
    // Recruiter-oriented profile fields for mock interview personalization
    candidateName: { type: String, trim: true },
    professionalSummary: { type: String, trim: true },
    technicalSkills: {
      programmingLanguages: [{ type: String, trim: true }],
      frameworks: [{ type: String, trim: true }],
      libraries: [{ type: String, trim: true }],
      databases: [{ type: String, trim: true }],
      tools: [{ type: String, trim: true }]
    },
    projects: [
      {
        title: { type: String, trim: true },
        description: { type: String, trim: true },
        technologiesUsed: [{ type: String, trim: true }]
      }
    ],
    experience: [
      {
        role: { type: String, trim: true },
        company: { type: String, trim: true },
        duration: { type: String, trim: true },
        description: { type: String, trim: true }
      }
    ],
    education: [
      {
        institution: { type: String, trim: true },
        degree: { type: String, trim: true },
        year: { type: String, trim: true }
      }
    ],
    certifications: [{ type: String, trim: true }],
    achievements: [{ type: String, trim: true }],
    relevantKeywords: [{ type: String, trim: true }]
  },
  {
    timestamps: true,
  }
);

const ResumeAnalysis = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);

export default ResumeAnalysis;
