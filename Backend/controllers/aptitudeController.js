import QuizAttempt from '../models/QuizAttempt.js';
import QuizBank from '../models/QuizBank.js';
import { validateGenerateRequest, validateSubmitRequest } from '../utils/aptitudeValidation.js';
import * as quizBankService from '../services/quizBankService.js';
import * as geminiQuizService from '../services/geminiQuizService.js';

/**
 * @desc    Generate a new AI quiz or retrieve an existing unused quiz
 * @route   POST /api/aptitude/generate
 * @access  Private (JWT protected)
 */
export const generateQuiz = async (req, res, next) => {
  try {
    const { category, difficulty } = req.body;

    // Perform request payload validation
    const validationError = validateGenerateRequest(category, difficulty);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    let quiz;
    let source;

    // Try to retrieve an active quiz that this user has not attempted
    quiz = await quizBankService.getAvailableQuiz(req.user._id, category, difficulty);

    if (quiz) {
      source = 'QuizBank';
    } else {
      // If no unused active quiz exists, generate a brand-new one using Gemini
      const generatedQuizData = await geminiQuizService.generateQuizWithGemini(category, difficulty);
      quiz = await quizBankService.saveGeneratedQuiz(generatedQuizData);
      source = 'Gemini';
    }

    // Check whether the user already has an IN_PROGRESS attempt for the same quiz
    let attempt = await QuizAttempt.findOne({
      user: req.user._id,
      quiz: quiz._id,
      status: 'IN_PROGRESS'
    });

    if (!attempt) {
      // Create an in-progress QuizAttempt to track the user's attempt
      attempt = await QuizAttempt.create({
        user: req.user._id,
        quiz: quiz._id,
        category,
        difficulty,
        answers: [],
        score: 0,
        accuracy: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        skippedQuestions: 10,
        totalQuestions: 10,
        timeTaken: 0,
        status: 'IN_PROGRESS',
        startedAt: new Date()
      });
    }

    // Retrieve completed quiz IDs for the current user to debug log
    const completedQuizIds = await QuizAttempt.distinct('quiz', {
      user: req.user._id,
      status: 'COMPLETED'
    });

    // Count available active quizzes that are not completed by this user
    const availableCount = await QuizBank.countDocuments({
      category,
      difficulty,
      status: 'ACTIVE',
      _id: { $nin: completedQuizIds }
    });

    // Log debug information for verification
    console.log(`[DEBUG] QUIZ GENERATION STARTED:`);
    console.log(`- User ID: ${req.user._id}`);
    console.log(`- Category: ${category}`);
    console.log(`- Difficulty: ${difficulty}`);
    console.log(`- Completed Quiz IDs: ${JSON.stringify(completedQuizIds)}`);
    console.log(`- Available Quiz Count: ${availableCount}`);
    console.log(`- Selected Quiz ID: ${quiz._id}`);
    console.log(`- Quiz Source (QuizBank or Gemini): ${source}`);

    return res.status(200).json({
      success: true,
      source,
      quiz: {
        _id: quiz._id,
        category: quiz.category,
        difficulty: quiz.difficulty,
        questions: quiz.questions.map(q => ({
          _id: q._id,
          questionId: q.questionId || q._id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        }))
      },
      attemptId: attempt._id
    });
  } catch (error) {
    console.error('Error in generateQuiz controller:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to generate quiz: ${error.message}`
    });
  }
};

/**
 * @desc    Submit quiz answers and evaluate score/accuracy metrics
 * @route   POST /api/aptitude/submit
 * @access  Private (JWT protected)
 */
