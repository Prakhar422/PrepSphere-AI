import CodingQuestion from '../models/CodingQuestion.js';
import { generateAIQuestion } from '../services/codingJourneyService.js';

/**
 * Validates and parses the target CTC string.
 * Enforces positive numbers only and a maximum of 2 decimal places.
 * Returns formatted CTC string and value if valid, or null otherwise.
 *
 * @param {string} ctcStr 
 * @returns {{ctc: string, ctcValue: number}|null}
 */
const parseAndValidateCTC = (ctcStr) => {
  if (!ctcStr || typeof ctcStr !== 'string') return null;
  
  let cleaned = ctcStr.trim();
  // Automatically strip "LPA" suffix (case insensitive) if user typed it
  if (cleaned.toLowerCase().endsWith('lpa')) {
    cleaned = cleaned.substring(0, cleaned.length - 3).trim();
  }

  // Validate number format (positive only)
  const numVal = Number(cleaned);
  if (isNaN(numVal) || numVal <= 0) {
    return null;
  }

  // Check decimal places
  const decimalParts = cleaned.split('.');
  if (decimalParts.length > 1 && decimalParts[1].length > 2) {
    return null; // More than 2 decimal places
  }

  return {
    ctc: `${numVal} LPA`,
    ctcValue: numVal
  };
};

/**
 * Endpoint to generate a personalized coding question using Groq API.
 * Saves the question to the MongoDB database.
 * 
 * @route POST /api/coding-journey/generate-question
 * @access Private
 */
export const generateQuestion = async (req, res, next) => {
  try {
    const { company, role, difficulty, topic, language, ctc } = req.body;

    // Validate parameters existence and types
    if (!company || typeof company !== 'string' || !company.trim()) {
      return res.status(400).json({ success: false, message: 'Company name is required.' });
    }
    if (!role || typeof role !== 'string' || !role.trim()) {
      return res.status(400).json({ success: false, message: 'Role is required.' });
    }
    if (!difficulty || !['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({ success: false, message: 'Valid difficulty is required (Easy, Medium, Hard).' });
    }
    const validTopics = ['Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Binary Search', 'Sliding Window', 'Heap', 'Greedy'];
    if (!topic || !validTopics.includes(topic)) {
      return res.status(400).json({ success: false, message: `Valid topic is required. Must be one of: ${validTopics.join(', ')}` });
    }
    const validLanguages = ['C++', 'Java', 'Python', 'JavaScript'];
    if (!language || !validLanguages.includes(language)) {
      return res.status(400).json({ success: false, message: `Valid language is required. Must be one of: ${validLanguages.join(', ')}` });
    }
    if (!ctc || typeof ctc !== 'string' || !ctc.trim()) {
      return res.status(400).json({ success: false, message: 'Target CTC is required.' });
    }

    // Input Length Validation
    if (company.trim().length > 50) {
      return res.status(400).json({ success: false, message: 'Company name must not exceed 50 characters.' });
    }
    if (role.trim().length > 50) {
      return res.status(400).json({ success: false, message: 'Target role must not exceed 50 characters.' });
    }
    if (ctc.trim().length > 20) {
      return res.status(400).json({ success: false, message: 'Target CTC must not exceed 20 characters.' });
    }

    // Input Sanitization (trim & slice)
    const sanitizedCompany = company.trim().slice(0, 50);
    const sanitizedRole = role.trim().slice(0, 50);
    const sanitizedCtc = ctc.trim().slice(0, 20);

    // Validate CTC
    const ctcDetails = parseAndValidateCTC(sanitizedCtc);
    if (!ctcDetails) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Target CTC format. Must be a positive number with at most 2 decimal places (e.g. 12, 7.5, "12 LPA").'
      });
    }

    // Fetch previously generated titles by this user to avoid repeats
    const userPreviousQuestions = await CodingQuestion.find({ user: req.user._id }, { title: 1 }).lean();
    const excludeTitles = userPreviousQuestions.map(q => q.title);

    // Call Groq service
    const questionAI = await generateAIQuestion({
      company: sanitizedCompany,
      role: sanitizedRole,
      difficulty,
      topic,
      language,
      ctc: ctcDetails.ctc,
      excludeTitles
    });

    // Save to Database
    const newCodingQuestion = new CodingQuestion({
      user: req.user._id,
      company: sanitizedCompany,
      role: sanitizedRole,
      difficulty,
      topic,
      language,
      ctc: ctcDetails.ctc,
      ctcValue: ctcDetails.ctcValue,
      title: questionAI.title,
      description: questionAI.description,
      constraints: questionAI.constraints,
      examples: questionAI.examples,
      hints: questionAI.hints,
      tags: questionAI.tags || [],
      expectedTimeComplexity: questionAI.expectedTimeComplexity,
      expectedSpaceComplexity: questionAI.expectedSpaceComplexity,
      status: 'generated'
    });

    await newCodingQuestion.save();

    return res.status(201).json({
      success: true,
      data: newCodingQuestion
    });

  } catch (error) {
    console.error('[CODING JOURNEY CONTROLLER ERROR] generateQuestion error:', error);
    
    const errorMsg = error.message || '';
    
    if (errorMsg.includes('GROQ_API_KEY') || errorMsg.includes('Groq API Key')) {
      return res.status(500).json({
        success: false,
        message: 'Groq API Key is not configured on the server. Please contact support.'
      });
    }

    if (errorMsg.includes('rate limit') || errorMsg.includes('429') || errorMsg.includes('limit')) {
      return res.status(429).json({
        success: false,
        message: 'AI service rate limit reached. Please try again in a few moments.'
      });
    }

    if (errorMsg.includes('JSON') || errorMsg.includes('format')) {
      return res.status(502).json({
        success: false,
        message: 'AI generated an invalid question format. Please try again.'
      });
    }

    if (error.name === 'ValidationError' || error.message.includes('validation')) {
      return res.status(400).json({
        success: false,
        message: 'Database validation failed. Please check your inputs.'
      });
    }
    
    return res.status(502).json({
      success: false,
      message: 'Unable to generate a question right now. Please try again in a few moments.'
    });
  }
};
