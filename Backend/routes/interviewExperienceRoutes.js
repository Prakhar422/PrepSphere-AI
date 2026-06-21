import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { validateInterviewExperience } from '../validators/interviewExperienceValidation.js';
import {
  createExperience,
  getExperiences,
  getExperience,
  updateExperience,
  deleteExperience,
  getMetadata,
} from '../controllers/interviewExperienceController.js';

const router = express.Router();

// Publicly accessible endpoints
router.get('/', getExperiences);
router.get('/meta', getMetadata);
router.get('/:id', getExperience);

// Protected endpoints (require authentication)
router.post('/', protect, validateInterviewExperience, createExperience);
router.put('/:id', protect, validateInterviewExperience, updateExperience);
router.delete('/:id', protect, deleteExperience);

export default router;
