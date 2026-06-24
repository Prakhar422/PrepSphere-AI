import mongoose from 'mongoose';
import CodingQuestion from '../models/CodingQuestion.js';
import CodingSubmission from '../models/CodingSubmission.js';
import { generateAIQuestion, evaluateSubmission } from '../services/codingJourneyService.js';
import { calculateCodingStreaks, generateActivities } from '../utils/codingJourneyHelper.js';

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

    // Call AI Evaluation service with duration tracking
    const startEvalTime = Date.now();
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
    const evaluationDuration = Date.now() - startEvalTime;

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
      totalTestCases: evaluation.totalTestCases,
      evaluationDuration
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
        questionDoc.lastSolvedAt = Date.now();
        if (!questionDoc.firstSolvedAt) {
          questionDoc.firstSolvedAt = Date.now();
        }
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

/**
 * Endpoint to search and filter coding questions history.
 * 
 * @route GET /api/coding-journey/history
 * @access Private
 */
export const getHistory = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      difficulty,
      topic,
      language,
      company,
      search,
      startDate,
      endDate,
      bookmarked
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Base query for user
    const query = { user: req.user._id };

    // Filters
    if (status && status !== 'all') {
      query.status = status;
    }
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }
    if (topic && topic !== 'all') {
      query.topic = topic;
    }
    if (language && language !== 'all') {
      query.language = language;
    }
    if (company && company !== 'all') {
      query.company = new RegExp(company.trim(), 'i');
    }
    if (bookmarked === 'true') {
      query.bookmarkedBy = req.user._id;
    } else if (bookmarked === 'false') {
      query.bookmarkedBy = { $ne: req.user._id };
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { company: searchRegex },
        { role: searchRegex },
        { topic: searchRegex }
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const totalResults = await CodingQuestion.countDocuments(query);
    const questionsList = await CodingQuestion.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const formattedQuestions = await Promise.all(
      questionsList.map(async (q) => {
        const submissions = await CodingSubmission.find({
          user: req.user._id,
          question: q._id
        }).select('score submittedAt createdAt').lean();

        const attemptCount = submissions.length;
        let latestSubmissionDate = null;
        let bestScore = 0;

        if (attemptCount > 0) {
          const sorted = [...submissions].sort((a, b) => new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt));
          latestSubmissionDate = sorted[0].submittedAt || sorted[0].createdAt;
          bestScore = Math.max(...submissions.map(s => s.score || 0));
        }
        
        return {
          ...q,
          attemptCount,
          isBookmarked: q.bookmarkedBy ? q.bookmarkedBy.some(id => id.toString() === req.user._id.toString()) : false,
          latestSubmissionDate,
          bestScore
        };
      })
    );

    const totalPages = Math.ceil(totalResults / limitNum) || 1;

    return res.status(200).json({
      success: true,
      questions: formattedQuestions,
      totalPages,
      currentPage: pageNum,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1,
      totalResults
    });
  } catch (error) {
    console.error('[CODING JOURNEY CONTROLLER ERROR] getHistory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve question history.'
    });
  }
};

/**
 * Toggle bookmark for a coding question.
 * 
 * @route PATCH /api/coding-journey/bookmark/:questionId
 * @access Private
 */
export const toggleBookmark = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const userId = req.user._id;

    if (!questionId || !mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ success: false, message: 'Invalid Question ID' });
    }

    const question = await CodingQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const bookmarkedByStrs = (question.bookmarkedBy || []).map(id => id.toString());
    const isBookmarked = bookmarkedByStrs.includes(userId.toString());

    if (isBookmarked) {
      await CodingQuestion.findByIdAndUpdate(
        questionId,
        { $pull: { bookmarkedBy: userId } }
      );
    } else {
      await CodingQuestion.findByIdAndUpdate(
        questionId,
        { $addToSet: { bookmarkedBy: userId } }
      );
    }

    return res.status(200).json({
      success: true,
      message: isBookmarked ? 'Bookmark removed successfully.' : 'Bookmark added successfully.',
      isBookmarked: !isBookmarked
    });
  } catch (error) {
    console.error('[CODING JOURNEY CONTROLLER ERROR] toggleBookmark error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle bookmark.'
    });
  }
};

