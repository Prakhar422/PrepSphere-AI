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

/**
 * Creates a new interview experience.
 * @param {object} data - Experience form fields
 * @returns {Promise<object>} Backend response
 */
export const createExperience = async (data) => {
  const response = await api.post('/interview-experiences', data);
  return response.data;
};

/**
 * Updates an existing interview experience.
 * @param {string} id - Experience ID
 * @param {object} data - Updated experience form fields
 * @returns {Promise<object>} Backend response
 */
export const updateExperience = async (id, data) => {
  const response = await api.put(`/interview-experiences/${id}`, data);
  return response.data;
};

/**
 * Deletes an interview experience.
 * @param {string} id - Experience ID
 * @returns {Promise<object>} Backend response
 */
export const deleteExperience = async (id) => {
  const response = await api.delete(`/interview-experiences/${id}`);
  return response.data;
};

/**
 * Fetches only interview experiences created by the logged-in user.
 * @returns {Promise<object>} Backend response
 */
export const getMyExperiences = async () => {
  const response = await api.get('/interview-experiences/my');
  return response.data;
};

/**
 * Fetches a single interview experience by ID.
 * @param {string} id - Experience ID
 * @returns {Promise<object>} Experience details response
 */
export const getExperienceById = async (id) => {
  const response = await api.get(`/interview-experiences/${id}`);
  return response.data;
};

/**
 * Fetches similar interview experiences for a given experience ID.
 * @param {string} id - Experience ID
 * @returns {Promise<object>} Similar experiences response
 */
export const getSimilarExperiences = async (id) => {
  const response = await api.get(`/interview-experiences/${id}/similar`);
  return response.data;
};

/**
 * Toggles like on an interview experience
 * @param {string} id 
 * @returns {Promise<object>} response data
 */
export const likeExperience = async (id) => {
  const response = await api.post(`/interview-experiences/${id}/like`);
  return response.data;
};

/**
 * Toggles bookmark on an interview experience
 * @param {string} id 
 * @returns {Promise<object>} response data
 */
export const bookmarkExperience = async (id) => {
  const response = await api.post(`/interview-experiences/${id}/bookmark`);
  return response.data;
};

/**
 * Fetches all bookmarked interview experiences
 * @returns {Promise<object>} bookmarked experiences list
 */
export const getBookmarks = async () => {
  const response = await api.get('/interview-experiences/bookmarks');
  return response.data;
};

/**
 * Submits a report on an interview experience
 * @param {string} id 
 * @param {object} data - { reason, description }
 * @returns {Promise<object>} response data
 */
export const reportExperience = async (id, data) => {
  const response = await api.post(`/interview-experiences/${id}/report`, data);
  return response.data;
};

/**
 * Increments view count for an experience
 * @param {string} id 
 * @returns {Promise<object>} response data
 */
export const incrementViewCount = async (id) => {
  const response = await api.post(`/interview-experiences/${id}/view`);
  return response.data;
};

/**
 * Gets comments for an experience
 * @param {string} id 
 * @returns {Promise<object>} comments list
 */
export const getComments = async (id) => {
  const response = await api.get(`/interview-experiences/${id}/comments`);
  return response.data;
};

/**
 * Adds a comment to an experience
 * @param {string} id 
 * @param {string} content 
 * @returns {Promise<object>} created comment
 */
export const addComment = async (id, content) => {
  const response = await api.post(`/interview-experiences/${id}/comments`, { content });
  return response.data;
};

/**
 * Deletes a comment by ID
 * @param {string} commentId 
 * @returns {Promise<object>} response status
 */
export const deleteComment = async (commentId) => {
  const response = await api.delete(`/interview-experiences/comments/${commentId}`);
  return response.data;
};

/**
 * Fetches company search suggestions from dynamic MongoDB entries.
 * @param {string} search 
 * @returns {Promise<object>} response data
 */
export const getCompaniesFilter = async (search = "") => {
  const response = await api.get('/interview-experiences/filter/companies', { params: { search } });
  return response.data;
};

/**
 * Fetches role search suggestions from dynamic MongoDB entries.
 * @param {string} search 
 * @returns {Promise<object>} response data
 */
export const getRolesFilter = async (search = "") => {
  const response = await api.get('/interview-experiences/filter/roles', { params: { search } });
  return response.data;
};

/**
 * Fetches dynamic top contributors from MongoDB.
 * @returns {Promise<object>} response data
 */
export const getTopContributors = async () => {
  const response = await api.get('/interview-experiences/top-contributors');
  return response.data;
};

/**
 * Fetches dynamic popular tags from MongoDB.
 * @returns {Promise<object>} response data
 */
export const getPopularTags = async () => {
  const response = await api.get('/interview-experiences/popular-tags');
  return response.data;
};