export const submitQuiz = async (req, res, next) => {
  try {
    const { quizId, answers, timeTaken, attemptId } = req.body;

    // Perform request payload validation
    const validationError = validateSubmitRequest(quizId || '000000000000000000000000', answers);
    if (validationError && !attemptId) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    let attempt;
    if (attemptId) {
      attempt = await QuizAttempt.findOne({ _id: attemptId, user: req.user._id });
    } else if (quizId) {
      // Find the latest in-progress attempt for this quiz and user
      attempt = await QuizAttempt.findOne({ quiz: quizId, user: req.user._id, status: 'IN_PROGRESS' });
      if (!attempt) {
        attempt = new QuizAttempt({
          user: req.user._id,
          quiz: quizId,
          status: 'IN_PROGRESS'
        });
      }
    }

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found.'
      });
    }

    // Fetch the quiz details to grade the answers
    const quiz = await QuizBank.findById(attempt.quiz || quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz template not found.'
      });
    }

    // DEBUG LOG: Before grading
    console.log(`=== [DEBUG] QUIZ SUBMISSION STARTED ===`);
    console.log(`Attempt ID: ${attempt._id}`);
    console.log(`Quiz ID: ${quiz._id}`);
    console.log(`Number of answers received: ${answers ? answers.length : 0}`);
    console.log(`Question IDs received: ${JSON.stringify(answers ? answers.map(a => a.questionId) : [])}`);

    let correctAnswers = 0;
    let wrongAnswers = 0;
    let skippedQuestions = 0;
    const gradedAnswers = [];

    quiz.questions.forEach((q) => {
      const userAns = answers.find(
        a => a.questionId === q._id.toString() || a.questionId === q.questionId?.toString()
      );
      const selectedOption = userAns ? userAns.selectedOption : null;
      
      const isCorrect = selectedOption === q.correctAnswer;
      if (!selectedOption) {
        skippedQuestions++;
      } else if (isCorrect) {
        correctAnswers++;
      } else {
        wrongAnswers++;
      }

      gradedAnswers.push({
        questionId: q._id,
        selectedOption: selectedOption || undefined,
        correctOption: q.correctAnswer,
        isCorrect: !!selectedOption && isCorrect
      });
    });

    const totalQuestions = quiz.questions.length;
    const score = correctAnswers; 
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100); // consistently 0-100 percentage

    // DEBUG LOG: After grading
    console.log(`[DEBUG] GRADING COMPLETED:`);
    console.log(`- Correct Answers: ${correctAnswers}`);
    console.log(`- Wrong Answers: ${wrongAnswers}`);
    console.log(`- Skipped Questions: ${skippedQuestions}`);
    console.log(`- Score: ${score}`);
    console.log(`- Accuracy: ${accuracy}`);

    const statusBeforeSave = attempt.status;

    // DEBUG LOG: Before saving
    console.log(`[DEBUG] BEFORE SAVING:`);
    console.log(`- Previous Status: ${statusBeforeSave}`);

    attempt.quiz = quiz._id; // Ensure quiz field is populated with the correct QuizBank ObjectId
    attempt.category = quiz.category;
    attempt.difficulty = quiz.difficulty;
    attempt.answers = gradedAnswers;
    attempt.score = score;
    attempt.accuracy = accuracy;
    attempt.correctAnswers = correctAnswers;
    attempt.wrongAnswers = wrongAnswers;
    attempt.skippedQuestions = skippedQuestions;
    attempt.timeTaken = typeof timeTaken === 'number' ? timeTaken : 0;
    attempt.status = 'COMPLETED';
    attempt.submittedAt = new Date();

    await attempt.save();

    // DEBUG LOG: After saving
    console.log(`[DEBUG] AFTER SAVING:`);
    console.log(`- New Status: ${attempt.status}`);
    console.log(`- SubmittedAt: ${attempt.submittedAt}`);
    console.log(`- Saved Document: ${JSON.stringify(attempt, null, 2)}`);
    console.log(`========================================`);

    // Update attempts count and average accuracy percentage atomically on QuizBank to avoid race conditions
    await QuizBank.findByIdAndUpdate(quiz._id, [
      {
        $set: {
          totalAttempts: { $add: [{ $ifNull: ["$totalAttempts", 0] }, 1] },
          averageScore: {
            $cond: {
              if: { $eq: [{ $ifNull: ["$totalAttempts", 0] }, 0] },
              then: accuracy,
              else: {
                $divide: [
                  { $add: [{ $multiply: [{ $ifNull: ["$averageScore", 0] }, "$totalAttempts"] }, accuracy] },
                  { $add: ["$totalAttempts", 1] }
                ]
              }
            }
          }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    console.error('Error in submitQuiz controller:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to submit quiz: ${error.message}`
    });
  }
};

/**
 * @desc    Retrieve historical quiz attempts for the logged-in user
 * @route   GET /api/aptitude/history
 * @access  Private (JWT protected)
 */
export const getQuizHistory = async (req, res, next) => {
  try {
    const attempts = await QuizAttempt.find({ 
      user: req.user._id,
      status: 'COMPLETED' 
    })
    .select('_id category difficulty score accuracy correctAnswers wrongAnswers skippedQuestions timeTaken submittedAt status')
    .sort({ submittedAt: -1 });

    const formattedAttempts = attempts.map(attempt => ({
      attemptId: attempt._id,
      category: attempt.category,
      difficulty: attempt.difficulty,
      score: attempt.score,
      accuracy: attempt.accuracy,
      correctAnswers: attempt.correctAnswers,
      wrongAnswers: attempt.wrongAnswers,
      skippedQuestions: attempt.skippedQuestions,
      timeTaken: attempt.timeTaken,
      submittedAt: attempt.submittedAt,
      status: attempt.status
    }));

    return res.status(200).json({
      success: true,
      count: formattedAttempts.length,
      data: formattedAttempts
    });
  } catch (error) {
    console.error('Error in getQuizHistory controller:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to fetch quiz history: ${error.message}`
    });
  }
};

