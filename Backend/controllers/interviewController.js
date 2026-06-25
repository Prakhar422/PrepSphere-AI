import mongoose from 'mongoose';
import InterviewSession from '../models/InterviewSession.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import { validateStartRequest, validateAnswerRequest } from '../utils/interviewValidation.js';
import { generateFirstQuestion, evaluateInterviewAnswer, generateInterviewReport } from '../services/aiProvider.js';
import { DURATION_QUESTION_MAP } from '../config/interviewConfig.js';
import { calculateInterviewStreak } from '../utils/streakUtility.js';


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

    // 5. Request AI to generate the first question
    const aiStartTime = Date.now();
    let aiResult;
    try {
      aiResult = await generateFirstQuestion({
        interviewType,
        company: company === 'Other' ? req.body.customCompany : company,
        role: role === 'Other' ? req.body.customRole : role,
        difficulty,
        language,
        resumeContext
      });
    } catch (aiError) {
      console.error('[AI SERVICE FAILURE] Mock Interview question generation failed:', aiError.message || aiError);
      const status = aiError.status || 502;
      return res.status(status).json({
        success: false,
        message: `Failed to generate interview question via AI service: ${aiError.message || 'Transient error occurred.'}`
      });
    }
    const aiResponseTime = Date.now() - aiStartTime;
    const { question: firstAIQuestion, usage, modelUsed } = aiResult;

    // 6. Calculate total questions count based on duration mapping
    const durationNum = Number(duration);
    const totalQuestions = DURATION_QUESTION_MAP[durationNum] || 15;

    // 7. Create InterviewSession record
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
        focusAreas: [],
        resumeEnabled: !!resumeEnabled,
        resumeRef,
        currentQuestionNumber: 1,
        currentQuestionId: firstQuestionId,
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

    // 8. Structured logging for model inspects and usage optimizations
    console.log('--- INTERVIEW SESSION START INITIATED ---');
    console.log(`Interview Session ID: ${session._id}`);
    console.log(`Current Question Number: 1`);
    console.log(`Resume Loaded: ${resumeLoaded}`);
    console.log(`Execution Time: ${executionTime}ms`);
    console.log(`AI Response Time: ${aiResponseTime}ms`);
    console.log(`AI Model Used: ${modelUsed}`);
    if (usage) {
      console.log(`Prompt Tokens: ${usage.promptTokens}`);
      console.log(`Completion Tokens: ${usage.completionTokens}`);
      console.log(`Total Tokens: ${usage.totalTokens}`);
    }
    console.log('-----------------------------------------');

    // 9. Return payload to frontend (maintain full compatibility)
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

/**
 * Handles submission of a candidate's answer to the current question,
 * evaluates it via Gemini, and returns either the next question or the completed interview results.
 * 
 * @route POST /api/interview/:interviewId/answer
 * @access Private
 */
