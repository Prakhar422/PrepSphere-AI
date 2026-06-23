import express from 'express';
import { generateQuestion } from '../controllers/codingJourneyController.js';
import { protect } from '../middleware/authMiddleware.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/generate-question', protect, rateLimiter, generateQuestion);

export default router;