/**
 * @desc    Fetch a specific quiz attempt detail by attemptId
 * @route   GET /api/aptitude/history/:attemptId
 * @access  Private (JWT protected)
 */
export const getQuizAttempt = async (req, res, next) => {
  try {
    const { attemptId } = req.params;

    if (!attemptId || !/^[0-9a-fA-F]{24}$/.test(attemptId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz attempt ID format.'
      });
    }

    const attempt = await QuizAttempt.findOne({ _id: attemptId, user: req.user._id }).populate('quiz');
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found.'
      });
    }

    const summary = {
      attemptId: attempt._id,
      category: attempt.category,
      difficulty: attempt.difficulty,
      score: attempt.score,
      accuracy: attempt.accuracy,
      correctAnswers: attempt.correctAnswers,
      wrongAnswers: attempt.wrongAnswers,
      skippedQuestions: attempt.skippedQuestions,
      timeTaken: attempt.timeTaken,
      submittedDate: attempt.submittedAt
    };

    const questionsReview = attempt.quiz && attempt.quiz.questions ? attempt.quiz.questions.map(q => {
      const userAns = attempt.answers.find(ans => 
        ans.questionId.toString() === q._id.toString() || 
        ans.questionId.toString() === q.questionId?.toString()
      );
      return {
        question: q.question,
        options: q.options,
        userSelectedOption: userAns ? userAns.selectedOption : null,
        correctOption: q.correctAnswer,
        isCorrect: userAns ? userAns.isCorrect : false,
        explanation: q.explanation
      };
    }) : [];

    return res.status(200).json({
      success: true,
      data: {
        summary,
        questions: questionsReview
      }
    });
  } catch (error) {
    console.error('Error in getQuizAttempt controller:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to fetch quiz attempt details: ${error.message}`
    });
  }
};

/**
 * @desc    Delete a specific quiz attempt record
 * @route   DELETE /api/aptitude/history/:attemptId
 * @access  Private (JWT protected)
 */
export const deleteQuizAttempt = async (req, res, next) => {
  try {
    const { attemptId } = req.params;

    if (!attemptId || !/^[0-9a-fA-F]{24}$/.test(attemptId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz attempt ID format.'
      });
    }

    const attempt = await QuizAttempt.findOneAndDelete({ _id: attemptId, user: req.user._id });
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found or unauthorized.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Quiz attempt deleted successfully.'
    });
  } catch (error) {
    console.error('Error in deleteQuizAttempt controller:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to delete quiz attempt: ${error.message}`
    });
  }
};

/**
 * @desc    Fetch aggregated Category Analytics for the logged-in user
 * @route   GET /api/aptitude/analytics
 * @access  Private (JWT protected)
 */
