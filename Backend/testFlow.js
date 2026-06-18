import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import InterviewSession from './models/InterviewSession.js';
import { startInterview, submitAnswer } from './controllers/interviewController.js';
import { generateFirstQuestion, evaluateInterviewAnswer } from './services/geminiInterviewService.js';

dotenv.config();

const runTest = async () => {
  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Database connected.');

  try {
    // 1. Get or create a test user
    let user = await User.findOne({ email: 'test_interviewer@prepsphere.com' });
    if (!user) {
      console.log('Creating test user...');
      user = new User({
        name: 'Test Candidate',
        email: 'test_interviewer@prepsphere.com',
        college: 'Test University',
        role: 'student'
      });
      await user.save();
    }
    console.log(`Using user: ${user.name} (${user._id})`);

    // 2. Clear out any previous unfinished test sessions for this user
    await InterviewSession.deleteMany({ user: user._id });

    // 3. Test generateFirstQuestion service
    console.log('\n--- Testing generateFirstQuestion Service ---');
    const firstQResult = await generateFirstQuestion({
      interviewType: 'Technical',
      company: 'Google',
      role: 'Software Engineer',
      difficulty: 'Medium',
      language: 'English',
      focusAreas: ['Node.js fundamentals', 'Database Schema Management'],
      resumeContext: ''
    });
    console.log('First Question Generated:', firstQResult.question);
    console.log('Usage metadata:', firstQResult.usage);

    // 4. Create an interview session directly in Mongoose for testing
    console.log('\n--- Creating Test Interview Session ---');
    const firstQuestionId = new mongoose.Types.ObjectId();
    const session = new InterviewSession({
      user: user._id,
      interviewType: 'Technical',
      company: 'Google',
      role: 'Software Engineer',
      difficulty: 'Medium',
      duration: 15, // DURATION_QUESTION_MAP[15] is 8 questions
      language: 'English',
      focusAreas: ['Node.js fundamentals'],
      resumeEnabled: false,
      currentQuestionNumber: 1,
      currentQuestionId: firstQuestionId,
      totalQuestions: 3, // Set to 3 for a quick finalization test
      conversationHistory: [
        {
          questionNumber: 1,
          questionId: firstQuestionId,
          question: firstQResult.question,
          userAnswer: '',
          questionAskedTime: new Date(),
          status: 'PENDING',
          evaluation: {
            score: 0,
            strengths: [],
            weaknesses: [],
            suggestions: [],
            idealAnswer: ''
          }
        }
      ],
      status: 'IN_PROGRESS'
    });
    await session.save();
    console.log(`Interview session created with ID: ${session._id}`);

    // 5. Test evaluateInterviewAnswer Service
    console.log('\n--- Testing evaluateInterviewAnswer Service ---');
    const evaluation = await evaluateInterviewAnswer({
      interviewType: session.interviewType,
      company: session.company,
      role: session.role,
      difficulty: session.difficulty,
      language: session.language,
      resumeContext: '',
      currentQuestion: firstQResult.question,
      userAnswer: 'I would use the Express framework and configure route middleware to handle authentication, then validate parameters and query MongoDB using Mongoose.',
      previousConversation: '',
      currentQuestionNumber: 1,
      totalQuestions: session.totalQuestions
    });

    console.log('Evaluation Result:', JSON.stringify(evaluation, null, 2));

    // 6. Test submitAnswer controller logic via mock req/res
    console.log('\n--- Testing submitAnswer Controller (Question 1) ---');
    const mockReq = {
      params: { interviewId: session._id.toString() },
      body: { answer: 'I would use the Express framework and configure route middleware to handle authentication, then validate parameters and query MongoDB using Mongoose.' },
      user: { _id: user._id }
    };

    let statusResult = 200;
    let jsonResult = {};

    const mockRes = {
      status: (code) => {
        statusResult = code;
        return mockRes;
      },
      json: (data) => {
        jsonResult = data;
        return mockRes;
      }
    };

    await submitAnswer(mockReq, mockRes, (err) => console.error(err));
    console.log(`HTTP Status: ${statusResult}`);
    console.log('Response JSON:', JSON.stringify(jsonResult, null, 2));

    if (jsonResult.success) {
      console.log('\nSubmitting Answer for Question 2...');
      const nextReq = {
        params: { interviewId: session._id.toString() },
        body: { answer: 'Mongoose models allow us to define structured schemas, validate fields, build relationships using ObjectIds, and use hooks like pre-save for passwords.' },
        user: { _id: user._id }
      };
      await submitAnswer(nextReq, mockRes, (err) => console.error(err));
      console.log(`HTTP Status: ${statusResult}`);
      console.log('Response JSON:', JSON.stringify(jsonResult, null, 2));
    }

    if (jsonResult.success) {
      console.log('\nSubmitting Answer for Question 3 (Final Question)...');
      const finalReq = {
        params: { interviewId: session._id.toString() },
        body: { answer: 'We should use indexes for fields frequently queried, write optimized query selectors, limit return fields with project, and implement pagination.' },
        user: { _id: user._id }
      };
      await submitAnswer(finalReq, mockRes, (err) => console.error(err));
      console.log(`HTTP Status: ${statusResult}`);
      console.log('Response JSON (Final):', JSON.stringify(jsonResult, null, 2));
    }

    // 7. Verify concurrent duplicate submission block
    console.log('\n--- Testing Duplicate Submission Prevention ---');
    // We try to submit an answer for the completed interview
    const duplicateReq = {
      params: { interviewId: session._id.toString() },
      body: { answer: 'This should fail because status is COMPLETED' },
      user: { _id: user._id }
    };
    await submitAnswer(duplicateReq, mockRes, (err) => console.error(err));
    console.log(`HTTP Status (Should be 400): ${statusResult}`);
    console.log('Response JSON:', JSON.stringify(jsonResult, null, 2));

  } catch (err) {
    console.error('Test failed with error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected.');
  }
};

runTest();
