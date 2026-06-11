import express from 'express';
import { getResumeSummary } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/resume-summary', protect, getResumeSummary);

export default router;
