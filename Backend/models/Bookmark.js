import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema(
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

// Prevent duplicate bookmarks per user per experience
bookmarkSchema.index({ user: 1, experience: 1 }, { unique: true });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

export default Bookmark;
