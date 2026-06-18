import express from 'express';
import { startInterview, submitAnswer } from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route configuration: POST /api/interview/start
// Requires JWT authentication (protect), validates settings, and creates a new interview session
router.post('/start', protect, startInterview);

// Route configuration: POST /api/interview/:interviewId/answer
// Requires JWT authentication (protect), validates, evaluates response, and generates next question
router.post('/:interviewId/answer', protect, submitAnswer);

export default router;
