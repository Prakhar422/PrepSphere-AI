import express from 'express';
import { startInterview, submitAnswer, getInterviewReport, getInterviewHistory, deleteInterviewSession } from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route configuration: POST /api/interview/start
// Requires JWT authentication (protect), validates settings, and creates a new interview session
router.post('/start', protect, startInterview);

// Route configuration: POST /api/interview/:interviewId/answer
// Requires JWT authentication (protect), validates, evaluates response, and generates next question
router.post('/:interviewId/answer', protect, submitAnswer);

// Route configuration: GET /api/interview/history
// Requires JWT authentication (protect), retrieves paginated history
router.get('/history', protect, getInterviewHistory);

// Route configuration: GET /api/interview/:interviewId/report
// Requires JWT authentication (protect), retrieves the compiled report card
router.get('/:interviewId/report', protect, getInterviewReport);

// Route configuration: DELETE /api/interview/:interviewId
// Requires JWT authentication (protect), deletes a specific interview session and report
router.delete('/:interviewId', protect, deleteInterviewSession);

export default router;
