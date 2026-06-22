import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
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
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Index on experience and createdAt for sorting comment lists
commentSchema.index({ experience: 1, createdAt: 1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
