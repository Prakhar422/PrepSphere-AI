import express from 'express';
import {
  generateQuestion,
  submitCode,
  getSubmissionsByQuestion,
  getCodingDashboard,
  getHistory,
  toggleBookmark,
  getBookmarks,
  getAnalytics,
  getQuestionDetails
} from '../controllers/codingJourneyController.js';
import { protect } from '../middleware/authMiddleware.js';
import { rateLimiter, submissionRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/generate-question', protect, rateLimiter, generateQuestion);
router.post('/submit', protect, submissionRateLimiter, submitCode);
router.get('/submissions/:questionId', protect, getSubmissionsByQuestion);
router.get('/dashboard', protect, getCodingDashboard);

// Phase 3 Endpoints
router.get('/history', protect, getHistory);
router.get('/bookmarks', protect, getBookmarks);
router.patch('/bookmark/:questionId', protect, toggleBookmark);
router.get('/analytics', protect, getAnalytics);
router.get('/question/:questionId', protect, getQuestionDetails);

export default router;

