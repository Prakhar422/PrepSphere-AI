import * as service from '../services/interviewExperienceService.js';
import mongoose from 'mongoose';

/**
 * @desc    Create a new interview experience entry
 * @route   POST /api/interview-experiences
 * @access  Private (JWT protected)
 */
export const createExperience = async (req, res, next) => {
  try {
    const data = { ...req.body, author: req.user._id };
    const experience = await service.createExperience(req.user._id, data);
    return res.status(201).json({
      success: true,
      message: 'Interview experience created successfully.',
      data: experience,
    });
  } catch (error) {
    console.error('Create interview experience error:', error.message);
    next(error);
  }
};

/**
 * @desc    Get all interview experiences with search, filters, pagination, and sorting
 * @route   GET /api/interview-experiences
 * @access  Public
 */
export const getExperiences = async (req, res, next) => {
  try {
    const result = await service.getAllExperiences(req.query, req.user?._id);
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Fetch interview experiences error:', error.message);
    next(error);
  }
};

/**
 * @desc    Get a single interview experience by ID
 * @route   GET /api/interview-experiences/:id
 * @access  Public
 */
export const getExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid experience ID format',
      });
    }

    const experience = await service.getExperienceById(id, req.user?._id);
    return res.status(200).json({
      success: true,
      data: experience,
    });
  } catch (error) {
    console.error('Fetch single experience error:', error.message);
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Update an existing interview experience (Owner Only)
 * @route   PUT /api/interview-experiences/:id
 * @access  Private (JWT protected)
 */
export const updateExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid experience ID format',
      });
    }

    const updatedExperience = await service.updateExperience(id, req.user._id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Interview experience updated successfully.',
      data: updatedExperience,
    });
  } catch (error) {
    console.error('Update experience error:', error.message);
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Delete an interview experience (Owner Only)
 * @route   DELETE /api/interview-experiences/:id
 * @access  Private (JWT protected)
 */
export const deleteExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid experience ID format',
      });
    }

    await service.deleteExperience(id, req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Interview experience deleted successfully.',
    });
  } catch (error) {
    console.error('Delete experience error:', error.message);
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Get interview experience metadata (featured companies, stats, trending companies)
 * @route   GET /api/interview-experiences/meta
 * @access  Public
 */
export const getMetadata = async (req, res, next) => {
  try {
    const stats = await service.getCommunityStats();
    const featuredCompanies = await service.getFeaturedCompanies();
    const trendingCompanies = await service.getTrendingCompanies();

    return res.status(200).json({
      success: true,
      stats,
      featuredCompanies,
      trendingCompanies,
    });
  } catch (error) {
    console.error('Fetch metadata error:', error.message);
    next(error);
  }
};

/**
 * @desc    Get interview experiences of the logged in user
 * @route   GET /api/interview-experiences/my
 * @access  Private (JWT protected)
 */
export const getMyExperiences = async (req, res, next) => {
  try {
    const experiences = await service.getMyExperiences(req.user._id);
    return res.status(200).json({
      success: true,
      experiences,
    });
  } catch (error) {
    console.error('Fetch my experiences error:', error.message);
    next(error);
  }
};

/**
 * @desc    Get similar interview experiences by ID
 * @route   GET /api/interview-experiences/:id/similar
 * @access  Public
 */
export const getSimilarExperiences = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid experience ID format',
      });
    }

    const experiences = await service.getSimilarExperiences(id, req.user?._id);
    return res.status(200).json({
      success: true,
      experiences,
    });
  } catch (error) {
    console.error('Fetch similar experiences error:', error.message);
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Like or unlike an interview experience
 * @route   POST /api/interview-experiences/:id/like
 * @access  Private (JWT protected)
 */
export const likeExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid experience ID format',
      });
    }

    const result = await service.likeExperience(id, req.user._id);
    return res.status(200).json({
      success: true,
      liked: result.liked,
      likes: result.likes,
    });
  } catch (error) {
    console.error('Like experience error:', error.message);
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Bookmark or unbookmark an interview experience
 * @route   POST /api/interview-experiences/:id/bookmark
 * @access  Private (JWT protected)
 */
export const bookmarkExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid experience ID format',
      });
    }

    const result = await service.bookmarkExperience(id, req.user._id);
    return res.status(200).json({
      success: true,
      bookmarked: result.bookmarked,
    });
  } catch (error) {
    console.error('Bookmark experience error:', error.message);
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Get user bookmarked interview experiences
 * @route   GET /api/interview-experiences/bookmarks
 * @access  Private (JWT protected)
 */
export const getBookmarks = async (req, res, next) => {
  try {
    const experiences = await service.getBookmarks(req.user._id);
    return res.status(200).json({
      success: true,
      experiences,
    });
  } catch (error) {
    console.error('Get bookmarks error:', error.message);
    next(error);
  }
};

/**
 * @desc    Report an interview experience
 * @route   POST /api/interview-experiences/:id/report
 * @access  Private (JWT protected)
 */
export const reportExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid experience ID format',
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required for reporting inappropriate content',
      });
    }

    const report = await service.reportExperience(id, req.user._id, { reason, description });
    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Thank you for keeping PrepSphere safe.',
      data: report,
    });
  } catch (error) {
    console.error('Report experience error:', error.message);
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Increment view count for an interview experience
 * @route   POST /api/interview-experiences/:id/view
 * @access  Private (JWT protected)
 */
export const incrementViews = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid experience ID format',
      });
    }

    const views = await service.incrementViews(id);
    return res.status(200).json({
      success: true,
      views,
    });
  } catch (error) {
    console.error('Increment views error:', error.message);
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Get comments for an experience
 * @route   GET /api/interview-experiences/:id/comments
 * @access  Public
 */
export const getComments = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid experience ID format',
      });
    }

    const comments = await service.getComments(id);
    return res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error('Get comments error:', error.message);
    next(error);
  }
};