export const submitAnswer = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { interviewId } = req.params;

    // 1. Validate Interview ID format
    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Interview ID format.'
      });
    }

    // 2. Validate payload body
    const validationError = validateAnswerRequest(req.body);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    // 3. Retrieve the interview session
    const session = await InterviewSession.findById(interviewId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.'
      });
    }

    // 4. Validate ownership
    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You do not own this interview session.'
      });
    }

    // 5. Validate status
    if (session.status !== 'IN_PROGRESS') {
      return res.status(400).json({
        success: false,
        message: 'This interview has already been completed or is not in progress.'
      });
    }

    // 6. Find the current question
    const currentQuestionIndex = session.conversationHistory.findIndex(
      q => q.questionId.toString() === session.currentQuestionId.toString()
    );
    const currentQuestion = session.conversationHistory[currentQuestionIndex];

    if (!currentQuestion) {
      return res.status(400).json({
        success: false,
        message: 'Current question could not be resolved from history.'
      });
    }

    if (currentQuestion.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'This question has already been answered or is not pending.'
      });
    }

    const sanitizedAnswer = String(req.body.answer).trim();

    // 7. Atomic Concurrency Lock: Mark the question as ANSWERED to prevent double submission
    const answerSubmittedTime = new Date();
    const timeTakenSeconds = Math.round(
      (answerSubmittedTime.getTime() - new Date(currentQuestion.questionAskedTime).getTime()) / 1000
    );
    const resolvedTimeTaken = timeTakenSeconds > 0 ? timeTakenSeconds : 0;

    const lockedSession = await InterviewSession.findOneAndUpdate(
      {
        _id: interviewId,
        status: 'IN_PROGRESS',
        currentQuestionId: session.currentQuestionId,
        'conversationHistory.questionId': session.currentQuestionId,
        'conversationHistory.status': 'PENDING'
      },
      {
        $set: {
          'conversationHistory.$.userAnswer': sanitizedAnswer,
          'conversationHistory.$.answerSubmittedTime': answerSubmittedTime,
          'conversationHistory.$.status': 'ANSWERED',
          'conversationHistory.$.timeTaken': resolvedTimeTaken
        }
      },
      { new: true }
    );

    if (!lockedSession) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate submission or invalid session state.'
      });
    }

    // 8. Load Resume Context if enabled
    let resumeContext = '';
    if (session.resumeEnabled && session.resumeRef) {
      try {
        const resume = await ResumeAnalysis.findById(session.resumeRef);
        if (resume) {
          resumeContext = buildResumeContext(resume);
        }
      } catch (resumeErr) {
        console.error('[DATABASE FAILURE] Failed to fetch resume context:', resumeErr.message);
      }
    }

    // 9. Format dialogue history prior to current question (limit to last 3 for long interviews to reduce token size)
    let conversationSlice = session.conversationHistory.slice(0, currentQuestionIndex);
    if (conversationSlice.length > 3) {
      conversationSlice = conversationSlice.slice(conversationSlice.length - 3);
    }
    const previousConversation = conversationSlice
      .map(q => `Interviewer: ${q.question}\nCandidate: ${q.userAnswer}`)
      .join('\n\n');

    // 10. Call AI Service for Evaluation & Next Question
    const aiStart = Date.now();
    let aiResult;
    try {
      aiResult = await evaluateInterviewAnswer({
        interviewType: session.interviewType,
        company: session.company,
        role: session.role,
        difficulty: session.difficulty,
        language: session.language,
        resumeContext,
        currentQuestion: currentQuestion.question,
        userAnswer: sanitizedAnswer,
        previousConversation,
        currentQuestionNumber: currentQuestion.questionNumber,
        totalQuestions: session.totalQuestions
      });
    } catch (aiErr) {
      console.error('[AI EVALUATION SERVICE FAILURE] Answer evaluation failed:', aiErr.message || aiErr);
      
      // Rollback atomic lock on failure so the user can re-submit
      await InterviewSession.findOneAndUpdate(
        {
          _id: interviewId,
          'conversationHistory.questionId': session.currentQuestionId
        },
        {
          $set: {
            'conversationHistory.$.status': 'PENDING',
            'conversationHistory.$.userAnswer': '',
            'conversationHistory.$.answerSubmittedTime': null,
            'conversationHistory.$.timeTaken': 0
          }
        }
      );

      const status = aiErr.status || 502;
      const message = aiErr.message || 'AI returned an invalid response.';
      return res.status(status).json({
        success: false,
        message
      });
    }

    const aiResponseTime = Date.now() - aiStart;

    // 11. Prepare Polished Evaluation Object (including percentageScore and metadata)
    const score = aiResult.evaluation.score;
    const percentageScore = score * 10;

    const evaluationData = {
      score,
      percentageScore,
      strengths: aiResult.evaluation.strengths,
      weaknesses: aiResult.evaluation.weaknesses,
      suggestions: aiResult.evaluation.suggestions,
      idealAnswer: aiResult.evaluation.idealAnswer,
      aiMetadata: {
        modelUsed: 'llama-3.3-70b-versatile',
        promptTokens: aiResult.usage?.promptTokens || 0,
        completionTokens: aiResult.usage?.completionTokens || 0,
        totalTokens: aiResult.usage?.totalTokens || 0,
        responseTime: aiResponseTime
      }
    };

    const cleanEvaluation = {
      score,
      percentageScore,
      strengths: aiResult.evaluation.strengths,
      weaknesses: aiResult.evaluation.weaknesses,
      suggestions: aiResult.evaluation.suggestions,
      idealAnswer: aiResult.evaluation.idealAnswer
    };

    // 12. Complete or continue mock interview session
    const isLastQuestion = currentQuestion.questionNumber >= session.totalQuestions;
    let finalSession;

    if (isLastQuestion) {
      // Complete interview session
      finalSession = await InterviewSession.findOneAndUpdate(
        {
          _id: interviewId,
          'conversationHistory.questionId': session.currentQuestionId
        },
        {
          $set: {
            status: 'COMPLETED',
            completedAt: new Date(),
            'conversationHistory.$.evaluation': evaluationData
          }
        },
        { new: true }
      );

      // --- GENERATE AND SAVE FINAL REPORT ON COMPLETION ---
      // Calculate Overall Score and Skills Sub-scores
      const historyList = finalSession.conversationHistory;
      const scores = historyList.map(q => q.evaluation?.score || 0);
      const totalScoreSum = scores.reduce((sum, val) => sum + val, 0);
      const averageScore = scores.length > 0 ? (totalScoreSum / scores.length) : 0;
      const overallScore = Math.round(averageScore * 10); // 0-100 percentage

      // Deterministic Skill Scores (0-100)
      const commScores = scores.filter((_, i) => i % 2 === 0);
      const techScores = scores.filter((_, i) => i % 2 === 1);
      
      const communicationScore = commScores.length > 0
        ? Math.round((commScores.reduce((sum, v) => sum + v, 0) / commScores.length) * 10)
        : overallScore;
      const technicalScore = techScores.length > 0
        ? Math.round((techScores.reduce((sum, v) => sum + v, 0) / techScores.length) * 10)
        : overallScore;
      const problemSolvingScore = overallScore;
      const confidenceScore = Math.round((communicationScore + technicalScore) / 2);

      // Determine readiness label
      const getReadinessLevel = (score) => {
        if (score < 50) return 'Needs Improvement';
        if (score < 70) return 'Developing';
        if (score < 80) return 'Interview Ready';
        if (score < 90) return 'Placement Ready';
        return 'Excellent Candidate';
      };
      const readinessLevel = getReadinessLevel(overallScore);
      const answeredQuestions = historyList.filter(q => q.status === 'ANSWERED').length;

      // Make a single lightweight AI call for final summary components
      let finalReport;
      try {
        const aiReport = await generateInterviewReport({
          interviewType: finalSession.interviewType,
          company: finalSession.company,
          role: finalSession.role,
          difficulty: finalSession.difficulty,
          resumeContext,
          conversationHistory: historyList,
          overallScore
        });

        finalReport = {
          overallScore,
          communicationScore,
          technicalScore,
          problemSolvingScore,
          confidenceScore,
          readinessLevel: aiReport.placementReadiness || readinessLevel,
          overallFeedback: aiReport.overallFeedback,
          strengths: aiReport.strengths || [],
          weaknesses: aiReport.weaknesses || [],
          recommendations: aiReport.recommendations || [],
          interviewSummary: aiReport.overallFeedback,
          careerAdvice: aiReport.careerAdvice,
          totalQuestions: finalSession.totalQuestions,
          answeredQuestions,
          averageScore,
          completedAt: new Date()
        };
      } catch (aiErr) {
        console.error('[AI REPORT GENERATION ERROR] falling back to programmatic collation:', aiErr.message);
        
        // Build fallback report in case Gemini is completely unavailable
        const allStrengths = Array.from(new Set(historyList.flatMap(q => q.evaluation?.strengths || []))).filter(Boolean);
        const allWeaknesses = Array.from(new Set(historyList.flatMap(q => q.evaluation?.weaknesses || []))).filter(Boolean);
        const allSuggestions = Array.from(new Set(historyList.flatMap(q => q.evaluation?.suggestions || []))).filter(Boolean);

        finalReport = {
          overallScore,
          communicationScore,
          technicalScore,
          problemSolvingScore,
          confidenceScore,
          readinessLevel,
          overallFeedback: `The candidate completed a ${finalSession.interviewType} interview for the ${finalSession.role} position at ${finalSession.company} with an overall accuracy of ${overallScore}%.`,
          strengths: allStrengths.length > 0 ? allStrengths.slice(0, 3) : ['Demonstrated clear domain comprehension.'],
          weaknesses: allWeaknesses.length > 0 ? allWeaknesses.slice(0, 2) : ['Could improve technical precision depth.'],
          recommendations: allSuggestions.length > 0 ? allSuggestions.slice(0, 3) : ['Review advanced concepts in key technologies and CS fundamentals.'],
          interviewSummary: `Completed ${answeredQuestions} out of ${finalSession.totalQuestions} questions.`,
          careerAdvice: `Practice more technical and behavioral questions focused on ${finalSession.interviewType} paradigms.`,
          totalQuestions: finalSession.totalQuestions,
          answeredQuestions,
          averageScore,
          completedAt: new Date()
        };
      }

      // Update document with final report details
      await InterviewSession.findByIdAndUpdate(interviewId, {
        $set: { report: finalReport }
      });

      const executionTime = Date.now() - startTime;
      const evaluationTime = executionTime - aiResponseTime;

      // Better Console Logs
      console.log('================================');
      console.log(`Interview ID: ${session._id}`);
      console.log(`Question Number: ${currentQuestion.questionNumber}`);
      console.log(`Score: ${score}`);
      console.log(`AI Model: llama-3.3-70b-versatile`);
      console.log(`Prompt Tokens: ${aiResult.usage?.promptTokens || 0}`);
      console.log(`Completion Tokens: ${aiResult.usage?.completionTokens || 0}`);
      console.log(`Total Tokens: ${aiResult.usage?.totalTokens || 0}`);
      console.log(`Response Time: ${aiResponseTime}ms`);
      console.log(`Execution Time: ${executionTime}ms`);
      console.log('================================');

      return res.status(200).json({
        success: true,
        evaluation: cleanEvaluation,
        currentQuestionNumber: finalSession.totalQuestions,
        totalQuestions: finalSession.totalQuestions,
        remainingQuestions: 0,
        progressPercentage: 100,
        interviewCompleted: true
      });
    } else {
      // Generate and append next question
      const nextQuestionId = new mongoose.Types.ObjectId();
      const nextQuestionObj = {
        questionNumber: currentQuestion.questionNumber + 1,
        questionId: nextQuestionId,
        question: aiResult.nextQuestion,
        questionAskedTime: new Date(),
        status: 'PENDING',
        evaluation: {
          score: 0,
          strengths: [],
          weaknesses: [],
          suggestions: [],
          idealAnswer: ''
        }
      };

      // First, atomically update the current question's evaluation object
      await InterviewSession.updateOne(
        {
          _id: interviewId,
          'conversationHistory.questionId': session.currentQuestionId
        },
        {
          $set: {
            'conversationHistory.$.evaluation': evaluationData
          }
        }
      );

      // Second, update session-level fields and append the next question in a single query
      finalSession = await InterviewSession.findByIdAndUpdate(
        interviewId,
        {
          $set: {
            currentQuestionNumber: currentQuestion.questionNumber + 1,
            currentQuestionId: nextQuestionId
          },
          $push: {
            conversationHistory: nextQuestionObj
          }
        },
        { new: true }
      );

      const executionTime = Date.now() - startTime;
      const evaluationTime = executionTime - aiResponseTime;

      // Better Console Logs
      console.log('================================');
      console.log(`Interview ID: ${session._id}`);
      console.log(`Question Number: ${currentQuestion.questionNumber}`);
      console.log(`Score: ${score}`);
      console.log(`AI Model: llama-3.3-70b-versatile`);
      console.log(`Prompt Tokens: ${aiResult.usage?.promptTokens || 0}`);
      console.log(`Completion Tokens: ${aiResult.usage?.completionTokens || 0}`);
      console.log(`Total Tokens: ${aiResult.usage?.totalTokens || 0}`);
      console.log(`Response Time: ${aiResponseTime}ms`);
      console.log(`Execution Time: ${executionTime}ms`);
      console.log('================================');

      return res.status(200).json({
        success: true,
        evaluation: cleanEvaluation,
        nextQuestion: aiResult.nextQuestion,
        questionNumber: finalSession.currentQuestionNumber, // backward compatibility
        currentQuestionNumber: finalSession.currentQuestionNumber,
        totalQuestions: finalSession.totalQuestions,
        remainingQuestions: finalSession.totalQuestions - (finalSession.currentQuestionNumber - 1),
        progressPercentage: Math.round(((finalSession.currentQuestionNumber - 1) / finalSession.totalQuestions) * 100),
        interviewCompleted: false
      });
    }

  } catch (error) {
    console.error('Unhandled internal error in submitAnswer controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error occurred while processing your answer.'
    });
  }
};