export const getCategoryAnalytics = async (req, res, next) => {
  try {
    const stats = await QuizAttempt.aggregate([
      { $match: { user: req.user._id, status: 'COMPLETED' } },
      {
        $group: {
          _id: '$category',
          attemptsCount: { $sum: 1 },
          avgAccuracy: { $avg: '$accuracy' },
          bestAccuracy: { $max: '$accuracy' }
        }
      }
    ]);

    const categories = [
      'Quantitative Aptitude',
      'Logical Reasoning',
      'Verbal Ability',
      'Data Interpretation',
      'Mixed Aptitude'
    ];

    const analytics = categories.reduce((acc, cat) => {
      const catStat = stats.find(s => s._id === cat);
      acc[cat] = {
        attempts: catStat ? catStat.attemptsCount : 0,
        avg: catStat ? Math.round(catStat.avgAccuracy) : 0,
        best: catStat ? Math.round(catStat.bestAccuracy) : 0
      };
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error in getCategoryAnalytics controller:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to compile category analytics: ${error.message}`
    });
  }
};

/**
 * Helper to convert a Date to a local date string (YYYY-MM-DD) based on timezone
 */
const formatLocalDate = (date) => {
  const offset = date.getTimezoneOffset();
  const localTime = new Date(date.getTime() - offset * 60 * 1000);
  return localTime.toISOString().split('T')[0];
};

/**
 * Helper to compute active quiz streak from completed quiz dates (YYYY-MM-DD sorted descending)
 */
const getStreak = (completedDates) => {
  const uniqueDates = Array.from(new Set(completedDates));
  if (uniqueDates.length === 0) return 0;

  const todayStr = formatLocalDate(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterday);

  let currentCheckDate = new Date();
  let streak = 0;

  if (uniqueDates.includes(todayStr)) {
    streak = 1;
  } else if (uniqueDates.includes(yesterdayStr)) {
    streak = 1;
    currentCheckDate = yesterday;
  } else {
    return 0;
  }

  while (true) {
    currentCheckDate.setDate(currentCheckDate.getDate() - 1);
    const dateStr = formatLocalDate(currentCheckDate);
    if (uniqueDates.includes(dateStr)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

/**
 * @desc    Fetch aggregated Dashboard Statistics for the logged-in user
 * @route   GET /api/aptitude/dashboard
 * @access  Private (JWT protected)
 */
export const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Check if user has any completed attempts
    const totalCompleted = await QuizAttempt.countDocuments({ user: userId, status: 'COMPLETED' });
    if (totalCompleted === 0) {
      return res.status(200).json({
        success: true,
        hasAttempts: false,
        overallStats: {
          averageAccuracy: 0,
          completedCount: 0,
          questionsSolved: 0,
          highestAccuracy: 0,
          highestCategory: '',
          streak: 0,
          rank: 'Needs Improvement'
        }
      });
    }

    // 2. Fetch overall stats & category analytics using a single facet aggregation
    const aggregationResult = await QuizAttempt.aggregate([
      { $match: { user: userId, status: 'COMPLETED' } },
      {
        $facet: {
          overallStats: [
            {
              $group: {
                _id: null,
                avgAccuracy: { $avg: '$accuracy' },
                bestAccuracy: { $max: '$accuracy' },
                totalSolved: {
                  $sum: {
                    $subtract: [
                      { $ifNull: ['$totalQuestions', 10] },
                      { $ifNull: ['$skippedQuestions', 0] }
                    ]
                  }
                }
              }
            }
          ],
          categoryStats: [
            {
              $group: {
                _id: '$category',
                attemptsCount: { $sum: 1 },
                avgAccuracy: { $avg: '$accuracy' },
                bestAccuracy: { $max: '$accuracy' }
              }
            }
          ]
        }
      }
    ]);

    const overall = aggregationResult[0]?.overallStats[0] || { avgAccuracy: 0, bestAccuracy: 0, totalSolved: 0 };
    const categoryStats = aggregationResult[0]?.categoryStats || [];

    const averageAccuracy = Math.round(overall.avgAccuracy);
    const questionsSolved = overall.totalSolved || 0;

    // Calculate rank
    let rank = 'Needs Improvement';
    if (averageAccuracy >= 90) rank = 'Top 5% Performer';
    else if (averageAccuracy >= 80) rank = 'Top 10% Performer';
    else if (averageAccuracy >= 70) rank = 'Above Average';
    else if (averageAccuracy >= 60) rank = 'Good Progress';

    // 3. Find highest accuracy attempt to identify category
    const bestAttempt = await QuizAttempt.findOne({ user: userId, status: 'COMPLETED' })
      .sort({ accuracy: -1, submittedAt: -1 })
      .limit(1);
    const highestAccuracy = bestAttempt ? bestAttempt.accuracy : 0;
    const highestCategory = bestAttempt ? bestAttempt.category : '';

    // 4. Retrieve latest attempt details
    const latestAttempt = await QuizAttempt.findOne({ user: userId, status: 'COMPLETED' })
      .sort({ submittedAt: -1 })
      .limit(1);

    let latestAttemptData = null;
    if (latestAttempt) {
      latestAttemptData = {
        category: latestAttempt.category,
        difficulty: latestAttempt.difficulty,
        completedDate: latestAttempt.submittedAt.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
        score: latestAttempt.score,
        accuracy: latestAttempt.accuracy,
        attemptedCount: latestAttempt.totalQuestions - latestAttempt.skippedQuestions,
        timeTakenMinutes: Math.ceil(latestAttempt.timeTaken / 60) || 1,
        status: 'Completed'
      };
    }

    // 5. Calculate consecutive streak
    const dates = await QuizAttempt.distinct('submittedAt', { user: userId, status: 'COMPLETED' });
    const dateStrings = dates
      .filter(Boolean)
      .map(d => formatLocalDate(new Date(d)))
      .sort((a, b) => b.localeCompare(a));
    const streak = getStreak(dateStrings);

    // 6. Category Analytics Matrix
    const categories = [
      'Quantitative Aptitude',
      'Logical Reasoning',
      'Verbal Ability',
      'Data Interpretation',
      'Mixed Aptitude'
    ];

    const categoryAnalytics = {};
    categories.forEach(cat => {
      const catStat = categoryStats.find(s => s._id === cat);
      categoryAnalytics[cat] = {
        attempts: catStat ? catStat.attemptsCount : 0,
        avg: catStat ? Math.round(catStat.avgAccuracy) : 0,
        best: catStat ? Math.round(catStat.bestAccuracy) : 0
      };
    });

    // 7. Dynamic AI Recommendations
    const recommendations = [];

    // Find weakest category (lowest non-zero average accuracy among attempted ones)
    const attemptedStats = categoryStats.filter(c => c.attemptsCount > 0);
    let weakestCat = null;
    let weakestAcc = 101;
    attemptedStats.forEach(c => {
      if (c.avgAccuracy < weakestAcc) {
        weakestAcc = c.avgAccuracy;
        weakestCat = c._id;
      }
    });

    const topics = {
      'Quantitative Aptitude': 'Time & Distance',
      'Logical Reasoning': 'Syllogisms & Series',
      'Verbal Ability': 'Antonyms & Synonyms',
      'Data Interpretation': 'Chart Analysis',
      'Mixed Aptitude': 'Core Reasoning'
    };

    if (weakestCat) {
      recommendations.push({
        icon: 'zap',
        color: 'indigo',
        text: 'Focus more on ',
        boldText: topics[weakestCat] || 'Core Concepts',
        suffix: ` in ${weakestCat}.`
      });
    }

    // Find improvement or strongest category
    let improvementRec = null;
    for (const cat of categories) {
      const catAttempts = await QuizAttempt.find({ user: userId, category: cat, status: 'COMPLETED' })
        .sort({ submittedAt: -1 })
        .limit(2);
      if (catAttempts.length === 2 && catAttempts[0].accuracy > catAttempts[1].accuracy) {
        const diff = catAttempts[0].accuracy - catAttempts[1].accuracy;
        improvementRec = {
          icon: 'check',
          color: 'emerald',
          text: `Your ${cat} accuracy improved by `,
          boldText: `${diff}%`,
          suffix: ' over the previous attempt.'
        };
        break;
      }
    }

    if (!improvementRec) {
      // Compare overall latest attempt vs previous overall attempt
      const overallAttempts = await QuizAttempt.find({ user: userId, status: 'COMPLETED' })
        .sort({ submittedAt: -1 })
        .limit(2);
      if (overallAttempts.length === 2 && overallAttempts[0].accuracy > overallAttempts[1].accuracy) {
        const diff = overallAttempts[0].accuracy - overallAttempts[1].accuracy;
        improvementRec = {
          icon: 'check',
          color: 'emerald',
          text: 'Your latest attempt accuracy improved by ',
          boldText: `${diff}%`,
          suffix: ' over the previous assessment.'
        };
      }
    }

    if (!improvementRec) {
      // Find strongest category
      let strongestCat = null;
      let strongestAcc = -1;
      attemptedStats.forEach(c => {
        if (c.avgAccuracy > strongestAcc) {
          strongestAcc = c.avgAccuracy;
          strongestCat = c._id;
        }
      });
      if (strongestCat) {
        improvementRec = {
          icon: 'check',
          color: 'emerald',
          text: 'Your strongest area is ',
          boldText: strongestCat,
          suffix: ` with an average accuracy of ${Math.round(strongestAcc)}%.`
        };
      }
    }

    if (improvementRec) {
      recommendations.push(improvementRec);
    }

    // Find least practiced category
    let leastPracticedCat = null;
    let leastAttempts = Infinity;
    categories.forEach(cat => {
      const attemptsCount = categoryAnalytics[cat].attempts;
      if (attemptsCount < leastAttempts) {
        leastAttempts = attemptsCount;
        leastPracticedCat = cat;
      }
    });

    if (leastPracticedCat) {
      recommendations.push({
        icon: 'calendar',
        color: 'pink',
        text: 'Practice ',
        boldText: leastPracticedCat,
        suffix: ' this week to build balanced skills.'
      });
    }

    // Optional: Low Accuracy Warning
    let lowAccuracyCat = null;
    let lowestAvgAcc = 101;
    attemptedStats.forEach(c => {
      if (c.avgAccuracy < 60 && c.avgAccuracy < lowestAvgAcc) {
        lowestAvgAcc = c.avgAccuracy;
        lowAccuracyCat = c._id;
      }
    });

    if (lowAccuracyCat) {
      recommendations.push({
        icon: 'info',
        color: 'amber',
        text: `Your ${lowAccuracyCat} accuracy is below 60%. Try `,
        boldText: 'Easy Mode',
        suffix: ' to rebuild confidence.'
      });
    }

    // Fetch latest 5 completed attempts for the history table
    const recentAttempts = await QuizAttempt.find({ user: userId, status: 'COMPLETED' })
      .sort({ submittedAt: -1 })
      .limit(5);

    const historyData = recentAttempts.map(attempt => ({
      category: attempt.category,
      difficulty: attempt.difficulty,
      score: `${attempt.score} / 10`,
      accuracy: `${attempt.accuracy}%`,
      date: attempt.submittedAt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      status: 'Completed'
    }));

    return res.status(200).json({
      success: true,
      hasAttempts: true,
      overallStats: {
        averageAccuracy,
        completedCount: totalCompleted,
        highestAccuracy,
        highestCategory,
        questionsSolved,
        streak,
        rank
      },
      latestAttempt: latestAttemptData,
      categoryAnalytics,
      recommendations,
      history: historyData
    });
  } catch (error) {
    console.error('Error in getDashboardData:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to compile dashboard data: ${error.message}`
    });
  }
};

