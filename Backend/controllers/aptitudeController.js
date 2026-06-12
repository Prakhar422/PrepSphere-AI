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

    // Create an in-progress QuizAttempt to track the user's attempt
    const attempt = await QuizAttempt.create({
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

    return res.status(200).json({
      success: true,
      source,
      quiz: {
        _id: quiz._id,
        category: quiz.category,
        difficulty: quiz.difficulty,
        questions: quiz.questions.map(q => ({
          _id: q._id,
          question: q.question,
          options: q.options
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

    // Update attempts count and average accuracy percentage atomically on QuizBank to avoid race conditions
    await QuizBank.findByIdAndUpdate(attempt.quiz || quizId, [
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
    const attempts = await QuizAttempt.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts
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

    return res.status(200).json({
      success: true,
      data: attempt
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
