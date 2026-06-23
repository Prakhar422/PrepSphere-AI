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
