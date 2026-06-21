import * as service from '../services/interviewExperienceService.js';
import mongoose from 'mongoose';

/**
 * @desc    Create a new interview experience entry
 * @route   POST /api/interview-experiences
 * @access  Private (JWT protected)
 */
export const createExperience = async (req, res, next) => {
  try {
    const data = { ...req.body, user: req.user._id };
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
    const result = await service.getAllExperiences(req.query);
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

    const experience = await service.getExperienceById(id);
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