/**
 * @desc    Add a comment to an experience
 * @route   POST /api/interview-experiences/:id/comments
 * @access  Private (JWT protected)
 */
export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid experience ID format',
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required',
      });
    }

    const comment = await service.addComment(id, req.user._id, content);
    return res.status(201).json({
      success: true,
      message: 'Comment posted successfully',
      comment,
    });
  } catch (error) {
    console.error('Add comment error:', error.message);
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Delete a comment by ID
 * @route   DELETE /api/interview-experiences/comments/:id
 * @access  Private (JWT protected)
 */
export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid comment ID format',
      });
    }

    await service.deleteComment(id, req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Delete comment error:', error.message);
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Get dynamic company names for autocomplete filters
 * @route   GET /api/interview-experiences/filter/companies
 * @access  Public
 */
export const getCompaniesFilter = async (req, res, next) => {
  try {
    const { search = '' } = req.query;
    const companies = await service.getUniqueCompanies(search);
    return res.status(200).json({
      success: true,
      companies,
    });
  } catch (error) {
    console.error('Fetch company filter error:', error.message);
    next(error);
  }
};

/**
 * @desc    Get dynamic role titles for autocomplete filters
 * @route   GET /api/interview-experiences/filter/roles
 * @access  Public
 */
export const getRolesFilter = async (req, res, next) => {
  try {
    const { search = '' } = req.query;
    const roles = await service.getUniqueRoles(search);
    return res.status(200).json({
      success: true,
      roles,
    });
  } catch (error) {
    console.error('Fetch role filter error:', error.message);
    next(error);
  }
};

/**
 * @desc    Get dynamic top contributors leaderboard
 * @route   GET /api/interview-experiences/top-contributors
 * @access  Public
 */
export const getTopContributorsList = async (req, res, next) => {
  try {
    const contributors = await service.getTopContributors();
    return res.status(200).json({
      success: true,
      contributors,
    });
  } catch (error) {
    console.error('Fetch top contributors error:', error.message);
    next(error);
  }
};

/**
 * @desc    Get popular tags sorted by frequency
 * @route   GET /api/interview-experiences/popular-tags
 * @access  Public
 */
export const getPopularTagsList = async (req, res, next) => {
  try {
    const tags = await service.getPopularTags();
    return res.status(200).json({
      success: true,
      tags,
    });
  } catch (error) {
    console.error('Fetch popular tags error:', error.message);
    next(error);
  }
};
