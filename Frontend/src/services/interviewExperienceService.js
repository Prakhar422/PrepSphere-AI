import api from './api';

/**
 * Fetches all interview experiences based on pagination, search, filter, and sort params.
 * @param {object} params - Query params (page, limit, search, company, role, difficulty, interviewType, result, sortBy)
 * @returns {Promise<object>} Backend response with experiences list and pagination metadata
 */
export const getAllExperiences = async (params = {}) => {
  const response = await api.get('/interview-experiences', { params });
  return response.data;
};

/**
 * Searches interview experiences with a keyword.
 * @param {string} search - Search query keyword
 * @param {object} params - Additional query params
 * @returns {Promise<object>} Backend response
 */
export const searchExperiences = async (search, params = {}) => {
  return getAllExperiences({ ...params, search });
};

/**
 * Filters interview experiences by multiple criteria.
 * @param {object} filters - Active filter mappings
 * @param {object} params - Additional query params
 * @returns {Promise<object>} Backend response
 */
export const filterExperiences = async (filters = {}, params = {}) => {
  return getAllExperiences({ ...params, ...filters });
};

/**
 * Fetches unified metadata containing community stats, featured companies, and trending companies.
 * @returns {Promise<object>} Metadata response
 */
export const getMetadata = async () => {
  const response = await api.get('/interview-experiences/meta');
  return response.data;
};

/**
 * Retrieves the list of featured companies from the metadata endpoint.
 * @returns {Promise<Array>} List of featured companies
 */
export const getFeaturedCompanies = async () => {
  const response = await getMetadata();
  return response.featuredCompanies || [];
};

/**
 * Retrieves the list of trending companies from the metadata endpoint.
 * @returns {Promise<Array>} List of trending companies
 */
export const getTrendingCompanies = async () => {
  const response = await getMetadata();
  return response.trendingCompanies || [];
};
