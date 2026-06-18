import { GoogleGenerativeAI } from '@google/generative-ai';

const isRetryableError = (error) => {
  const message = error.message || '';
  const status = error.status || error.statusCode;
  if (status === 429 || status === 500 || status === 502 || status === 503 || status === 504) return true;
  const retryableStrings = [
    '429', 'RESOURCE_EXHAUSTED', '500', 'Internal Server Error', '502', 'Bad Gateway', '503', 'Service Unavailable',
    '504', 'Gateway Timeout', 'experiencing high demand', 'overloaded', 'rate limit',
    'quota exceeded', 'socket hang up', 'ECONNRESET', 'ETIMEDOUT'
  ];
  return retryableStrings.some(str => message.toLowerCase().includes(str.toLowerCase()));
};

const cleanJsonResponseText = (text) => {
  if (!text) return '';
  let cleaned = text.trim();
  const regex = /^\s*```(?:json)?\s*([\s\S]*?)\s*```\s*$/;
  const match = cleaned.match(regex);
  if (match) {
    cleaned = match[1].trim();
  }
  return cleaned;
};

const retryWithBackoff = async (fn, maxAttempts = 3, delaySequence = [0, 2000, 4000]) => {
  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt++;
    try {
      return await fn(attempt);
    } catch (error) {
      const isRetryable = isRetryableError(error);
      if (!isRetryable || attempt >= maxAttempts) {
        throw error;
      }
      const delay = delaySequence[attempt];
      console.warn(`[GEMINI INTERVIEW] Attempt ${attempt} failed: ${error.message || error}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Generates the first interview question using the Gemini model.
 * 
 * @param {Object} params - Config attributes
 * @returns {Promise<Object>} Object containing the question text and token usage metadata
 */
export const generateFirstQuestion = async ({
  interviewType,
  company,
  role,
  difficulty,
  language,
  focusAreas,
  resumeContext
}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in the environment variables');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 500
    }
  });

  const systemPrompt = `You are a professional, senior corporate interviewer conducting a mock placement interview.
Your role is to simulate a realistic interview experience.
Generate ONLY the very first question of the mock interview. Do not ask multiple questions. Do not evaluate any answers. Do not provide feedback.
Make the question feel natural, engaging, and directly tailored to the candidate.

Priority Order for Contextualization:
1. Candidate Resume Profile Context (if provided below)
2. Target Job Role: ${role}
3. Target Company: ${company}
4. Difficulty: ${difficulty}
5. Focus Areas / Concepts: ${focusAreas && focusAreas.length > 0 ? focusAreas.join(', ') : 'Role Core Concepts'}
6. Spoken Language: ${language}

Strict Behavioral Directives:
${resumeContext ? `[Resume Context Available]
- Focus heavily on the candidate's actual projects, internships, experience, technologies used, architecture decisions, and problem-solving scenarios mentioned in the resume context.
- Formulate a natural, specific, recruiter-style first question that queries one of their projects or work experience (e.g. "I noticed you built [Project] using [Tech]. Can you explain its backend architecture?" or "In your role as [Role] at [Company], how did you handle [Task]?").
- Prefer project-based and experience-based questions over generic interview questions.
- AVOID generic opening prompts such as "Tell me about yourself" or "Walk me through your resume".
- Never output things like "According to your resume" or "Your ATS score is...". Speak as if you are directly starting the interview conversation.` : `[No Resume Context Available]
- Formulate a strong, role-specific first question tailored for a ${role} interview at ${company}.
- You may start with a brief, professional opening matching the role/company tone (e.g. "Welcome! Let's start with your background and what motivated you to apply for the ${role} role...").`}

- Creative & Unique: Never ask the same generic template question repeatedly. Vary your choice of topic, technology, or scenario.
- Single Question: Return exactly one question.
- Format: Return ONLY the text message of the question itself. Do not use any markdown formatting (such as code blocks \`\`\` or bold asterisks **), JSON structures, or explanation text.
- Language: The question must be generated in ${language}. If Mixed, use a professional blend of English and Hindi. If Hindi, write the question in Hindi. If English, write in professional English.

${resumeContext ? `Candidate Resume Context:
${resumeContext}` : ''}`;

  console.log(`[GEMINI INTERVIEW] Requesting first question for Type: ${interviewType}, Role: ${role}, Company: ${company}`);

  const result = await retryWithBackoff(async (attempt) => {
    return await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        }
      ]
    });
  });

  let question = result.response.text().trim();
  
  // Clean any accidental markdown wraps
  if (question.startsWith('```')) {
    question = question.replace(/^\s*```(?:[a-zA-Z]+)?\s*/, '').replace(/\s*```\s*$/, '').trim();
  }

  // Get token usage metadata from the response
  const usage = result.response.usageMetadata || {};
  const promptTokens = usage.promptTokenCount || 0;
  const completionTokens = usage.candidatesTokenCount || 0;
  const totalTokens = usage.totalTokenCount || 0;

  return {
    question,
    usage: {
      promptTokens,
      completionTokens,
      totalTokens
    },
    modelUsed: 'gemini-2.5-flash'
  };
};