/**
 * Fetch all bookmarked questions.
 * 
 * @route GET /api/coding-journey/bookmarks
 * @access Private
 */
export const getBookmarks = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const questions = await CodingQuestion.find({ bookmarkedBy: userId }).lean();

    const formattedQuestions = await Promise.all(
      questions.map(async (q) => {
        const submissions = await CodingSubmission.find({
          user: userId,
          question: q._id
        }).select('score submittedAt createdAt').lean();

        const attemptCount = submissions.length;
        let latestSubmissionDate = null;
        let bestScore = 0;

        if (attemptCount > 0) {
          const sorted = [...submissions].sort((a, b) => new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt));
          latestSubmissionDate = sorted[0].submittedAt || sorted[0].createdAt;
          bestScore = Math.max(...submissions.map(s => s.score || 0));
        }

        return {
          ...q,
          attemptCount,
          isBookmarked: true,
          latestSubmissionDate,
          bestScore
        };
      })
    );

    return res.status(200).json({
      success: true,
      questions: formattedQuestions
    });
  } catch (error) {
    console.error('[CODING JOURNEY CONTROLLER ERROR] getBookmarks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookmarked questions.'
    });
  }
};

/**
 * Endpoint to get comprehensive coding analytics.
 * 
 * @route GET /api/coding-journey/analytics
 * @access Private
 */
