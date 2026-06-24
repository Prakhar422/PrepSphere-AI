import api from './api';

/**
 * Generates a personalized coding question using Groq API.
 * 
 * @param {Object} data - Form data containing company, role, difficulty, topic, language, ctc
 * @returns {Promise<Object>} The server response containing the generated coding question
 */
export const generateQuestion = async (data) => {
  const response = await api.post('/coding-journey/generate-question', data);
  return response.data;
};

/**
 * Submits solution code to AI reviewer.
 */
export const submitCode = async (data) => {
  const response = await api.post('/coding-journey/submit', data);
  return response.data;
};

/**
 * Retrieves previous submissions for a question.
 */
export const getSubmissions = async (questionId) => {
  const response = await api.get(`/coding-journey/submissions/${questionId}`);
  return response.data;
};

/**
 * Retrieves coding dashboard statistics and generated questions.
 */
export const getCodingDashboard = async () => {
  const response = await api.get('/coding-journey/dashboard');
  return response.data;
};

/**
 * Retrieves coding questions history with pagination and filters.
 */
export const getHistory = async (params) => {
  const response = await api.get('/coding-journey/history', { params });
  return response.data;
};

/**
 * Toggles a bookmark for a coding question.
 */
export const toggleBookmark = async (questionId) => {
  const response = await api.patch(`/coding-journey/bookmark/${questionId}`);
  return response.data;
};

/**
 * Retrieves all bookmarked coding questions.
 */
export const getBookmarks = async () => {
  const response = await api.get('/coding-journey/bookmarks');
  return response.data;
};

/**
 * Retrieves advanced analytics for the user's coding journey.
 */
export const getAnalytics = async () => {
  const response = await api.get('/coding-journey/analytics');
  return response.data;
};

/**
 * Retrieves detailed reports and timeline statistics for a specific question.
 */
export const getQuestionDetails = async (questionId) => {
  const response = await api.get(`/coding-journey/question/${questionId}`);
  return response.data;
};

