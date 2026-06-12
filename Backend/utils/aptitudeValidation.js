/**
 * Utility functions for validating Aptitude Quiz request payloads.
 */

/**
 * Validates the parameters for generating an AI Quiz.
 * 
 * @param {string} category - The requested aptitude category
 * @param {string} difficulty - The requested difficulty level
 * @returns {string|null} Error message if invalid, null if valid
 */
export const validateGenerateRequest = (category, difficulty) => {
  const allowedCategories = [
    'Mixed Aptitude',
    'Quantitative Aptitude',
    'Logical Reasoning',
    'Verbal Ability',
    'Data Interpretation'
  ];
  const allowedDifficulties = ['Easy', 'Medium', 'Hard', 'Adaptive'];

  if (!category) {
    return 'Category is required.';
  }
  if (!allowedCategories.includes(category)) {
    return `Invalid category. Allowed categories are: ${allowedCategories.join(', ')}`;
  }

  if (!difficulty) {
    return 'Difficulty is required.';
  }
  if (!allowedDifficulties.includes(difficulty)) {
    return `Invalid difficulty. Allowed difficulties are: ${allowedDifficulties.join(', ')}`;
  }

  return null;
};

/**
 * Validates the payload format for submitting a completed quiz.
 * Only checks request format, does not calculate scores or interact with DB.
 * 
 * @param {string} quizId - The MongoDB ObjectId of the QuizBank entry
 * @param {Array} answers - Array of answer choices submitted by the user
 * @returns {string|null} Error message if invalid, null if valid
 */
export const validateSubmitRequest = (quizId, answers) => {
  if (!quizId) {
    return 'Quiz ID (quizId) is required.';
  }
  // Validate MongoDB ObjectId pattern
  if (typeof quizId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(quizId)) {
    return 'Invalid Quiz ID format.';
  }

  if (!answers) {
    return 'Answers array is required.';
  }
  if (!Array.isArray(answers)) {
    return 'Answers must be provided in an array format.';
  }
  if (answers.length !== 10) {
    return 'Answers array must contain exactly 10 items.';
  }

  for (let i = 0; i < answers.length; i++) {
    const item = answers[i];
    if (!item || typeof item !== 'object') {
      return `Answer choice at index ${i} is invalid.`;
    }
    if (!item.questionId) {
      return `Answer choice at index ${i} is missing questionId.`;
    }
    if (typeof item.questionId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(item.questionId)) {
      return `Answer choice at index ${i} has an invalid questionId format.`;
    }
    
    // selectedOption is optional (user could skip), but if provided, it must be A, B, C, or D
    if (item.selectedOption !== undefined && item.selectedOption !== null && item.selectedOption !== '') {
      if (!['A', 'B', 'C', 'D'].includes(item.selectedOption)) {
        return `Answer choice at index ${i} has an invalid selectedOption '${item.selectedOption}'. Must be A, B, C, or D.`;
      }
    }
  }

  return null;
};
