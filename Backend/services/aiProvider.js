import * as groqService from './groqService.js';

/**
 * Generates the first interview question.
 */
export const generateFirstQuestion = async (params) => {
  return await groqService.generateFirstQuestion(params);
};

/**
 * Evaluates candidate's response to an interview question and generates the next question.
 */
export const evaluateInterviewAnswer = async (params) => {
  return await groqService.evaluateInterviewAnswer(params);
};

/**
 * Generates the final compiled interview evaluation and placement report.
 */
export const generateInterviewReport = async (params) => {
  return await groqService.generateInterviewReport(params);
};
