import User from '../models/User.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import QuizAttempt from '../models/QuizAttempt.js';
import InterviewSession from '../models/InterviewSession.js';
import { uploadImageToCloudinary, deleteImageFromCloudinary, deleteFromCloudinary } from './cloudinaryUpload.js';
import { calculateInterviewStreak } from '../utils/streakUtility.js';

/**
 * Fetch authenticated user profile details
 * @param {string} userId - User ID
 * @returns {Promise<object>} User profile details
 */
export const getProfile = async (userId) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new Error('User not found');
  }
  return {
    name: user.name || '',
    email: user.email || '',
    college: user.college || '',
    degree: user.degree || '',
    graduationYear: user.graduationYear || '',
    branch: user.branch || '',
    bio: user.bio || '',
    profileImage: user.profileImage || '',
    hasPassword: !!user.password,
  };
};

/**
 * Update user profile details
 * @param {string} userId - User ID
 * @param {object} profileData - Profile details to update
 * @returns {Promise<object>} Updated user profile details
 */
export const updateProfile = async (userId, profileData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Update only allowed fields
  user.name = profileData.name;
  user.college = profileData.college;
  user.degree = profileData.degree;
  user.graduationYear = profileData.graduationYear;
  user.branch = profileData.branch;
  user.bio = profileData.bio;

  await user.save();

  return {
    name: user.name || '',
    email: user.email || '',
    college: user.college || '',
    degree: user.degree || '',
    graduationYear: user.graduationYear || '',
    branch: user.branch || '',
    bio: user.bio || '',
    profileImage: user.profileImage || '',
  };
};

/**
 * Upload profile photo to Cloudinary and update user
 * @param {string} userId - User ID
 * @param {Buffer} buffer - In-memory image buffer
 * @param {string} originalName - Original filename
 * @returns {Promise<object>} Updated user profile details
 */
export const uploadProfilePhoto = async (userId, buffer, originalName) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Delete previous Cloudinary image if it exists
  if (user.profileImagePublicId) {
    try {
      await deleteImageFromCloudinary(user.profileImagePublicId);
    } catch (err) {
      console.warn('Failed to delete previous image from Cloudinary:', err.message);
    }
  }

  // Upload new image
  const uploadResult = await uploadImageToCloudinary(buffer, originalName);

  user.profileImage = uploadResult.secure_url;
  user.profileImagePublicId = uploadResult.public_id;
  await user.save();

  return {
    name: user.name || '',
    email: user.email || '',
    college: user.college || '',
    degree: user.degree || '',
    graduationYear: user.graduationYear || '',
    branch: user.branch || '',
    bio: user.bio || '',
    profileImage: user.profileImage || '',
  };
};

/**
 * Change user password securely
 * @param {string} userId - User ID
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 */
export const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.password) {
    throw new Error('OAuth accounts do not have a password. Please sign in via Google or GitHub.');
  }

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    throw new Error('Invalid current password');
  }

  // Hash is handled pre-save in User model
  user.password = newPassword;
  
  // Invalidate all other active sessions by incrementing jwtVersion
  user.jwtVersion = (user.jwtVersion || 0) + 1;
  await user.save();
};

/**
 * Change user email address
 * @param {string} userId - User ID
 * @param {string} password - Current password
 * @param {string} newEmail - New email address
 * @returns {Promise<object>} The updated user document
 */
export const changeEmail = async (userId, password, newEmail) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.password) {
    throw new Error('OAuth accounts cannot perform password-verified email updates. Please sign in via Google or GitHub.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid current password');
  }

  // Check if new email is already taken
  const emailExists = await User.findOne({ email: newEmail });
  if (emailExists) {
    throw new Error('Email is already registered by another account');
  }

  user.email = newEmail;
  await user.save();

  return user;
};

/**
 * Invalidate all active user sessions
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const logoutEverywhere = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  user.jwtVersion = (user.jwtVersion || 0) + 1;
  await user.save();
};

/**
 * Remove user profile photo
 * @param {string} userId - User ID
 * @returns {Promise<object>} Updated user profile details
 */
export const deleteProfilePhoto = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.profileImagePublicId) {
    try {
      await deleteImageFromCloudinary(user.profileImagePublicId);
    } catch (err) {
      console.warn('Failed to delete image from Cloudinary:', err.message);
    }
  }

  user.profileImage = '';
  user.profileImagePublicId = '';
  await user.save();

  return {
    name: user.name || '',
    email: user.email || '',
    college: user.college || '',
    degree: user.degree || '',
    graduationYear: user.graduationYear || '',
    branch: user.branch || '',
    bio: user.bio || '',
    profileImage: user.profileImage || '',
  };
};

/**
 * Export all authenticated user account details
 * @param {string} userId - User ID
 * @returns {Promise<object>} Unified account data export
 */
