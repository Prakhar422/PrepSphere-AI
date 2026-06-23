import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true
  },
  output: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    default: ''
  }
}, { _id: false });

const codingQuestionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    role: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: ['Easy', 'Medium', 'Hard']
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true
    },
    language: {
      type: String,
      required: [true, 'Programming language is required'],
      trim: true
    },
    ctc: {
      type: String,
      required: [true, 'CTC is required'],
      trim: true
    },
    ctcValue: {
      type: Number,
      required: [true, 'CTC value is required']
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    constraints: {
      type: [String],
      required: [true, 'Constraints are required']
    },
    examples: {
      type: [exampleSchema],
      required: [true, 'Examples are required']
    },
    hints: {
      type: [String],
      required: [true, 'Hints are required']
    },
    expectedTimeComplexity: {
      type: String,
      required: [true, 'Expected time complexity is required'],
      trim: true
    },
    expectedSpaceComplexity: {
      type: String,
      required: [true, 'Expected space complexity is required'],
      trim: true
    },
    tags: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['generated', 'attempted', 'solved'],
      default: 'generated'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for query optimization
codingQuestionSchema.index({ user: 1, createdAt: -1 });
codingQuestionSchema.index({ company: 1 });
codingQuestionSchema.index({ difficulty: 1 });

const CodingQuestion = mongoose.model('CodingQuestion', codingQuestionSchema);

export default CodingQuestion;