export const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch all generated questions
    const questions = await CodingQuestion.find({ user: userId }).lean();

    // Fetch all submissions populated with question details
    const submissions = await CodingSubmission.find({ user: userId })
      .populate('question')
      .sort({ submittedAt: -1 })
      .lean();

    // Bookmarks count
    const bookmarkedQuestions = await CodingQuestion.find({ bookmarkedBy: userId }).lean();
    const questionsBookmarked = bookmarkedQuestions.length;

    // Generated today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const questionsGeneratedToday = questions.filter(q => new Date(q.createdAt) >= startOfToday).length;

    // Totals
    const totalQuestionsGenerated = questions.length;
    const totalSubmissions = submissions.length;

    const attemptedQuestionIds = new Set(
      submissions.map(s => s.question?._id?.toString() || s.question?.toString()).filter(Boolean)
    );
    const totalQuestionsAttempted = attemptedQuestionIds.size;

    const solvedQuestionIds = new Set(
      submissions
        .filter(s => s.status === 'passed')
        .map(s => s.question?._id?.toString() || s.question?.toString())
        .filter(Boolean)
    );
    const totalQuestionsSolved = solvedQuestionIds.size;

    // Performance metrics
    const totalPassedSubmissions = submissions.filter(s => s.status === 'passed').length;
    const acceptanceRate = totalSubmissions > 0 ? Math.round((totalPassedSubmissions / totalSubmissions) * 100) : 0;
    const averageScore = totalSubmissions > 0 ? Math.round(submissions.reduce((acc, s) => acc + (s.score || 0), 0) / totalSubmissions) : 0;
    const highestScore = totalSubmissions > 0 ? Math.max(...submissions.map(s => s.score || 0)) : 0;

    // Streaks
    const streaks = calculateCodingStreaks(submissions);
    const currentStreak = streaks.currentStreak;
    const longestStreak = streaks.longestStreak;

    // Favorites
    const topicCounts = {};
    const companyCounts = {};
    const languageCounts = {};

    submissions.forEach(s => {
      if (s.question?.topic) {
        topicCounts[s.question.topic] = (topicCounts[s.question.topic] || 0) + 1;
      }
      if (s.question?.company) {
        companyCounts[s.question.company] = (companyCounts[s.question.company] || 0) + 1;
      }
      if (s.language) {
        languageCounts[s.language] = (languageCounts[s.language] || 0) + 1;
      }
    });

    let favoriteTopic = 'N/A';
    let maxTopic = 0;
    Object.keys(topicCounts).forEach(t => {
      if (topicCounts[t] > maxTopic) {
        maxTopic = topicCounts[t];
        favoriteTopic = t;
      }
    });

    let favoriteCompany = 'N/A';
    let maxCompany = 0;
    Object.keys(companyCounts).forEach(c => {
      if (companyCounts[c] > maxCompany) {
        maxCompany = companyCounts[c];
        favoriteCompany = c;
      }
    });

    let favoriteLanguage = 'N/A';
    let maxLanguage = 0;
    Object.keys(languageCounts).forEach(l => {
      if (languageCounts[l] > maxLanguage) {
        maxLanguage = languageCounts[l];
        favoriteLanguage = l;
      }
    });

    // Active days & Average Submissions
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeekCounts = {
      Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0
    };

    submissions.forEach(s => {
      const d = new Date(s.submittedAt || s.createdAt);
      const dayName = dayNames[d.getDay()];
      dayOfWeekCounts[dayName]++;
    });

    let mostActiveDay = 'N/A';
    let maxDaySubmissions = 0;
    dayNames.forEach(day => {
      if (dayOfWeekCounts[day] > maxDaySubmissions) {
        maxDaySubmissions = dayOfWeekCounts[day];
        mostActiveDay = day;
      }
    });

    let leastActiveDay = 'N/A';
    let minDaySubmissions = Infinity;
    dayNames.forEach(day => {
      if (dayOfWeekCounts[day] > 0 && dayOfWeekCounts[day] < minDaySubmissions) {
        minDaySubmissions = dayOfWeekCounts[day];
        leastActiveDay = day;
      }
    });
    if (leastActiveDay === 'N/A' && maxDaySubmissions > 0) {
      leastActiveDay = mostActiveDay;
    }

    const uniqueActiveDays = new Set(
      submissions.map(s => {
        const date = new Date(s.submittedAt || s.createdAt);
        const offset = date.getTimezoneOffset();
        const localTime = new Date(date.getTime() - offset * 60 * 1000);
        return localTime.toISOString().split('T')[0];
      })
    ).size;
    const averageSubmissionsPerDay = uniqueActiveDays > 0 ? Number((totalSubmissions / uniqueActiveDays).toFixed(2)) : 0;

    // Charts Distributions
    const categoryDistribution = Object.keys(topicCounts).map(name => ({
      name,
      count: topicCounts[name]
    })).sort((a, b) => b.count - a.count);

    const diffCounts = { Easy: 0, Medium: 0, Hard: 0 };
    submissions.forEach(s => {
      if (s.question?.difficulty) {
        diffCounts[s.question.difficulty]++;
      }
    });
    const difficultyDistribution = Object.keys(diffCounts).map(name => ({
      name,
      count: diffCounts[name]
    }));

    const languageDistribution = Object.keys(languageCounts).map(name => ({
      name,
      count: languageCounts[name]
    }));

    // Weekly and Monthly practice
    const weeklyPractice = [];
    const weekdayShortNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayName = weekdayShortNames[d.getDay()];
      const count = submissions.filter(s => {
        const sDate = new Date(s.submittedAt || s.createdAt);
        sDate.setHours(0, 0, 0, 0);
        return sDate.getTime() === d.getTime();
      }).length;
      weeklyPractice.push({ name: dayName, date: dateStr, count });
    }

    const monthlyPractice = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const count = submissions.filter(s => {
        const sDate = new Date(s.submittedAt || s.createdAt);
        sDate.setHours(0, 0, 0, 0);
        return sDate.getTime() === d.getTime();
      }).length;
      monthlyPractice.push({ name: dateStr, count });
    }

    // Cumulative highest score per day for 30 days
    const scoreImprovementTrend = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const subsUpToDay = submissions.filter(s => {
        const sDate = new Date(s.submittedAt || s.createdAt);
        return sDate.getTime() <= d.getTime() + 86399999;
      });
      
      const maxScore = subsUpToDay.length > 0 
        ? Math.max(...subsUpToDay.map(s => s.score || 0)) 
        : 0;

      scoreImprovementTrend.push({ name: dateStr, score: maxScore });
    }

    // Recent Activities list
    const activitiesRaw = generateActivities(questions, submissions, userId);
    const recentActivities = activitiesRaw.slice(0, 15).map(act => ({
      text: act.text,
      time: getRelativeTimeText(new Date(act.timestamp)),
      type: act.type,
      icon: act.icon,
      color: act.color
    }));

    return res.status(200).json({
      success: true,
      totalQuestionsGenerated,
      totalQuestionsAttempted,
      totalQuestionsSolved,
      totalSubmissions,
      questionsBookmarked,
      questionsGeneratedToday,
      acceptanceRate,
      averageScore,
      highestScore,
      currentStreak,
      longestStreak,
      favoriteTopic,
      favoriteCompany,
      favoriteLanguage,
      mostActiveDay,
      leastActiveDay,
      averageSubmissionsPerDay,
      weeklyPractice,
      monthlyPractice,
      categoryDistribution,
      difficultyDistribution,
      languageDistribution,
      scoreImprovementTrend,
      recentActivities
    });
  } catch (error) {
    console.error('[CODING JOURNEY CONTROLLER ERROR] getAnalytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics dashboard.'
    });
  }
};