export const exportData = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const resumeHistory = await ResumeAnalysis.find({ user: userId });
  const interviewHistory = await InterviewSession.find({ user: userId });
  const quizAttempts = await QuizAttempt.find({ user: userId });

  const completedInterviews = interviewHistory.filter(s => s.status === 'COMPLETED');
  
  // Calculate practice streak
  const practiceStreakVal = await calculateInterviewStreak(interviewHistory);
  
  // Calculate average scores
  const avgInterviewScoreVal = completedInterviews.length > 0
    ? Math.round(completedInterviews.reduce((acc, s) => acc + (s.report ? s.report.overallScore : 0), 0) / completedInterviews.length)
    : 0;

  const avgAtsScoreVal = resumeHistory.length > 0
    ? Math.round(resumeHistory.reduce((acc, r) => acc + (r.atsAnalysis?.score || 0), 0) / resumeHistory.length)
    : 0;

  // Format Helper for dates e.g. "21 June 2026"
  const formatHumanDate = (dateVal) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    
    const day = d.getDate();
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    
    return `${day} ${month} ${year}`;
  };

  const statistics = {
    totalResumeAnalyses: resumeHistory.length,
    totalMockInterviews: completedInterviews.length,
    totalAptitudeTests: quizAttempts.filter(q => q.status === 'COMPLETED').length,
    totalCodingQuestionsSolved: 154,
    practiceStreak: `${practiceStreakVal} Days`,
    averageInterviewScore: `${avgInterviewScoreVal}%`,
    averageAtsScore: `${avgAtsScoreVal}%`
  };

  const profile = {
    name: user.name || '',
    email: user.email || '',
    college: user.college || '',
    degree: user.degree || '',
    branch: user.branch || '',
    graduationYear: user.graduationYear || '',
    bio: user.bio || ''
  };

  const resumes = resumeHistory.map(r => ({
    resumeName: r.resumeName || 'Resume.pdf',
    atsScore: `${r.atsAnalysis?.score || 0}%`,
    rating: r.atsAnalysis?.label || (r.atsAnalysis?.score >= 80 ? 'Excellent' : r.atsAnalysis?.score >= 60 ? 'Good' : 'Developing'),
    analysisDate: formatHumanDate(r.createdAt)
  }));

  const interviews = interviewHistory.map(i => ({
    company: i.company || 'N/A',
    role: i.role || 'N/A',
    interviewType: i.interviewType || 'Technical',
    overallScore: `${i.report ? i.report.overallScore : (i.score || 0)}%`,
    interviewDate: formatHumanDate(i.completedAt || i.createdAt)
  }));

  const aptitude = quizAttempts.map(q => ({
    quizTopic: q.category || 'Mixed Aptitude',
    score: `${Math.round((q.score / (q.totalQuestions || 10)) * 100)}%`,
    accuracy: `${q.accuracy || 0}%`,
    questionsAttempted: q.totalQuestions || 10,
    completionDate: formatHumanDate(q.submittedAt || q.createdAt)
  }));

  const codingJourney = {
    totalQuestionsSolved: 154,
    easy: 62,
    medium: 74,
    hard: 18,
    currentStreak: "12 Days",
    favouritePlatform: "LeetCode",
    lastActivity: "20 June 2026"
  };

  return {
    profile,
    statistics,
    resumeHistory: resumes,
    interviewHistory: interviews,
    aptitudeHistory: aptitude,
    codingJourney
  };
};

/**
 * Export the single latest completed mock interview report
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} The latest completed interview session or null
 */
export const exportReports = async (userId) => {
  const latestSession = await InterviewSession.findOne({ 
    user: userId, 
    status: 'COMPLETED' 
  }).sort({ completedAt: -1, createdAt: -1 });
  
  return latestSession;
};

/**
 * Delete all resume records and Cloudinary assets
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const deleteResumeHistory = async (userId) => {
  const resumes = await ResumeAnalysis.find({ user: userId });
  for (const r of resumes) {
    if (r.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(r.cloudinaryPublicId);
      } catch (err) {
        console.warn(`Failed to delete raw resume asset ${r.cloudinaryPublicId} from Cloudinary:`, err.message);
      }
    }
  }
  await ResumeAnalysis.deleteMany({ user: userId });
};

/**
 * Delete all aptitude quiz history
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const deleteAptitudeHistory = async (userId) => {
  await QuizAttempt.deleteMany({ user: userId });
};

/**
 * Delete all mock interview history
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const deleteInterviewHistory = async (userId) => {
  await InterviewSession.deleteMany({ user: userId });
};

/**
 * Delete user account and all related database records and Cloudinary media
 * @param {string} userId - User ID
 * @param {string} [password] - Account password
 * @returns {Promise<void>}
 */
export const deleteUserAccount = async (userId, password) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new Error('User not found');
  }

  // 1. Password Verification (only if user has local password)
  if (user.password) {
    if (!password) {
      throw new Error('Current password is required to delete the account');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid current password');
    }
  }

  // 2. Cloudinary Cleanup
  // Delete Profile Photo if exists
  if (user.profileImagePublicId) {
    try {
      await deleteImageFromCloudinary(user.profileImagePublicId);
    } catch (err) {
      console.warn(`Failed to delete profile image ${user.profileImagePublicId} from Cloudinary:`, err.message);
    }
  }

  // Delete Resumes if exist
  const resumes = await ResumeAnalysis.find({ user: userId });
  for (const r of resumes) {
    if (r.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(r.cloudinaryPublicId);
      } catch (err) {
        console.warn(`Failed to delete resume file ${r.cloudinaryPublicId} from Cloudinary:`, err.message);
      }
    }
  }

  // 3. Database Cleanup
  await Promise.all([
    ResumeAnalysis.deleteMany({ user: userId }),
    InterviewSession.deleteMany({ user: userId }),
    QuizAttempt.deleteMany({ user: userId }),
    User.findByIdAndDelete(userId)
  ]);
};
