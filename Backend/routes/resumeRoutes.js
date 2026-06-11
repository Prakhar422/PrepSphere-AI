import express from 'express';
import { 
  uploadResumeMetadata,
  getResumeHistory,
  getResumeAnalysisById,
  deleteResumeAnalysis
} from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadResume } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Route configuration: POST /api/resume/upload
// Requires JWT authentication (protect), handles file upload and validation (uploadResume),
// and saves metadata record in MongoDB (uploadResumeMetadata).
router.post('/upload', protect, uploadResume, uploadResumeMetadata);

// History routes
router.get('/history', protect, getResumeHistory);
router.get('/:id', protect, getResumeAnalysisById);
router.delete('/:id', protect, deleteResumeAnalysis);

export default router;