/**
 * Evaluates candidate's response to an interview question and generates the next question if the interview is not completed.
 * 
 * @param {Object} params - Context attributes
 * @returns {Promise<Object>} Object containing evaluation and nextQuestion, plus usage metadata
 */
export const evaluateInterviewAnswer = async ({
  interviewType,
  company,
  role,
  difficulty,
  language,
  resumeContext,
  currentQuestion,
  userAnswer,
  previousConversation,
  currentQuestionNumber,
  totalQuestions
}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in the environment variables');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'object',
        properties: {
          evaluation: {
            type: 'object',
            properties: {
              score: { type: 'number' },
              strengths: { type: 'array', items: { type: 'string' } },
              weaknesses: { type: 'array', items: { type: 'string' } },
              suggestions: { type: 'array', items: { type: 'string' } },
              idealAnswer: { type: 'string' }
            },
            required: ['score', 'strengths', 'weaknesses', 'suggestions', 'idealAnswer']
          },
          nextQuestion: { type: 'string' }
        },
        required: ['evaluation', 'nextQuestion']
      },
      temperature: 0.7,
      maxOutputTokens: 2048
    }
  });

  const prompt = `You are a professional, senior corporate interviewer conducting a mock placement interview.
Your role is to simulate a realistic, high-quality interview experience. Behave like an experienced corporate interviewer.

Candidate/Interview Context:
- Interview Type: ${interviewType}
- Target Company: ${company}
- Target Job Role: ${role}
- Difficulty Level: ${difficulty}
- Language: ${language} (Evaluate the answer and generate the next question in this language. If Mixed, use a professional blend of English and Hindi. If Hindi, use Hindi. If English, use English.)
${resumeContext ? `- Candidate Resume Context:\n${resumeContext}\n` : ''}

Interview Progress:
- Current Question Number: ${currentQuestionNumber} of ${totalQuestions}
- Total Questions: ${totalQuestions}

Conversation History so far:
${previousConversation || 'No previous conversation (this is the first question evaluation).'}

Current Question Asked:
"${currentQuestion}"

Candidate's Answer:
"${userAnswer}"

Strict Interviewer Guidelines:
1. Behave like an experienced recruiter: Make the interview feel dynamic, interactive, and conversational.
2. Follow-up and Adapt: Use the candidate's previous answer to guide your next question. Ask natural, context-aware follow-up questions rather than jumping randomly between topics.
3. Adapt Difficulty: 
   - If the candidate performed well on the current question, progress to a more advanced concept to test their limits.
   - If the candidate performed poorly (e.g., low score, struggled with details), ask another question on the same concept/topic from a different angle or with more guidance to see if they can recover.
4. Avoid Redundancy: Never repeat previous questions or ask highly similar questions already discussed in the Conversation History.
5. Prevent Generic Questions: Avoid generic "textbook" questions. Make questions specific to the role, company, and projects if resume context is available.
6. Progression: Keep the conversation moving forward; never restart the conversation or say things like "Let's start the interview...".
7. Final Question Rule: If this is the final question (Current Question Number ${currentQuestionNumber} matches Total Questions ${totalQuestions}), set the 'nextQuestion' field to an empty string (""). Do not generate another question.

You must return a JSON object conforming exactly to the schema:
{
  "evaluation": {
    "score": number,
    "strengths": ["string", ...],
    "weaknesses": ["string", ...],
    "suggestions": ["string", ...],
    "idealAnswer": "string"
  },
  "nextQuestion": "string"
}

Strictly follow these rules:
- Return ONLY the JSON object conforming to the schema. No markdown wrapping, no code blocks, no additional explanation text.
- Do NOT include markdown styling inside the JSON keys or values.
- Ensure the JSON is completely valid.
- The evaluation must be fair, constructive, and highly professional.`;

  const runApiCall = async () => {
    return await retryWithBackoff(async (attempt) => {
      console.log(`[GEMINI INTERVIEW] Evaluating answer, Attempt: ${attempt}`);
      const response = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ]
      });
      return response;
    });
  };

  let result;
  let parsed;
  let attemptCount = 0;
  let rawText = '';
  
  while (attemptCount < 2) {
    attemptCount++;
    const startTime = Date.now();
    try {
      result = await runApiCall();
      rawText = result.response.text();
      const cleaned = cleanJsonResponseText(rawText);
      parsed = JSON.parse(cleaned);

      // JSON Validation check
      const score = parsed.evaluation?.score;
      const strengths = parsed.evaluation?.strengths;
      const weaknesses = parsed.evaluation?.weaknesses;
      const suggestions = parsed.evaluation?.suggestions;
      const idealAnswer = parsed.evaluation?.idealAnswer;
      const nextQuestion = parsed.nextQuestion;

      const isFinal = Number(currentQuestionNumber) >= Number(totalQuestions);

      const isValid = 
        parsed &&
        typeof parsed === 'object' &&
        parsed.evaluation &&
        typeof parsed.evaluation === 'object' &&
        typeof score === 'number' &&
        score >= 1 &&
        score <= 10 &&
        Array.isArray(strengths) &&
        strengths.every(s => typeof s === 'string') &&
        Array.isArray(weaknesses) &&
        weaknesses.every(w => typeof w === 'string') &&
        Array.isArray(suggestions) &&
        suggestions.every(s => typeof s === 'string') &&
        typeof idealAnswer === 'string' &&
        idealAnswer.trim() !== '' &&
        typeof nextQuestion === 'string' &&
        (isFinal ? nextQuestion === '' : nextQuestion.trim() !== '');

      if (!isValid) {
        throw new Error('Gemini response JSON does not conform to the expected schema or validation constraints.');
      }
      
      const usage = result.response.usageMetadata || {};
      parsed.usage = {
        promptTokens: usage.promptTokenCount || 0,
        completionTokens: usage.candidatesTokenCount || 0,
        totalTokens: usage.totalTokenCount || 0
      };
      parsed.responseTime = Date.now() - startTime;
      
      return parsed;
    } catch (err) {
      console.error(`[GEMINI INTERVIEW EVALUATION] Attempt ${attemptCount} failed parsing/validating JSON:`, err.message);
      console.error('RAW GEMINI RESPONSE WAS:', rawText);
      if (attemptCount >= 2) {
        const customErr = new Error('AI returned an invalid response.');
        customErr.status = 502;
        throw customErr;
      }
      console.warn(`[GEMINI INTERVIEW EVALUATION] Malformed response, retrying JSON validation once...`);
    }
  }
};
