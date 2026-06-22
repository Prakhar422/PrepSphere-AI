import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    experience: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewExperience',
      required: [true, 'Interview experience reference is required'],
      index: true,
    },
    reason: {
      type: String,
      required: [true, 'Report reason is required'],
      enum: {
        values: ['Spam', 'Offensive Content', 'Incorrect Information', 'Duplicate', 'Other'],
        message: '{VALUE} is not a valid report reason',
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reports per user per experience
reportSchema.index({ user: 1, experience: 1 }, { unique: true });

const Report = mongoose.model('Report', reportSchema);

export default Report;
