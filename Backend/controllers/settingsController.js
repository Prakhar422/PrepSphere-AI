import * as settingsService from '../services/settingsService.js';
import { generateToken } from './authController.js';

/**
 * @desc    Fetch authenticated user's profile settings
 * @route   GET /api/settings/profile
 * @access  Private
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const userProfile = await settingsService.getProfile(req.user._id);
    return res.status(200).json({
      success: true,
      user: userProfile,
    });
  } catch (error) {
    console.error('Fetch profile error:', error.message);
    next(error);
  }
};

/**
 * @desc    Update authenticated user's profile details
 * @route   PUT /api/settings/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const updatedProfile = await settingsService.updateProfile(req.user._id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Profile Updated Successfully',
      user: updatedProfile,
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    next(error);
  }
};

/**
 * @desc    Upload new profile picture to Cloudinary
 * @route   PUT /api/settings/profile-photo
 * @access  Private
 */
export const uploadUserProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded',
      });
    }

    const updatedProfile = await settingsService.uploadProfilePhoto(
      req.user._id,
      req.file.buffer,
      req.file.originalname
    );

    return res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully',
      user: updatedProfile,
    });
  } catch (error) {
    console.error('Upload profile photo error:', error.message);
    next(error);
  }
};

/**
 * @desc    Change user password
 * @route   PUT /api/settings/change-password
 * @access  Private
 */
export const changeUserPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await settingsService.changePassword(req.user._id, oldPassword, newPassword);

    return res.status(200).json({
      success: true,
      message: 'Password Changed Successfully',
    });
  } catch (error) {
    console.error('Change password error:', error.message);
    if (error.message === 'Invalid current password' || error.message.includes('OAuth accounts')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Change user email address
 * @route   PUT /api/settings/change-email
 * @access  Private
 */
export const changeUserEmail = async (req, res, next) => {
  try {
    const { password, newEmail } = req.body;
    const updatedUser = await settingsService.changeEmail(req.user._id, password, newEmail);

    // Generate fresh JWT token with the new email
    const token = generateToken(updatedUser._id, updatedUser.jwtVersion || 0);

    const userProfile = {
      name: updatedUser.name || '',
      email: updatedUser.email || '',
      college: updatedUser.college || '',
      degree: updatedUser.degree || '',
      graduationYear: updatedUser.graduationYear || '',
      branch: updatedUser.branch || '',
      bio: updatedUser.bio || '',
      profileImage: updatedUser.profileImage || '',
    };

    return res.status(200).json({
      success: true,
      message: 'Email Updated Successfully',
      token,
      user: userProfile,
    });
  } catch (error) {
    console.error('Change email error:', error.message);
    if (
      error.message === 'Invalid current password' ||
      error.message.includes('already registered') ||
      error.message.includes('OAuth accounts')
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Logout user from all sessions
 * @route   POST /api/settings/logout-all
 * @access  Private
 */
export const logoutEverywhereUser = async (req, res, next) => {
  try {
    await settingsService.logoutEverywhere(req.user._id);

    return res.status(200).json({
      success: true,
      message: 'Logged Out Successfully',
    });
  } catch (error) {
    console.error('Logout everywhere error:', error.message);
    next(error);
  }
};

/**
 * @desc    Delete user profile photo
 * @route   DELETE /api/settings/profile-photo
 * @access  Private
 */
export const deleteUserProfilePhoto = async (req, res, next) => {
  try {
    const updatedProfile = await settingsService.deleteProfilePhoto(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Profile photo removed successfully',
      user: updatedProfile,
    });
  } catch (error) {
    console.error('Delete profile photo error:', error.message);
    next(error);
  }
};

/**
 * @desc    Export all user account details
 * @route   GET /api/settings/export-data
 * @access  Private
 */
export const exportUserData = async (req, res, next) => {
  try {
    const data = await settingsService.exportData(req.user._id);
    const dateStr = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=PrepSphere_Data_${dateStr}.json`);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Export user data error:', error.message);
    next(error);
  }
};

/**
 * @desc    Export completed mock interview reports
 * @route   GET /api/settings/export-reports
 * @access  Private
 */
export const exportUserReports = async (req, res, next) => {
  try {
    const report = await settingsService.exportReports(req.user._id);
    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('Export user reports error:', error.message);
    next(error);
  }
};

/**
 * @desc    Delete resume analysis history and files
 * @route   DELETE /api/settings/history/resume
 * @access  Private
 */
export const deleteUserResumeHistory = async (req, res, next) => {
  try {
    await settingsService.deleteResumeHistory(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Resume history deleted successfully',
    });
  } catch (error) {
    console.error('Delete resume history error:', error.message);
    next(error);
  }
};

/**
 * @desc    Delete aptitude quiz history
 * @route   DELETE /api/settings/history/aptitude
 * @access  Private
 */
export const deleteUserAptitudeHistory = async (req, res, next) => {
  try {
    await settingsService.deleteAptitudeHistory(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Aptitude history deleted successfully',
    });
  } catch (error) {
    console.error('Delete aptitude history error:', error.message);
    next(error);
  }
};

/**
 * @desc    Delete mock interview history
 * @route   DELETE /api/settings/history/interviews
 * @access  Private
 */
export const deleteUserInterviewHistory = async (req, res, next) => {
  try {
    await settingsService.deleteInterviewHistory(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Interview history deleted successfully',
    });
  } catch (error) {
    console.error('Delete interview history error:', error.message);
    next(error);
  }
};

/**
 * @desc    Delete authenticated user's profile account
 * @route   DELETE /api/settings/delete-account
 * @access  Private
 */
export const deleteUserAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    await settingsService.deleteUserAccount(req.user._id, password);
    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete user account error:', error.message);
    if (
      error.message === 'Invalid current password' ||
      error.message === 'Current password is required to delete the account'
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

