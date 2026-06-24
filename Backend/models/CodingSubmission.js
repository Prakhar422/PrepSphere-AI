import mongoose from 'mongoose';

const codingSubmissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CodingQuestion',
      required: [true, 'Coding question reference is required'],
      index: true
    },
    language: {
      type: String,
      required: [true, 'Programming language is required'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Solution code is required']
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['passed', 'partial', 'failed']
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: 0,
      max: 100
    },
    confidence: {
      type: Number,
      required: [true, 'Confidence rating is required'],
      min: 0,
      max: 100
    },
    feedback: {
      type: String,
      required: [true, 'Evaluation feedback is required']
    },
    strengths: {
      type: [String],
      default: []
    },
    improvements: {
      type: [String],
      default: []
    },
    potentialFailingCases: {
      type: [String],
      default: []
    },
    edgeCasesCovered: {
      type: [String],
      default: []
    },
    optimalSolution: {
      type: String,
      required: [true, 'Optimal solution implementation is required']
    },
    timeComplexity: {
      type: String,
      required: [true, 'Time complexity is required'],
      trim: true
    },
    spaceComplexity: {
      type: String,
      required: [true, 'Space complexity is required'],
      trim: true
    },
    testCasesPassed: {
      type: Number,
      default: 0
    },
    totalTestCases: {
      type: Number,
      default: 0
    },
    evaluationDuration: {
      type: Number
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Optimize query patterns
codingSubmissionSchema.index({ user: 1, question: 1 });
codingSubmissionSchema.index({ user: 1, submittedAt: -1 });
codingSubmissionSchema.index({ createdAt: -1 });

const CodingSubmission = mongoose.model('CodingSubmission', codingSubmissionSchema);

export default CodingSubmission;