/**
 * @desc    Fetch the shared Question of the Day based on the current calendar day
 * @route   GET /api/aptitude/question-of-the-day
 * @access  Private (JWT protected)
 */
export const getQuestionOfTheDay = async (req, res, next) => {
  try {
    const count = await QuizBank.countDocuments({ status: 'ACTIVE' });
    if (count === 0) {
      return res.status(200).json({
        success: true,
        isEmpty: true,
        message: 'Question Bank Empty. Generate aptitude quizzes first.'
      });
    }

    // Deterministically select one question based on today's date string (YYYY-MM-DD)
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    // Simple hash function for dateStr
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const totalQuestionsCount = count * 10;
    const seedIndex = Math.abs(hash) % totalQuestionsCount;

    const quizIndex = Math.floor(seedIndex / 10);
    const questionIndex = seedIndex % 10;

    // Skip to the determined quiz index and project only the required fields
    const selectedQuiz = await QuizBank.findOne({ status: 'ACTIVE' })
      .skip(quizIndex)
      .select('category difficulty questions');

    if (!selectedQuiz || !selectedQuiz.questions || selectedQuiz.questions.length === 0) {
      // Fallback to first available active quiz if skip failed
      const fallbackQuiz = await QuizBank.findOne({ status: 'ACTIVE' }).select('category difficulty questions');
      if (!fallbackQuiz || !fallbackQuiz.questions || fallbackQuiz.questions.length === 0) {
        return res.status(200).json({
          success: true,
          isEmpty: true,
          message: 'Question Bank Empty. Generate aptitude quizzes first.'
        });
      }
      const question = fallbackQuiz.questions[0];
      return res.status(200).json({
        success: true,
        isEmpty: false,
        question: question.question,
        category: fallbackQuiz.category,
        difficulty: fallbackQuiz.difficulty,
        options: question.options,
        questionId: question.questionId || question._id
      });
    }

    const question = selectedQuiz.questions[questionIndex % selectedQuiz.questions.length];
    return res.status(200).json({
      success: true,
      isEmpty: false,
      question: question.question,
      category: selectedQuiz.category,
      difficulty: selectedQuiz.difficulty,
      options: question.options,
      questionId: question.questionId || question._id
    });
  } catch (error) {
    console.error('Error in getQuestionOfTheDay controller:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to fetch Question of the Day: ${error.message}`
    });
  }
};


