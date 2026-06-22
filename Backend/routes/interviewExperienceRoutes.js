import express from 'express';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import { validateInterviewExperience } from '../validators/interviewExperienceValidation.js';
import {
  createExperience,
  getExperiences,
  getExperience,
  updateExperience,
  deleteExperience,
  getMetadata,
  getMyExperiences,
  getSimilarExperiences,
  likeExperience,
  bookmarkExperience,
  getBookmarks,
  reportExperience,
  incrementViews,
  getComments,
  addComment,
  deleteComment,
  getCompaniesFilter,
  getRolesFilter,
  getTopContributorsList,
  getPopularTagsList,
} from '../controllers/interviewExperienceController.js';

const router = express.Router();

// Publicly accessible endpoints
router.get('/', optionalProtect, getExperiences);
router.get('/meta', getMetadata);
router.get('/filter/companies', optionalProtect, getCompaniesFilter);
router.get('/filter/roles', optionalProtect, getRolesFilter);
router.get('/top-contributors', optionalProtect, getTopContributorsList);
router.get('/popular-tags', optionalProtect, getPopularTagsList);

// Protected endpoints (require authentication)
router.get('/bookmarks', protect, getBookmarks);
router.get('/my', protect, getMyExperiences);
router.post('/', protect, validateInterviewExperience, createExperience);
router.put('/:id', protect, validateInterviewExperience, updateExperience);
router.delete('/:id', protect, deleteExperience);

// Parameterized public/protected endpoints - placed at the end to prevent conflicts
router.get('/:id/similar', optionalProtect, getSimilarExperiences);
router.get('/:id', optionalProtect, getExperience);

// Interaction endpoints
router.post('/:id/like', protect, likeExperience);
router.post('/:id/bookmark', protect, bookmarkExperience);
router.post('/:id/report', protect, reportExperience);
router.post('/:id/view', protect, incrementViews);

// Comments endpoints
router.get('/:id/comments', getComments);
router.post('/:id/comments', protect, addComment);
router.delete('/comments/:id', protect, deleteComment);

export default router;
