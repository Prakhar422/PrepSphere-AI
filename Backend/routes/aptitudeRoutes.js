import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  generateQuiz,
  submitQuiz,
  getQuizHistory,
  getQuizAttempt,
  deleteQuizAttempt,
  getCategoryAnalytics
} from '../controllers/aptitudeController.js';

const router = express.Router();

// Route Configuration: Aptitude Practice Quizzes
// All endpoints are private and require JWT authentication

// GET /api/aptitude/analytics - Retrieve category performance matrix analytics
router.get('/analytics', protect, getCategoryAnalytics);

// POST /api/aptitude/generate - Generate a new quiz or retrieve an unused quiz
router.post('/generate', protect, generateQuiz);

// POST /api/aptitude/submit - Submit answers and log attempt
router.post('/submit', protect, submitQuiz);

// GET /api/aptitude/history - Retrieve quiz attempt history log
router.get('/history', protect, getQuizHistory);

// GET /api/aptitude/history/:attemptId - Retrieve details for a single attempt
router.get('/history/:attemptId', protect, getQuizAttempt);

// DELETE /api/aptitude/history/:attemptId - Delete a quiz attempt
router.delete('/history/:attemptId', protect, deleteQuizAttempt);

export default router;
