import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  googleAuthRedirect,
  googleAuthCallback,
  githubAuthRedirect,
  githubAuthCallback,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// OAuth redirects & callbacks
router.get('/google', googleAuthRedirect);
router.get('/google/callback', googleAuthCallback);
router.get('/github', githubAuthRedirect);
router.get('/github/callback', githubAuthCallback);

// Protected routes
router.get('/me', protect, getMe);

export default router;
