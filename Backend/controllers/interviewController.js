import mongoose from 'mongoose';
import InterviewSession from '../models/InterviewSession.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import { validateStartRequest } from '../utils/interviewValidation.js';
import { generateFirstQuestion } from '../services/geminiInterviewService.js';
import { DURATION_QUESTION_MAP } from '../config/interviewConfig.js';

/**
 * Reusable helper to generate fallback focus areas dynamically based on target role.
 * 
 * @param {string} role - Candidate job role
 * @returns {Array<string>} Fallback core concepts
 */
const getRoleCoreConcepts = (role) => {
  const roleLower = (role || '').toLowerCase();
  
  if (roleLower.includes('frontend') || roleLower.includes('react') || roleLower.includes('ui') || roleLower.includes('web')) {
    return ['Core React concepts', 'Frontend Architecture', 'Web Performance & Optimization'];
  }
  if (roleLower.includes('backend') || roleLower.includes('node') || roleLower.includes('api') || roleLower.includes('server')) {
    return ['Node.js fundamentals', 'API Design & Security', 'Database Schema Management'];
  }
  if (roleLower.includes('full stack') || roleLower.includes('mern') || roleLower.includes('fullstack')) {
    return ['Full Stack Architecture', 'MERN Stack Patterns', 'State Management & Sync'];
  }
  if (roleLower.includes('data scientist') || roleLower.includes('data analyst') || roleLower.includes('science') || roleLower.includes('analyst')) {
    return ['Data analysis methodologies', 'Statistical modeling', 'SQL Query Optimization'];
  }
  if (roleLower.includes('ai') || roleLower.includes('machine learning') || roleLower.includes('ml')) {
    return ['Machine learning algorithms', 'Model evaluation metrics', 'AI system deployment'];
  }
  if (roleLower.includes('devops') || roleLower.includes('cloud') || roleLower.includes('aws')) {
    return ['CI/CD deployment pipelines', 'Containerization & Docker', 'Cloud system architecture'];
  }
  
  // Default software engineer / CS fundamentals
  return ['Computer Science fundamentals', 'Data Structures', 'Algorithmic complexity (Big O)'];
};

/**
 * Helper to construct recruiter-oriented resume profiles for Gemini prompts.
 * 
 * @param {Object} resume - Resume document
 * @returns {string} Text context
 */
const buildResumeContext = (resume) => {
  if (!resume) return '';
  
  // Check if parsed candidate profile fields exist
  if (resume.candidateName || resume.professionalSummary || (resume.projects && resume.projects.length > 0)) {
    const techSkills = resume.technicalSkills || {};
    const skillsList = [
      techSkills.programmingLanguages?.length ? `- Programming Languages: ${techSkills.programmingLanguages.join(', ')}` : '',
      techSkills.frameworks?.length ? `- Frameworks: ${techSkills.frameworks.join(', ')}` : '',
      techSkills.libraries?.length ? `- Libraries: ${techSkills.libraries.join(', ')}` : '',
      techSkills.databases?.length ? `- Databases: ${techSkills.databases.join(', ')}` : '',
      techSkills.tools?.length ? `- Tools: ${techSkills.tools.join(', ')}` : ''
    ].filter(Boolean).join('\n');

    const projectsList = (resume.projects || [])
      .map(p => `- Title: ${p.title}\n  Description: ${p.description}\n  Technologies Used: ${p.technologiesUsed?.join(', ') || 'None'}`)
      .join('\n\n');

    const experienceList = (resume.experience || [])
      .map(e => `- Role: ${e.role} at ${e.company} (${e.duration})\n  Description: ${e.description}`)
      .join('\n\n');

    const educationList = (resume.education || [])
      .map(edu => `- Institution: ${edu.institution}, Degree: ${edu.degree} (${edu.year})`)
      .join('\n');

    return `
Candidate Name: ${resume.candidateName || 'Candidate'}
Professional Summary: ${resume.professionalSummary || 'No summary provided.'}

Technical Skills Breakdown:
${skillsList || 'None specified.'}

Projects:
${projectsList || 'None specified.'}

Work Experience:
${experienceList || 'None specified.'}

Education History:
${educationList || 'None specified.'}

Certifications: ${resume.certifications?.join(', ') || 'None'}
Achievements: ${resume.achievements?.join(', ') || 'None'}
Relevant Keywords: ${resume.relevantKeywords?.join(', ') || 'None'}
[Optional Metadata - ATS Score: ${resume.atsAnalysis?.score || 0}%]
`;
  }

  // Fallback compile logic for legacy documents
  const score = resume.atsAnalysis?.score || 0;
  const strengths = resume.overallReport?.strengths || '';
  const weaknesses = resume.overallReport?.weaknesses || '';
  const advice = resume.overallReport?.finalAdvice || '';
  const keywords = resume.missingKeywords ? resume.missingKeywords.join(', ') : '';
  const sections = (resume.sectionAnalysis || [])
    .map(sec => `- ${sec.section}: Score: ${sec.score}%, Status: ${sec.status}, Suggestions: ${sec.suggestions}`)
    .join('\n');

  return `
[Legacy Profile Fallback]
Candidate Name: Candidate
Resume File: ${resume.resumeName}
Known Strengths: ${strengths}
Known Weaknesses: ${weaknesses}
Advice Details: ${advice}
Keywords/Skills: ${keywords}
Section Performance Summaries:
${sections}
[Optional Metadata - ATS Score: ${score}%]
`;
  };

