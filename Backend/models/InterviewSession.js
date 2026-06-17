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
      strengths: [{ type: String, trim: true }],
      weaknesses: [{ type: String, trim: true }],
      suggestions: [{ type: String, trim: true }],
      idealAnswer: { type: String, default: '' }
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
    currentQuestionStatus: {
      type: String,
      enum: ['PENDING', 'ANSWERED', 'SKIPPED'],
      default: 'PENDING'
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
