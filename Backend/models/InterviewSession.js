import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    questionNumber: {
      type: Number,
      required: true
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    question: {
      type: String,
      required: true
    },
    userAnswer: {
      type: String,
      default: ''
    },
    questionAskedTime: {
      type: Date,
      default: Date.now
    },
    answerSubmittedTime: {
      type: Date
    },
    evaluation: {
      score: { type: Number, default: 0 },
      percentageScore: { type: Number, default: 0 },
      strengths: [{ type: String, trim: true }],
      weaknesses: [{ type: String, trim: true }],
      suggestions: [{ type: String, trim: true }],
      idealAnswer: { type: String, default: '' },
      aiMetadata: {
        modelUsed: { type: String, default: 'gemini-2.5-flash' },
        promptTokens: { type: Number, default: 0 },
        completionTokens: { type: Number, default: 0 },
        totalTokens: { type: Number, default: 0 },
        responseTime: { type: Number, default: 0 }
      }
    },
    timeTaken: {
      type: Number, // duration in seconds
      default: 0
    },
    status: {
      type: String,
      enum: ['PENDING', 'ANSWERED', 'SKIPPED'],
      default: 'PENDING'
    }
  },
  { _id: false }
);

const interviewReportSchema = new mongoose.Schema(
  {
    overallScore: {
      type: Number,
      required: true
    },
    communicationScore: {
      type: Number,
      required: true
    },
    technicalScore: {
      type: Number,
      required: true
    },
    problemSolvingScore: {
      type: Number,
      required: true
    },
    confidenceScore: {
      type: Number,
      required: true
    },
    readinessLevel: {
      type: String,
      enum: ['Needs Improvement', 'Developing', 'Interview Ready', 'Placement Ready', 'Excellent Candidate'],
      required: true
    },
    overallFeedback: {
      type: String,
      required: true
    },
    strengths: [{
      type: String,
      trim: true
    }],
    weaknesses: [{
      type: String,
      trim: true
    }],
    recommendations: [{
      type: String,
      trim: true
    }],
    interviewSummary: {
      type: String,
      required: true
    },
    careerAdvice: {
      type: String,
      default: ''
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    answeredQuestions: {
      type: Number,
      required: true
    },
    averageScore: {
      type: Number,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    interviewType: {
      type: String,
      enum: ['Technical', 'HR', 'Behavioral', 'System Design', 'Mixed'],
      required: [true, 'Interview type is required']
    },
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Adaptive'],
      required: [true, 'Difficulty is required']
    },
    duration: {
      type: Number,
      enum: [15, 30, 45, 60],
      required: [true, 'Duration is required']
    },
    language: {
      type: String,
      enum: ['English', 'Hindi', 'Mixed'],
      required: [true, 'Language is required'],
      trim: true
    },
    focusAreas: [{
      type: String,
      trim: true
    }],
    resumeEnabled: {
      type: Boolean,
      default: false
    },
    resumeRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResumeAnalysis',
      default: null
    },
    currentQuestionNumber: {
      type: Number,
      default: 1
    },
    currentQuestionId: {
      type: mongoose.Schema.Types.ObjectId
    },
    totalQuestions: {
      type: Number,
      required: [true, 'Total questions count is required']
    },
    conversationHistory: [questionSchema],
    status: {
      type: String,
      enum: ['IN_PROGRESS', 'COMPLETED', 'ABANDONED'],
      default: 'IN_PROGRESS'
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date
    },
    report: {
      type: interviewReportSchema,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Optimize database performance with indexes for history queries
interviewSessionSchema.index({ user: 1, createdAt: -1 });
interviewSessionSchema.index({ status: 1 });
interviewSessionSchema.index({ createdAt: -1 });
interviewSessionSchema.index({ interviewType: 1 });
interviewSessionSchema.index({ company: 1 });
interviewSessionSchema.index({ role: 1 });

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

export default InterviewSession;
