import QuizBank from '../models/QuizBank.js';
import QuizAttempt from '../models/QuizAttempt.js';

/**
 * Checks the QuizBank for available active quizzes that the user has not attempted.
 * If one or more are found, randomly selects one, increments timesServed atomically, and returns it.
 * 
 * @param {string} userId - Authenticated user's ObjectId
 * @param {string} category - Requested quiz category
 * @param {string} difficulty - Requested quiz difficulty
 * @returns {Promise<object|null>} Selected Quiz document, or null if no unused active quiz exists
 */
export const getAvailableQuiz = async (userId, category, difficulty) => {
  // 1. Fetch attempted quiz IDs (only completed attempts) using distinct query
  const completedQuizIds = await QuizAttempt.distinct('quiz', {
    user: userId,
    status: 'COMPLETED'
  });

  // 2. Query all active quizzes for this category and difficulty that the user has never completed
  const unusedQuizzes = await QuizBank.find({
    category,
    difficulty,
    status: 'ACTIVE',
    _id: { $nin: completedQuizIds }
  });

  if (unusedQuizzes.length === 0) {
    return null;
  }

  // 3. Randomly select one unused quiz
  const randomIndex = Math.floor(Math.random() * unusedQuizzes.length);
  const selectedQuiz = unusedQuizzes[randomIndex];

  // 4. Increment timesServed atomically
  const updatedQuiz = await QuizBank.findByIdAndUpdate(
    selectedQuiz._id,
    { $inc: { timesServed: 1 } },
    { new: true }
  );

  return updatedQuiz;
};

/**
 * Saves a newly AI-generated quiz to the QuizBank database.
 * 
 * @param {object} quizData - Quiz attributes containing category, difficulty, questions
 * @returns {Promise<object>} Saved Quiz document
 */
export const saveGeneratedQuiz = async (quizData) => {
  const newQuiz = new QuizBank({
    category: quizData.category,
    difficulty: quizData.difficulty,
    questions: quizData.questions,
    totalQuestions: 10,
    timesServed: 1,
    status: 'ACTIVE',
    generatedBy: 'Gemini',
    totalAttempts: 0,
    averageScore: 0,
    estimatedTime: 15
  });

  const savedQuiz = await newQuiz.save();
  return savedQuiz;
};