/**
 * Endpoint to retrieve details, score trends, and submission timeline for a single question.
 * 
 * @route GET /api/coding-journey/question/:questionId
 * @access Private
 */
export const getQuestionDetails = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const userId = req.user._id;

    if (!questionId || !mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ success: false, message: 'Invalid Question ID' });
    }

    const question = await CodingQuestion.findById(questionId).lean();
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const submissions = await CodingSubmission.find({
      user: userId,
      question: questionId
    }).sort({ submittedAt: -1 }).lean();

    const latestSubmission = submissions[0] || null;

    let bestSubmission = null;
    if (submissions.length > 0) {
      bestSubmission = submissions.reduce((best, current) => {
        if (!best) return current;
        return (current.score || 0) >= (best.score || 0) ? current : best;
      }, null);
    }

    // chronological array of { attempt, score, date }
    const scoreTrend = [...submissions].reverse().map((s, idx) => ({
      attempt: idx + 1,
      score: s.score || 0,
      date: new Date(s.submittedAt || s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

    // chronological array of { feedback, score, status, date }
    const feedbackTimeline = [...submissions].reverse().map(s => ({
      feedback: s.feedback || '',
      score: s.score || 0,
      status: s.status,
      date: new Date(s.submittedAt || s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

    // Computed statistics
    let attemptCount = submissions.length;
    let acceptanceRate = 0;
    let avgScore = 0;
    let highestScore = 0;
    let latestScore = 0;
    let improvementPercentage = 0;

    if (attemptCount > 0) {
      const passedCount = submissions.filter(s => s.status === 'passed').length;
      acceptanceRate = Math.round((passedCount / attemptCount) * 100);
      avgScore = Math.round(submissions.reduce((acc, s) => acc + (s.score || 0), 0) / attemptCount);
      highestScore = Math.max(...submissions.map(s => s.score || 0));
      latestScore = latestSubmission.score || 0;
      
      const firstScore = submissions[submissions.length - 1].score || 0;
      improvementPercentage = latestScore - firstScore;
    }

    const statistics = {
      attemptCount,
      acceptanceRate,
      avgScore,
      highestScore,
      latestScore,
      improvementPercentage
    };

    const isBookmarked = question.bookmarkedBy ? question.bookmarkedBy.some(id => id.toString() === userId.toString()) : false;

    return res.status(200).json({
      success: true,
      question: {
        ...question,
        isBookmarked
      },
      latestSubmission,
      bestSubmission,
      submissions,
      scoreTrend,
      feedbackTimeline,
      statistics
    });
  } catch (error) {
    console.error('[CODING JOURNEY CONTROLLER ERROR] getQuestionDetails error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve question details.'
    });
  }
};

