import api from './api';

/**
 * Starts a new mock interview session.
 * 
 * @param {Object} data - Interview setup configurations
 * @returns {Promise<Object>} The server response containing first question and session details
 */
export const startInterview = async (data) => {
  const response = await api.post('/interview/start', data);
  return response.data;
};

/**
 * Submits candidate's answer for evaluation and retrieves the next question.
 * 
 * @param {string} interviewId - The MongoDB ObjectId of the interview session
 * @param {Object} data - Payload containing candidate's answer
 * @returns {Promise<Object>} The server response containing evaluation and nextQuestion details
 */
export const submitAnswer = async (interviewId, data) => {
  const response = await api.post(`/interview/${interviewId}/answer`, data);
  return response.data;
};

/**
 * Retrieves paginated mock interview history logs for the user.
 * 
 * @param {number} page - Active page index
 * @param {number} limit - Target item limit
 * @returns {Promise<Object>} The server response containing history and pagination metadata
 */
export const getInterviewHistory = async (page = 1, limit = 10) => {
  const response = await api.get('/interview/history', { params: { page, limit } });
  return response.data;
};

/**
 * Retrieves the compiled AI evaluation report for a finished interview session.
 * 
 * @param {string} interviewId - The MongoDB ObjectId of the interview session
 * @returns {Promise<Object>} The server response containing the compiled report metrics
 */
export const getInterviewReport = async (interviewId) => {
  const response = await api.get(`/interview/${interviewId}/report`);
  return response.data;
};
