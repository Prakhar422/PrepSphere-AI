import {
  ALLOWED_INTERVIEW_TYPES,
  ALLOWED_DIFFICULTIES,
  ALLOWED_LANGUAGES,
  DURATION_QUESTION_MAP
} from '../config/interviewConfig.js';

/**
 * Utility functions for validating Mock Interview request payloads.
 */

/**
 * Validates the parameters for initializing a mock interview session.
 * 
 * @param {Object} data - The request payload body
 * @returns {string|null} Error message if invalid, null if valid
 */
export const validateStartRequest = (data) => {
  const {
    interviewType,
    company,
    role,
    difficulty,
    duration,
    language,
    focusAreas,
    resumeEnabled
  } = data;

  if (!interviewType) {
    return 'Interview type (interviewType) is required.';
  }
  if (!ALLOWED_INTERVIEW_TYPES.includes(interviewType)) {
    return `Invalid interview type. Allowed types are: ${ALLOWED_INTERVIEW_TYPES.join(', ')}`;
  }

  const trimmedCompany = company ? String(company).trim() : '';
  if (!trimmedCompany) {
    return 'Company name is required.';
  }
  if (trimmedCompany === 'Other') {
    if (!data.customCompany || !String(data.customCompany).trim()) {
      return 'Custom company name is required when Target Company is set to Other.';
    }
  }

  const trimmedRole = role ? String(role).trim() : '';
  if (!trimmedRole) {
    return 'Job role is required.';
  }
  if (trimmedRole === 'Other') {
    if (!data.customRole || !String(data.customRole).trim()) {
      return 'Custom job role is required when Target Job Role is set to Other.';
    }
  }

  if (!difficulty) {
    return 'Difficulty level is required.';
  }
  if (!ALLOWED_DIFFICULTIES.includes(difficulty)) {
    return `Invalid difficulty level. Allowed levels are: ${ALLOWED_DIFFICULTIES.join(', ')}`;
  }

  if (duration === undefined || duration === null) {
    return 'Interview duration is required.';
  }
  const parsedDuration = Number(duration);
  if (!DURATION_QUESTION_MAP[parsedDuration]) {
    return `Invalid duration. Allowed durations are: ${Object.keys(DURATION_QUESTION_MAP).join(', ')} minutes.`;
  }

  if (!language) {
    return 'Speaking language is required.';
  }
  const trimmedLanguage = String(language).trim();
  if (!ALLOWED_LANGUAGES.includes(trimmedLanguage)) {
    return `Invalid speaking language. Allowed values are: ${ALLOWED_LANGUAGES.join(', ')}`;
  }



  if (resumeEnabled !== undefined && resumeEnabled !== null) {
    if (typeof resumeEnabled !== 'boolean') {
      return 'Resume enabled setting must be a boolean.';
    }
  }

  return null;
};

/**
 * Validates the parameters for submitting an interview answer.
 * 
 * @param {Object} data - The request payload body
 * @returns {string|null} Error message if invalid, null if valid
 */
export const validateAnswerRequest = (data) => {
  if (!data) {
    return 'Request body is missing.';
  }
  const { answer } = data;
  if (answer === undefined || answer === null || String(answer).trim() === '') {
    return 'Answer must not be empty.';
  }
  return null;
};

