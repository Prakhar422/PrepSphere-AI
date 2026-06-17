import { GoogleGenerativeAI } from '@google/generative-ai';

const isRetryableError = (error) => {
  const message = error.message || '';
  const status = error.status || error.statusCode;
  if (status === 429 || status === 503) return true;
  const retryableStrings = [
    '429', 'RESOURCE_EXHAUSTED', '503', 'Service Unavailable',
    'experiencing high demand', 'overloaded', 'rate limit',
    'quota exceeded', 'socket hang up', 'ECONNRESET', 'ETIMEDOUT'
  ];
  return retryableStrings.some(str => message.toLowerCase().includes(str.toLowerCase()));
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
