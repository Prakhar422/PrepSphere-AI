import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, "Option key is required"],
      enum: {
        values: ["A", "B", "C", "D"],
        message: "{VALUE} is not a valid option key. Must be A, B, C, or D.",
      },
    },
    text: {
      type: String,
      required: [true, "Option text is required"],
      trim: true,
    },
  },
  { _id: false },
);

const questionSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  question: {
    type: String,
    required: [true, "Question text is required"],
    trim: true,
  },
  options: {
    type: [optionSchema],
    required: [true, "Options are required"],
    validate: [
      {
        validator: function (val) {
          return val.length === 4;
        },
        message: "Each question must have exactly four options.",
      },
      {
        validator: function (val) {
          const keys = val.map((option) => option.key);
          const uniqueKeys = new Set(keys);

          return (
            uniqueKeys.size === 4 &&
            ["A", "B", "C", "D"].every((key) => uniqueKeys.has(key))
          );
        },
        message: "Options must contain exactly one A, B, C, and D.",
      },
    ],
  },
  correctAnswer: {
    type: String,
    required: [true, "Correct answer is required"],
    enum: {
      values: ["A", "B", "C", "D"],
      message: "Correct answer must be A, B, C, or D.",
    },
  },
  explanation: {
    type: String,
    required: [true, "Explanation is required"],
    trim: true,
  },
});

const quizBankSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "Mixed Aptitude",
          "Quantitative Aptitude",
          "Logical Reasoning",
          "Verbal Ability",
          "Data Interpretation",
        ],
        message: "{VALUE} is not a valid category.",
      },
    },
    difficulty: {
      type: String,
      required: [true, "Difficulty is required"],
      enum: {
        values: ["Easy", "Medium", "Hard", "Adaptive"],
        message: "{VALUE} is not a valid difficulty.",
      },
    },
    totalQuestions: {
      type: Number,
      default: 10,
      required: true,
      validate: {
        validator: function (val) {
          return val === 10;
        },
        message: "totalQuestions must always be exactly 10.",
      },
    },
    questions: {
      type: [questionSchema],
      required: [true, "Questions array is required"],
      validate: {
        validator: function (val) {
          return val.length === 10;
        },
        message: "A quiz must contain exactly 10 questions.",
      },
    },
    timesServed: {
      type: Number,
      default: 0,
      min: [0, "timesServed cannot be negative"],
    },
    status: {
      type: String,
      enum: {
        values: ["ACTIVE", "ARCHIVED"],
        message: "{VALUE} is not a valid status.",
      },
      default: "ACTIVE",
    },
    generatedBy: {
      type: String,
      default: "Gemini",
    },
    estimatedTime: {
      type: Number,
      default: 15,
      min: [1, "estimatedTime must be at least 1 minute"],
    },
    averageScore: {
      type: Number,
      default: 0,
      min: [0, "averageScore cannot be negative"],
      max: [10, "averageScore cannot exceed 10"],
    },
    totalAttempts: {
      type: Number,
      default: 0,
      min: [0, "totalAttempts cannot be negative"],
    },
  },
  {
    timestamps: true,
  },
);

// Individual field indexes
quizBankSchema.index({ category: 1 });
quizBankSchema.index({ difficulty: 1 });
quizBankSchema.index({ status: 1 });

// Compound index for optimizing reusable quiz lookups
quizBankSchema.index({ category: 1, difficulty: 1, status: 1 });

const QuizBank = mongoose.model("QuizBank", quizBankSchema);

export default QuizBank;
