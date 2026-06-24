import mongoose from 'mongoose';
import CodingQuestion from '../models/CodingQuestion.js';
import CodingSubmission from '../models/CodingSubmission.js';
import { generateAIQuestion, evaluateSubmission } from '../services/codingJourneyService.js';

/**
 * Validates and parses the target CTC string.
 * Enforces positive numbers only and a maximum of 2 decimal places.
 * Returns formatted CTC string and value if valid, or null otherwise.
 *
 * @param {string} ctcStr 
 * @returns {{ctc: string, ctcValue: number}|null}
 */
const parseAndValidateCTC = (ctcStr) => {
  if (!ctcStr || typeof ctcStr !== 'string') return null;
  
  let cleaned = ctcStr.trim();
  // Automatically strip "LPA" suffix (case insensitive) if user typed it
  if (cleaned.toLowerCase().endsWith('lpa')) {
    cleaned = cleaned.substring(0, cleaned.length - 3).trim();
  }

  // Validate number format (positive only)
  const numVal = Number(cleaned);
  if (isNaN(numVal) || numVal <= 0) {
    return null;
  }

  // Check decimal places
  const decimalParts = cleaned.split('.');
  if (decimalParts.length > 1 && decimalParts[1].length > 2) {
    return null; // More than 2 decimal places
  }

  return {
    ctc: `${numVal} LPA`,
    ctcValue: numVal
  };
};

/**
 * Endpoint to generate a personalized coding question using Groq API.
 * Saves the question to the MongoDB database.
 * 
 * @route POST /api/coding-journey/generate-question
 * @access Private
 */
export const generateQuestion = async (req, res, next) => {
  try {
    const { company, role, difficulty, topic, language, ctc } = req.body;

    // Validate parameters existence and types
    if (!company || typeof company !== 'string' || !company.trim()) {
      return res.status(400).json({ success: false, message: 'Company name is required.' });
    }
    if (!role || typeof role !== 'string' || !role.trim()) {
      return res.status(400).json({ success: false, message: 'Role is required.' });
    }
    if (!difficulty || !['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({ success: false, message: 'Valid difficulty is required (Easy, Medium, Hard).' });
    }
    const validTopics = ['Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Binary Search', 'Sliding Window', 'Heap', 'Greedy'];
    if (!topic || !validTopics.includes(topic)) {
      return res.status(400).json({ success: false, message: `Valid topic is required. Must be one of: ${validTopics.join(', ')}` });
    }
    const validLanguages = ['C++', 'Java', 'Python', 'JavaScript'];
    if (!language || !validLanguages.includes(language)) {
      return res.status(400).json({ success: false, message: `Valid language is required. Must be one of: ${validLanguages.join(', ')}` });
    }
    if (!ctc || typeof ctc !== 'string' || !ctc.trim()) {
      return res.status(400).json({ success: false, message: 'Target CTC is required.' });
    }

    // Input Length Validation
    if (company.trim().length > 50) {
      return res.status(400).json({ success: false, message: 'Company name must not exceed 50 characters.' });
    }
    if (role.trim().length > 50) {
      return res.status(400).json({ success: false, message: 'Target role must not exceed 50 characters.' });
    }
    if (ctc.trim().length > 20) {
      return res.status(400).json({ success: false, message: 'Target CTC must not exceed 20 characters.' });
    }

    // Input Sanitization (trim & slice)
    const sanitizedCompany = company.trim().slice(0, 50);
    const sanitizedRole = role.trim().slice(0, 50);
    const sanitizedCtc = ctc.trim().slice(0, 20);

    // Validate CTC
    const ctcDetails = parseAndValidateCTC(sanitizedCtc);
    if (!ctcDetails) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Target CTC format. Must be a positive number with at most 2 decimal places (e.g. 12, 7.5, "12 LPA").'
      });
    }

    // Fetch previously generated titles by this user to avoid repeats
    const userPreviousQuestions = await CodingQuestion.find({ user: req.user._id }, { title: 1 }).lean();
    const excludeTitles = userPreviousQuestions.map(q => q.title);

    // Call Groq service
    const questionAI = await generateAIQuestion({
      company: sanitizedCompany,
      role: sanitizedRole,
      difficulty,
      topic,
      language,
      ctc: ctcDetails.ctc,
      excludeTitles
    });

    // Save to Database
    const newCodingQuestion = new CodingQuestion({
      user: req.user._id,
      company: sanitizedCompany,
      role: sanitizedRole,
      difficulty,
      topic,
      language,
      ctc: ctcDetails.ctc,
      ctcValue: ctcDetails.ctcValue,
      title: questionAI.title,
      description: questionAI.description,
      constraints: questionAI.constraints,
      examples: questionAI.examples,
      hints: questionAI.hints,
      tags: questionAI.tags || [],
      expectedTimeComplexity: questionAI.expectedTimeComplexity,
      expectedSpaceComplexity: questionAI.expectedSpaceComplexity,
      status: 'generated'
    });

    await newCodingQuestion.save();

    return res.status(201).json({
      success: true,
      data: newCodingQuestion
    });

  } catch (error) {
    console.error('[CODING JOURNEY CONTROLLER ERROR] generateQuestion error:', error);
    
    const errorMsg = error.message || '';
    
    if (errorMsg.includes('GROQ_API_KEY') || errorMsg.includes('Groq API Key')) {
      return res.status(500).json({
        success: false,
        message: 'Groq API Key is not configured on the server. Please contact support.'
      });
    }

    if (errorMsg.includes('rate limit') || errorMsg.includes('429') || errorMsg.includes('limit')) {
      return res.status(429).json({
        success: false,
        message: 'AI service rate limit reached. Please try again in a few moments.'
      });
    }

    if (errorMsg.includes('JSON') || errorMsg.includes('format')) {
      return res.status(502).json({
        success: false,
        message: 'AI generated an invalid question format. Please try again.'
      });
    }

    if (error.name === 'ValidationError' || error.message.includes('validation')) {
      return res.status(400).json({
        success: false,
        message: 'Database validation failed. Please check your inputs.'
      });
    }
    
    return res.status(502).json({
      success: false,
      message: 'Unable to generate a question right now. Please try again in a few moments.'
    });
  }
};

