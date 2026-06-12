import mongoose from 'mongoose';

const attemptAnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Question ID is required']
  },
  selectedOption: {
    type: String,
    enum: {
      values: ['A', 'B', 'C', 'D'],
      message: '{VALUE} is not a valid choice. Must be A, B, C, or D.'
    },
    required: false // Nullable/undefined if the question was skipped
  },
  correctOption: {
    type: String,
    required: [true, 'Correct option is required'],
    enum: {
      values: ['A', 'B', 'C', 'D'],
      message: '{VALUE} is not a valid choice. Must be A, B, C, or D.'
    }
  },
  isCorrect: {
    type: Boolean,
    required: [true, 'isCorrect indicator is required']
  }
});

const quizAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuizBank',
      required: [true, 'Quiz reference is required']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Mixed Aptitude',
          'Quantitative Aptitude',
          'Logical Reasoning',
          'Verbal Ability',
          'Data Interpretation'
        ],
        message: '{VALUE} is not a valid category.'
      }
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: {
        values: ['Easy', 'Medium', 'Hard', 'Adaptive'],
        message: '{VALUE} is not a valid difficulty.'
      }
    },
    answers: {
      type: [attemptAnswerSchema],
      required: [true, 'Answers array is required']
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [0, 'Score cannot be negative'],
      validate: {
        validator: function(val) {
          const limit = this.totalQuestions !== undefined ? this.totalQuestions : 10;
          return val <= limit;
        },
        message: 'Score cannot exceed totalQuestions.'
      }
    },
    accuracy: {
      type: Number,
      required: [true, 'Accuracy is required'],
      min: [0, 'Accuracy must be at least 0'],
      max: [100, 'Accuracy cannot exceed 100']
    },
    correctAnswers: {
      type: Number,
      required: true,
      default: 0
    },
    wrongAnswers: {
      type: Number,
      required: true,
      default: 0
    },
    skippedQuestions: {
      type: Number,
      required: true,
      default: 0
    },
    totalQuestions: {
      type: Number,
      default: 10,
      required: true,
      validate: {
        validator: function(val) {
          return val === 10;
        },
        message: 'totalQuestions must always be exactly 10.'
      }
    },
    timeTaken: {
      type: Number,
      required: [true, 'Time taken (in seconds) is required'],
      min: [0, 'Time taken cannot be negative']
    },
    status: {
      type: String,
      enum: {
        values: ['IN_PROGRESS', 'COMPLETED', 'ABANDONED'],
        message: '{VALUE} is not a valid attempt status.'
      },
      default: 'IN_PROGRESS'
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    submittedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Individual field indexes
quizAttemptSchema.index({ user: 1 });
quizAttemptSchema.index({ createdAt: -1 });
quizAttemptSchema.index({ category: 1 });

// Compound indexes to speed up history, sorting, and performance dashboard aggregation
quizAttemptSchema.index({ user: 1, createdAt: -1 });
quizAttemptSchema.index({ user: 1, category: 1 });

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

export default QuizAttempt;
