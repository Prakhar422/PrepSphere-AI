import express from 'express';
import { startInterview } from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route configuration: POST /api/interview/start
// Requires JWT authentication (protect), validates settings, and creates a new interview session
router.post('/start', protect, startInterview);

export default router;
