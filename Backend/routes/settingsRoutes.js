import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadProfileImage } from '../middleware/uploadMiddleware.js';
import {
  getUserProfile,
  updateUserProfile,
  uploadUserProfilePhoto,
  deleteUserProfilePhoto,
  changeUserPassword,
  changeUserEmail,
  logoutEverywhereUser,
  exportUserData,
  exportUserReports,
  deleteUserResumeHistory,
  deleteUserAptitudeHistory,
  deleteUserInterviewHistory,
  deleteUserAccount,
} from '../controllers/settingsController.js';
import {
  validateProfileUpdate,
  validatePasswordChange,
  validateEmailChange,
} from '../validators/settingsValidation.js';

const router = express.Router();

// GET /api/settings/profile - Fetch profile settings
router.get('/profile', protect, getUserProfile);

// PUT /api/settings/profile - Update profile details
router.put('/profile', protect, validateProfileUpdate, updateUserProfile);

// PUT /api/settings/profile-photo - Upload profile picture to Cloudinary
router.put('/profile-photo', protect, uploadProfileImage, uploadUserProfilePhoto);

// DELETE /api/settings/profile-photo - Delete profile picture
router.delete('/profile-photo', protect, deleteUserProfilePhoto);

// PUT /api/settings/change-password - Secure password update
router.put('/change-password', protect, validatePasswordChange, changeUserPassword);

// PUT /api/settings/change-email - Secure email update
router.put('/change-email', protect, validateEmailChange, changeUserEmail);

// POST /api/settings/logout-all - Invalidate all active sessions
router.post('/logout-all', protect, logoutEverywhereUser);

// GET /api/settings/export-data - Export account data
router.get('/export-data', protect, exportUserData);

// GET /api/settings/export-reports - Export mock interview reports data
router.get('/export-reports', protect, exportUserReports);

// DELETE /api/settings/history/resume - Delete resume history
router.delete('/history/resume', protect, deleteUserResumeHistory);

// DELETE /api/settings/history/aptitude - Delete aptitude history
router.delete('/history/aptitude', protect, deleteUserAptitudeHistory);

// DELETE /api/settings/history/interviews - Delete interview history
router.delete('/history/interviews', protect, deleteUserInterviewHistory);

// DELETE /api/settings/delete-account - Delete account and all data
router.delete('/delete-account', protect, deleteUserAccount);

export default router;
