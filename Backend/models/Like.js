import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate likes per user per experience
likeSchema.index({ user: 1, experience: 1 }, { unique: true });

const Like = mongoose.model('Like', likeSchema);

export default Like;