/**
 * Retrieves the compiled AI Interview Report for a completed session.
 * 
 * @route GET /api/interview/:interviewId/report
 * @access Private
 */
export const getInterviewReport = async (req, res, next) => {
  try {
    const { interviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Interview ID format.'
      });
    }

    const session = await InterviewSession.findById(interviewId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.'
      });
    }

    // Verify ownership
    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You do not own this interview session.'
      });
    }

    if (session.status === 'IN_PROGRESS') {
      // Gracefully complete the session early and generate the report!
      session.status = 'COMPLETED';
      session.completedAt = new Date();
      
      const historyList = session.conversationHistory;
      // Filter only answered questions for score calculations
      const answeredList = historyList.filter(q => q.status === 'ANSWERED');
      
      const scores = answeredList.map(q => q.evaluation?.score || 0);
      const totalScoreSum = scores.reduce((sum, val) => sum + val, 0);
      const averageScore = scores.length > 0 ? (totalScoreSum / scores.length) : 0;
      const overallScore = Math.round(averageScore * 10);

      const commScores = scores.filter((_, i) => i % 2 === 0);
      const techScores = scores.filter((_, i) => i % 2 === 1);
      
      const communicationScore = commScores.length > 0
        ? Math.round((commScores.reduce((sum, v) => sum + v, 0) / commScores.length) * 10)
        : overallScore;
      const technicalScore = techScores.length > 0
        ? Math.round((techScores.reduce((sum, v) => sum + v, 0) / techScores.length) * 10)
        : overallScore;
      const problemSolvingScore = overallScore;
      const confidenceScore = Math.round((communicationScore + technicalScore) / 2);

      const getReadinessLevel = (score) => {
        if (score < 50) return 'Needs Improvement';
        if (score < 70) return 'Developing';
        if (score < 80) return 'Interview Ready';
        if (score < 90) return 'Placement Ready';
        return 'Excellent Candidate';
      };
      const readinessLevel = getReadinessLevel(overallScore);
      const answeredQuestions = answeredList.length;

      let resumeContext = '';
      if (session.resumeEnabled && session.resumeRef) {
        try {
          const resume = await ResumeAnalysis.findById(session.resumeRef);
          if (resume) {
            resumeContext = buildResumeContext(resume);
          }
        } catch (err) {}
      }

      let finalReport;
      try {
        const aiReport = await generateInterviewReport({
          interviewType: session.interviewType,
          company: session.company,
          role: session.role,
          difficulty: session.difficulty,
          resumeContext,
          conversationHistory: historyList,
          overallScore
        });

        finalReport = {
          overallScore,
          communicationScore,
          technicalScore,
          problemSolvingScore,
          confidenceScore,
          readinessLevel: aiReport.placementReadiness || readinessLevel,
          overallFeedback: aiReport.overallFeedback,
          strengths: aiReport.strengths || [],
          weaknesses: aiReport.weaknesses || [],
          recommendations: aiReport.recommendations || [],
          interviewSummary: aiReport.overallFeedback,
          careerAdvice: aiReport.careerAdvice,
          totalQuestions: session.totalQuestions,
          answeredQuestions,
          averageScore,
          completedAt: new Date()
        };
      } catch (aiErr) {
        const allStrengths = Array.from(new Set(answeredList.flatMap(q => q.evaluation?.strengths || []))).filter(Boolean);
        const allWeaknesses = Array.from(new Set(answeredList.flatMap(q => q.evaluation?.weaknesses || []))).filter(Boolean);
        const allSuggestions = Array.from(new Set(answeredList.flatMap(q => q.evaluation?.suggestions || []))).filter(Boolean);

        finalReport = {
          overallScore,
          communicationScore,
          technicalScore,
          problemSolvingScore,
          confidenceScore,
          readinessLevel,
          overallFeedback: `The candidate completed a partial ${session.interviewType} interview for the ${session.role} position at ${session.company}.`,
          strengths: allStrengths.length > 0 ? allStrengths.slice(0, 3) : ['Demonstrated clear domain comprehension.'],
          weaknesses: allWeaknesses.length > 0 ? allWeaknesses.slice(0, 2) : ['Could improve technical precision depth.'],
          recommendations: allSuggestions.length > 0 ? allSuggestions.slice(0, 3) : ['Review advanced concepts in key technologies and CS fundamentals.'],
          interviewSummary: `Completed ${answeredQuestions} out of ${session.totalQuestions} questions.`,
          careerAdvice: `Practice more technical and behavioral questions focused on ${session.interviewType} paradigms.`,
          totalQuestions: session.totalQuestions,
          answeredQuestions,
          averageScore,
          completedAt: new Date()
        };
      }

      session.report = finalReport;
      await session.save();
    }

    if (session.status !== 'COMPLETED' || !session.report) {
      return res.status(400).json({
        success: false,
        message: 'Report is not available yet. Please complete the interview first.'
      });
    }

    // Map conversationHistory to questionsReviewed format expected by the frontend
    const questionsReviewed = session.conversationHistory
      .filter(q => q.status === 'ANSWERED' || (q.evaluation && q.evaluation.score > 0))
      .map(q => ({
        question: q.question,
        answer: q.userAnswer,
        ideal: q.evaluation?.idealAnswer || 'No ideal answer details returned.',
        score: q.evaluation?.percentageScore || (q.evaluation?.score * 10) || 0,
        feedback: q.evaluation?.suggestions?.join(' ') || 'No feedback suggestions.',
        strengths: q.evaluation?.strengths || [],
        weaknesses: q.evaluation?.weaknesses || []
      }));

    return res.status(200).json({
      success: true,
      report: {
        ...session.report.toObject(),
        questionsReviewed
      }
    });
  } catch (error) {
    console.error('Error in getInterviewReport controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error occurred while retrieving report.'
    });
  }
};

