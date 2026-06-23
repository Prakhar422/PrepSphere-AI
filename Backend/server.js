import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import mongoose from 'mongoose';
import InterviewExperience from './models/InterviewExperience.js';
import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import aptitudeRoutes from './routes/aptitudeRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import interviewExperienceRoutes from './routes/interviewExperienceRoutes.js';
import codingJourneyRoutes from './routes/codingJourneyRoutes.js';



// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

// Trigger legacy DB migration (user -> author) on database connect
mongoose.connection.once('open', async () => {
  try {
    const count = await InterviewExperience.countDocuments({ author: { $exists: false }, user: { $exists: true } });
    if (count > 0) {
      console.log(`Migrating ${count} legacy interview experiences (user -> author)...`);
      await InterviewExperience.updateMany(
        { author: { $exists: false }, user: { $exists: true } },
        [ { $set: { author: '$user' } } ]
      );
      console.log('Legacy migration completed successfully.');
    }
  } catch (err) {
    console.error('Error during legacy user->author migration:', err);
  }
});

const app = express();

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome route for simple sanity checks
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to PrepSphere AI Auth API' });
});

// Route mountings
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/aptitude', aptitudeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/interview-experiences', interviewExperienceRoutes);
app.use('/api/coding-journey', codingJourneyRoutes);


// Fallback Route (404 Not Found)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Not Found - ${req.originalUrl}`,
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
