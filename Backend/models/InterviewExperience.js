import mongoose from 'mongoose';

const interviewExperienceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
      index: true,
    },
    role: {
      type: String,
      required: [true, 'Role/Job title is required'],
      trim: true,
      maxlength: [100, 'Role cannot exceed 100 characters'],
      index: true,
    },
    interviewType: {
      type: String,
      required: [true, 'Interview type is required'],
      enum: {
        values: ['Internship', 'Full Time', 'On Campus', 'Off Campus'],
        message: '{VALUE} is not a valid interview type',
      },
      index: true,
    },
    package: {
      type: Number,
      required: false,
      min: [0, 'Package must be a positive number'],
      index: true,
    },
    college: {
      type: String,
      required: false,
      trim: true,
      maxlength: [200, 'College name cannot exceed 200 characters'],
    },
    graduationYear: {
      type: Number,
      required: false,
      min: [1900, 'Graduation year must be after 1900'],
      max: [2100, 'Graduation year must be before 2100'],
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty level is required'],
      enum: {
        values: ['Easy', 'Medium', 'Hard'],
        message: '{VALUE} is not a valid difficulty level',
      },
      index: true,
    },
    onlineAssessment: {
      type: String,
      trim: true,
      default: '',
    },
    technicalRound1: {
      type: String,
      trim: true,
      default: '',
    },
    technicalRound2: {
      type: String,
      trim: true,
      default: '',
    },
    technicalRound3: {
      type: String,
      trim: true,
      default: '',
    },
    hrRound: {
      type: String,
      trim: true,
      default: '',
    },
    preparationTips: {
      type: String,
      trim: true,
      default: '',
    },
    overallExperience: {
      type: String,
      required: [true, 'Overall experience description is required'],
      trim: true,
      minlength: [50, 'Overall experience must be at least 50 characters long'],
      maxlength: [10000, 'Overall experience cannot exceed 10000 characters'],
    },
    result: {
      type: String,
      required: [true, 'Interview result is required'],
      enum: {
        values: ['Selected', 'Rejected', 'Waiting'],
        message: '{VALUE} is not a valid result',
      },
      index: true,
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

// Optimize MongoDB queries: index on createdAt for sorting
interviewExperienceSchema.index({ createdAt: -1 });

const InterviewExperience = mongoose.model('InterviewExperience', interviewExperienceSchema);

export default InterviewExperience;