/**
 * Initializes a new mock interview session, loads resume context if requested,
 * requests Gemini to generate the first question, and returns the session details.
 * 
 * @route POST /api/interview/start
 * @access Private
 */
export const startInterview = async (req, res, next) => {
  const startTime = Date.now();
  try {
    // 1. Sanitize Payload (trim whitespace for strings, check properties)
    if (req.body) {
      if (req.body.company) req.body.company = String(req.body.company).trim();
      if (req.body.role) req.body.role = String(req.body.role).trim();
      if (req.body.customCompany) req.body.customCompany = String(req.body.customCompany).trim();
      if (req.body.customRole) req.body.customRole = String(req.body.customRole).trim();
      if (req.body.language) req.body.language = String(req.body.language).trim();
    }

    const {
      interviewType,
      company,
      role,
      difficulty,
      duration,
      language,
      focusAreas,
      resumeEnabled,
      resumeId
    } = req.body;

    // 2. Validate Input Payload
    const validationError = validateStartRequest(req.body);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    // 3. Validate User Context
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User information is missing.'
      });
    }

    // 4. Resume Integration checks
    let resumeRef = null;
    let resumeContext = '';
    let resumeLoaded = false;

    if (resumeEnabled) {
      let resume = null;
      if (resumeId) {
        // Verify valid MongoDB ObjectId
        if (!/^[0-9a-fA-F]{24}$/.test(resumeId)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid Resume ID format.'
          });
        }
        
        try {
          resume = await ResumeAnalysis.findOne({ _id: resumeId });
        } catch (dbErr) {
          console.error('[DATABASE FAILURE] Unable to fetch resume:', dbErr.message);
          return res.status(500).json({
            success: false,
            message: 'Database failure occurred while checking resume details.'
          });
        }

        if (!resume) {
          return res.status(404).json({
            success: false,
            message: 'Specified resume not found.'
          });
        }

        // Verify ownership
        if (resume.user.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Access Denied: You do not own this resume analysis record.'
          });
        }
      } else {
        // Retrieve user's latest analyzed resume
        try {
          resume = await ResumeAnalysis.findOne({ user: req.user._id })
            .sort({ createdAt: -1 });
        } catch (dbErr) {
          console.error('[DATABASE FAILURE] Unable to fetch latest resume:', dbErr.message);
          return res.status(500).json({
            success: false,
            message: 'Database failure occurred while checking latest resume details.'
          });
        }
      }

      if (!resume) {
        return res.status(400).json({
          success: false,
          message: 'No analyzed resume found. Please analyze a resume first before enabling resume context.'
        });
      }

      resumeRef = resume._id;
      resumeLoaded = true;

      // Extract context details recruiter-style
      resumeContext = buildResumeContext(resume);
    }

    // 5. Automatic Focus Areas Fallback
    const resolvedFocusAreas = (focusAreas && focusAreas.length > 0)
      ? focusAreas
      : getRoleCoreConcepts(role === 'Other' ? req.body.customRole : role);

    // 6. Request Gemini to generate the first question
    const geminiStartTime = Date.now();
    let geminiResult;
    try {
      geminiResult = await generateFirstQuestion({
        interviewType,
        company: company === 'Other' ? req.body.customCompany : company,
        role: role === 'Other' ? req.body.customRole : role,
        difficulty,
        language,
        focusAreas: resolvedFocusAreas,
        resumeContext
      });
    } catch (geminiError) {
      console.error('[GEMINI AI FAILURE] Mock Interview question generation failed:', geminiError.message || geminiError);
      return res.status(502).json({
        success: false,
        message: `Failed to generate interview question via Gemini AI: ${geminiError.message || 'Transient error occurred.'}`
      });
    }
    const geminiResponseTime = Date.now() - geminiStartTime;
    const { question: firstAIQuestion, usage, modelUsed } = geminiResult;

    // 7. Calculate total questions count based on duration mapping
    const durationNum = Number(duration);
    const totalQuestions = DURATION_QUESTION_MAP[durationNum] || 15;

    // 8. Create InterviewSession record
    const firstQuestionId = new mongoose.Types.ObjectId();
    let session;
    try {
      session = new InterviewSession({
        user: req.user._id,
        interviewType,
        company: company === 'Other' ? req.body.customCompany : company,
        role: role === 'Other' ? req.body.customRole : role,
        difficulty,
        duration: durationNum,
        language,
        focusAreas: resolvedFocusAreas,
        resumeEnabled: !!resumeEnabled,
        resumeRef,
        currentQuestionNumber: 1,
        currentQuestionId: firstQuestionId,
        currentQuestionStatus: 'PENDING',
        totalQuestions,
        conversationHistory: [
          {
            questionNumber: 1,
            questionId: firstQuestionId,
            question: firstAIQuestion,
            userAnswer: '',
            questionAskedTime: new Date(),
            status: 'PENDING',
            evaluation: {
              score: 0,
              strengths: [],
              weaknesses: [],
              suggestions: [],
              idealAnswer: ''
            }
          }
        ],
        status: 'IN_PROGRESS',
        startedAt: new Date()
      });

      await session.save();
    } catch (dbErr) {
      console.error('[DATABASE FAILURE] Unable to save interview session:', dbErr.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error occurred while writing session to database.'
      });
    }

    const executionTime = Date.now() - startTime;

    // 9. Structured logging for model inspects and usage optimizations
    console.log('--- INTERVIEW SESSION START INITIATED ---');
    console.log(`Interview Session ID: ${session._id}`);
    console.log(`Current Question Number: 1`);
    console.log(`Resume Loaded: ${resumeLoaded}`);
    console.log(`Execution Time: ${executionTime}ms`);
    console.log(`Gemini Response Time: ${geminiResponseTime}ms`);
    console.log(`Gemini Model Used: ${modelUsed}`);
    if (usage) {
      console.log(`Prompt Tokens: ${usage.promptTokens}`);
      console.log(`Completion Tokens: ${usage.completionTokens}`);
      console.log(`Total Tokens: ${usage.totalTokens}`);
    }
    console.log('-----------------------------------------');

    // 10. Return payload to frontend (maintain full compatibility)
    return res.status(201).json({
      success: true,
      interviewId: session._id,
      interviewConfiguration: {
        interviewType: session.interviewType,
        company: session.company,
        role: session.role,
        difficulty: session.difficulty,
        duration: session.duration,
        language: session.language,
        focusAreas: session.focusAreas,
        resumeEnabled: session.resumeEnabled
      },
      firstQuestion: firstAIQuestion,
      questionNumber: 1,
      totalQuestions,
      sessionStatus: session.status
    });

  } catch (error) {
    console.error('Unhandled internal server error during startInterview:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error occurred while initializing interview session.'
    });
  }
};
