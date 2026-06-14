import express from 'express';
import { getResumeSummary, getAptitudeSummary, getCombinedDashboardSummary } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/resume-summary', protect, getResumeSummary);
router.get('/aptitude-summary', protect, getAptitudeSummary);
router.get('/summary', protect, getCombinedDashboardSummary);

export default router;