/**
 * Retrieves the paginated interview history for the authenticated user.
 * 
 * @route GET /api/interview/history
 * @access Private
 */
export const getInterviewHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };

    const total = await InterviewSession.countDocuments(query);
    const sessions = await InterviewSession.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const history = sessions.map(session => {
      const durationText = `${session.duration} Min`;
      return {
        id: session._id,
        category: session.interviewType,
        company: session.company,
        role: session.role,
        difficulty: session.difficulty,
        score: session.report ? session.report.overallScore : 0,
        date: session.completedAt
          ? new Date(session.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : new Date(session.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        duration: durationText,
        status: session.status === 'COMPLETED'
          ? (session.report && session.report.overallScore >= 80 ? 'Completed' : 'Needs Practice')
          : session.status,
        resumeEnabled: session.resumeEnabled,
        hasReport: !!session.report
      };
    });

    const interviewPracticeStreak = await calculateInterviewStreak(req.user._id);

    return res.status(200).json({
      success: true,
      interviewPracticeStreak,
      history,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getInterviewHistory controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error occurred while retrieving history.'
    });
  }
};

/**
 * Deletes a specific interview session and its report.
 * 
 * @route DELETE /api/interview/:interviewId
 * @access Private
 */
export const deleteInterviewSession = async (req, res, next) => {
  try {
    const { interviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Interview ID format.'
      });
    }

    const session = await InterviewSession.findOne({ _id: interviewId });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.'
      });
    }

    // Verify ownership
    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You do not own this interview session.'
      });
    }

    await InterviewSession.findByIdAndDelete(interviewId);

    return res.status(200).json({
      success: true,
      message: 'Interview report deleted successfully.'
    });
  } catch (error) {
    console.error('Error in deleteInterviewSession controller:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to delete interview report: ${error.message}`
    });
  }
};