/**
 * Helper to calculate relative time text.
 */
const getRelativeTimeText = (date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  
  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs === 1 ? '' : 's'} ago`;
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Endpoint to submit user's solution code for evaluation.
 * Evaluates the code against the problem using Groq AI reviewer.
 * 
 * @route POST /api/coding-journey/submit
 * @access Private
 */
export const submitCode = async (req, res, next) => {
  try {
    const { questionId, language, code, customTestCases = [] } = req.body;

    if (!questionId || !mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ success: false, message: 'Valid Question ID is required.' });
    }
    if (!language || !['C++', 'Java', 'Python', 'JavaScript'].includes(language)) {
      return res.status(400).json({ success: false, message: 'Valid programming language is required.' });
    }
    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Solution code is required.' });
    }

    const questionDoc = await CodingQuestion.findById(questionId);
    if (!questionDoc) {
      return res.status(404).json({ success: false, message: 'Coding question not found.' });
    }

    // Call AI Evaluation service
    const evaluation = await evaluateSubmission({
      title: questionDoc.title,
      description: questionDoc.description,
      constraints: questionDoc.constraints,
      examples: questionDoc.examples,
      expectedTimeComplexity: questionDoc.expectedTimeComplexity,
      expectedSpaceComplexity: questionDoc.expectedSpaceComplexity,
      userCode: code,
      language,
      customTestCases
    });

    // Save to Database
    const newSubmission = new CodingSubmission({
      user: req.user._id,
      question: questionId,
      language,
      code,
      status: evaluation.status,
      score: evaluation.score,
      confidence: evaluation.confidence,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      potentialFailingCases: evaluation.potentialFailingCases,
      edgeCasesCovered: evaluation.edgeCasesCovered,
      optimalSolution: evaluation.optimalSolution,
      timeComplexity: evaluation.timeComplexity,
      spaceComplexity: evaluation.spaceComplexity,
      testCasesPassed: evaluation.testCasesPassed,
      totalTestCases: evaluation.totalTestCases
    });

    try {
      await newSubmission.save();
    } catch (dbError) {
      console.error('[DATABASE ERROR] Database save failure for coding submission:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Unable to evaluate your solution right now. Please try again in a few moments.'
      });
    }

    // Update CodingQuestion status based on evaluation
    try {
      if (evaluation.status === 'passed') {
        questionDoc.status = 'solved';
      } else if (questionDoc.status !== 'solved') {
        questionDoc.status = 'attempted';
      }
      await questionDoc.save();
    } catch (dbError) {
      console.error('[DATABASE ERROR] Database save failure for updating question status:', dbError);
    }

    return res.status(201).json({
      success: true,
      data: newSubmission
    });

  } catch (error) {
    console.error('[CODING JOURNEY CONTROLLER ERROR] submitCode error:', error);
    
    const errorMsg = error.message || '';
    if (errorMsg.includes('GROQ_API_KEY') || errorMsg.includes('Groq API Key')) {
      return res.status(500).json({
        success: false,
        message: 'Groq API Key is not configured on the server. Please contact support.'
      });
    }

    if (errorMsg.includes('rate limit') || errorMsg.includes('429') || errorMsg.includes('limit')) {
      return res.status(429).json({
        success: false,
        message: 'AI service rate limit reached. Please try again in a few moments.'
      });
    }

    if (errorMsg.includes('timed out') || errorMsg.includes('Timeout') || error.name === 'AbortError') {
      return res.status(504).json({
        success: false,
        message: 'AI evaluation timed out. Please try again.'
      });
    }

    // Default user-friendly error message for JSON format errors, network failures, etc.
    return res.status(502).json({
      success: false,
      message: 'Unable to evaluate your solution right now. Please try again in a few moments.'
    });
  }
};

/**
 * Endpoint to get previous attempts/submissions for a given coding question.
 * 
 * @route GET /api/coding-journey/submissions/:questionId
 * @access Private
 */
export const getSubmissionsByQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    if (!questionId || !mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ success: false, message: 'Valid Question ID is required.' });
    }

    const submissions = await CodingSubmission.find({
      user: req.user._id,
      question: questionId
    }).sort({ submittedAt: -1 });

    return res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('[CODING JOURNEY CONTROLLER ERROR] getSubmissionsByQuestion error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve submissions.'
    });
  }
};

/**
 * Endpoint to compile analytics stats, weekly practice logs, and activity list.
 * 
 * @route GET /api/coding-journey/dashboard
 * @access Private
 */
export const getCodingDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch questions generated by this user
    const questions = await CodingQuestion.find({ user: userId }).sort({ createdAt: -1 }).lean();

    // Fetch submissions
    const submissions = await CodingSubmission.find({ user: userId })
      .populate('question', 'title topic difficulty')
      .sort({ submittedAt: -1 })
      .lean();

    const totalSubmissions = submissions.length;
    
    // Unique questions attempted
    const uniqueAttemptedIds = new Set(submissions.map(s => s.question?._id?.toString()).filter(Boolean));
    const totalAttempted = uniqueAttemptedIds.size;

    // Unique questions solved (passed status)
    const uniqueSolvedIds = new Set(
      submissions
        .filter(s => s.status === 'passed')
        .map(s => s.question?._id?.toString())
        .filter(Boolean)
    );
    const totalSolved = uniqueSolvedIds.size;

    // Likely Acceptance Rate (ratio of unique solved to unique attempted or overall passed count to total count)
    // We will follow: totalPassedSubmissions / totalSubmissions * 100
    const totalPassed = submissions.filter(s => s.status === 'passed').length;
    const likelyAcceptanceRate = totalSubmissions > 0 ? Math.round((totalPassed / totalSubmissions) * 100) : 0;

    // Calculate streak: consecutive days with at least one submission
    let streak = 0;
    if (totalSubmissions > 0) {
      const submissionDays = new Set(
        submissions.map(s => new Date(s.submittedAt).toDateString())
      );
      
      const checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);

      // Check if there's a submission today. If not, check yesterday to keep streak active
      let todayString = checkDate.toDateString();
      let hasSubmissionToday = submissionDays.has(todayString);
      
      let streakActive = true;
      if (!hasSubmissionToday) {
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayString = checkDate.toDateString();
        if (!submissionDays.has(yesterdayString)) {
          streakActive = false;
        }
      }

      if (streakActive) {
        streak = 1; // start with today or yesterday
        while (true) {
          checkDate.setDate(checkDate.getDate() - 1);
          if (submissionDays.has(checkDate.toDateString())) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    // Favorite solved categories counts
    const topicCounts = {};
    // Seed standard topics with 0
    const allTopics = ['Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Binary Search', 'Sliding Window', 'Heap', 'Greedy'];
    allTopics.forEach(t => { topicCounts[t] = 0; });

    submissions.forEach(s => {
      if (s.status === 'passed' && s.question?.topic) {
        const t = s.question.topic;
        topicCounts[t] = (topicCounts[t] || 0) + 1;
      }
    });

    const colors = ["#6366F1", "#A855F7", "#06B6D4", "#EC4899", "#10B981", "#F59E0B", "#3B82F6", "#EF4444", "#14B8A6", "#8B5CF6"];
    const problemCategoriesChartData = allTopics.map((topicName, index) => ({
      name: topicName,
      count: topicCounts[topicName],
      fill: colors[index % colors.length]
    }));

    // Weekly Practice Consistency
    const weeklyPracticeData = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = submissions.filter(sub => {
        const subDate = new Date(sub.submittedAt);
        return subDate >= date && subDate < nextDate;
      }).length;

      weeklyPracticeData.push({
        name: days[date.getDay()],
        Problems: count
      });
    }

    // Difficulty solved breakdown
    const difficultyCounts = { Easy: 0, Medium: 0, Hard: 0 };
    submissions.forEach(s => {
      if (s.status === 'passed' && s.question?.difficulty) {
        const diff = s.question.difficulty;
        if (difficultyCounts[diff] !== undefined) {
          difficultyCounts[diff]++;
        }
      }
    });

    const problemDifficultyChartData = [
      { name: "Easy", value: difficultyCounts.Easy, color: "#10B981" },
      { name: "Medium", value: difficultyCounts.Medium, color: "#F59E0B" },
      { name: "Hard", value: difficultyCounts.Hard, color: "#EF4444" }
    ];

    // Recent activity log format
    const recentActivity = submissions.slice(0, 10).map(sub => {
      const verdictText = sub.status === 'passed' ? 'Likely Accepted' : sub.status === 'partial' ? 'Partially Correct' : 'Likely Wrong Answer';
      return {
        text: `Submitted solution for ${sub.question?.title || 'Coding Challenge'}`,
        time: getRelativeTimeText(new Date(sub.submittedAt)),
        platform: "PrepSphere AI",
        difficulty: sub.question?.difficulty || 'Medium',
        score: sub.score,
        language: sub.language,
        verdict: verdictText
      };
    });

    return res.status(200).json({
      success: true,
      stats: {
        attemptedCount: totalAttempted,
        solvedCount: totalSolved,
        likelyAcceptanceRate,
        streak
      },
      problemCategoriesChartData,
      weeklyPracticeData,
      problemDifficultyChartData,
      recentActivity,
      questions
    });

  } catch (error) {
    console.error('[CODING JOURNEY CONTROLLER ERROR] getCodingDashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve coding analytics dashboard.'
    });
  }
};

