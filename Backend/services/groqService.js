import Groq from 'groq-sdk';

const isRetryableError = (error) => {
  const status = error.status || error.statusCode || error.headers?.get?.('status');
  if (status === 401 || status === 403 || status === 400) return false;
  if (status === 429 || status === 500 || status === 502 || status === 503 || status === 504) return true;
  
  const message = error.message || '';
  const retryableStrings = [
    '500', 'Internal Server Error', '502', 'Bad Gateway', '503', 'Service Unavailable',
    '504', 'Gateway Timeout', 'experiencing high demand', 'overloaded', 'rate limit',
    'quota exceeded', 'socket hang up', 'ECONNRESET', 'ETIMEDOUT', 'timeout'
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
      const isRetry = isRetryableError(error);
      if (!isRetry || attempt >= maxAttempts) {
        throw error;
      }
      const delay = delaySequence[attempt];
      console.warn(`[GROQ INTERVIEW] Attempt ${attempt} failed: ${error.message || error}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

const executeGroqCompletion = async (prompt, maxTokens = 2048, temperature = 0.7) => {
  const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    const err = new Error('GROQ_API_KEY or VITE_GROQ_API_KEY is not defined in the environment variables');
    err.status = 401;
    throw err;
  }

  const groq = new Groq({ apiKey });

  const apiCall = async () => {
    return await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature,
      max_tokens: maxTokens
    }, {
      timeout: 30000 // 30 seconds timeout
    });
  };

  try {
    const completion = await retryWithBackoff(apiCall);
    if (!completion || !completion.choices || completion.choices.length === 0) {
      const err = new Error('Empty response choices from Groq API.');
      err.status = 502;
      throw err;
    }
    
    const content = completion.choices[0]?.message?.content;
    if (!content || !content.trim()) {
      const err = new Error('Groq API returned an empty completion content.');
      err.status = 502;
      throw err;
    }

    const usage = completion.usage || {};
    const promptTokens = usage.prompt_tokens || 0;
    const completionTokens = usage.completion_tokens || 0;
    const totalTokens = usage.total_tokens || 0;

    return {
      content,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens
      }
    };
  } catch (error) {
    const status = error.status || error.statusCode;
    
    if (status === 401) {
      const authErr = new Error('Invalid Groq API key configured. Please verify your credentials.');
      authErr.status = 401;
      throw authErr;
    } else if (status === 429) {
      const rateLimitErr = new Error('Groq API rate limit exceeded. Please try again in a few moments.');
      rateLimitErr.status = 429;
      throw rateLimitErr;
    } else if (error.name === 'APIConnectionTimeoutError' || error.message?.toLowerCase().includes('timeout') || error.message?.toLowerCase().includes('abort')) {
      const timeoutErr = new Error('Groq API request timed out. Please try again.');
      timeoutErr.status = 408;
      throw timeoutErr;
    } else {
      const generalErr = new Error(error.message || 'Groq API request failed.');
      generalErr.status = status || 502;
      throw generalErr;
    }
  }
};

/**
 * Generates the first interview question using the Groq model.
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
  resumeContext
}) => {
  const systemPrompt = `You are a professional, senior corporate interviewer conducting a mock placement interview.
Your role is to simulate a realistic interview experience.
Generate ONLY the very first question of the mock interview. Do not ask multiple questions. Do not evaluate any answers. Do not provide feedback.
Make the question feel natural, engaging, and directly tailored to the candidate.

Priority Order for Contextualization:
1. Candidate Resume Profile Context (if provided below)
2. Target Job Role: ${role}
3. Target Company: ${company}
4. Difficulty: ${difficulty}
5. Spoken Language: ${language}

Intelligent Coverage Rules:
- If Resume Mode is enabled (Resume Context is provided below), you MUST start the interview with a highly specific, recruiter-style question focused on the candidate's actual projects, internships, technologies, experience, or architectural decisions (e.g. "I noticed you built [Project] using [Tech]. Why did you choose that database architecture?" or "In your role as [Role] at [Company], how did you implement [Task]?"). Prefer project-specific questions over generic technical starters.
- If Resume Mode is disabled, start with a strong, role-specific technical question related to ${role} (e.g. for MERN stack: React/Node/Express/Mongo; for Frontend: React/JS/HTML/CSS; for Backend: Node/Databases/API/Security, etc.).
- Never start the interview with generic questions such as "Walk me through your resume" or "Tell me about yourself".
- Make sure the question matches the selected difficulty level (${difficulty}).
- Speak directly to the candidate as the interviewer. Never mention administrative parameters like "ATS score" or "According to your resume context".

- Creative & Unique: Never ask the same generic template question repeatedly. Vary your choice of topic, technology, or scenario.
- Single Question: Return exactly one question.
- Format: Return a JSON object conforming exactly to the response schema: {"question": "string"}. Do not use any markdown code block formatting (such as \`\`\`json) or explanation text outside the JSON.
- Language: The question must be generated in ${language}. If Mixed, use a professional blend of English and Hindi. If Hindi, write the question in Hindi. If English, write in professional English.

${resumeContext ? `Candidate Resume Context:
${resumeContext}` : ''}`;

  console.log(`[GROQ INTERVIEW] Requesting first question for Type: ${interviewType}, Role: ${role}, Company: ${company}`);

  const { content, usage } = await executeGroqCompletion(systemPrompt, 1000, 0.7);
  const cleaned = cleanJsonResponseText(content);
  const parsed = JSON.parse(cleaned);

  if (!parsed || typeof parsed !== 'object' || typeof parsed.question !== 'string' || !parsed.question.trim()) {
    throw new Error('Groq response JSON does not contain a valid question.');
  }

  const question = parsed.question.trim();

  return {
    question,
    usage,
    modelUsed: 'llama-3.3-70b-versatile'
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
  const historyText = previousConversation && previousConversation.length > 0
    ? previousConversation
    : 'No previous conversation history.';

  const isLastQuestion = Number(currentQuestionNumber) >= Number(totalQuestions);

  const prompt = `You are a professional, senior corporate interviewer and recruiter conducting a mock placement interview.
Your role is to evaluate the candidate's last answer, rate it, and generate the next question to progress the interview.

Candidate/Interview Context:
- Target Job Role: ${role}
- Target Company: ${company}
- Interview Type: ${interviewType}
- Difficulty: ${difficulty}
- Language: ${language}
${resumeContext ? `- Candidate Resume Context:\n${resumeContext}\n` : ''}

Current Progress:
- Current Question Number: ${currentQuestionNumber} of ${totalQuestions}
- Is Last Question: ${isLastQuestion ? 'Yes (No next question should be generated)' : 'No (Generate the next question based on coverage rules)'}

Previous Conversation History:
${historyText}

Last Question Asked: ${currentQuestion}
Candidate's Answer: ${userAnswer}

Intelligent Interview Coverage Rules:
Based on the Interview Type (${interviewType}), you must cover the appropriate topics dynamically.
1. "Technical" Type: Focus strictly on technical capabilities:
   - Candidate's Resume/Projects/Architecture (highest priority if resume is enabled).
   - Role-specific technical questions (e.g. key frameworks, languages, APIs, system design, databases appropriate for a ${role} position).
   - Core CS concepts (DSA, Object-Oriented Programming, Operating Systems, DBMS, and Networks).
2. "HR" Type: Focus strictly on behavioral and career/culture fit:
   - Behavioral questions (STAR method scenarios: teamwork, conflict resolution, leadership, problem solving).
   - HR fit questions (career goals, strengths/weaknesses, why they want to work at ${company}).
3. "Mixed" Type: A balanced blend of Technical, Core CS, Behavioral, and HR questions.
4. "System Design" Type: Focus on system architecture, database choices, scalability, APIs, performance, microservices, caching, and infrastructure.

Adaptive Difficulty & Flow Guidelines:
- Do NOT repeat questions that have already been asked or look too similar.
- Progressively increase difficulty and dive deeper if the candidate answers correctly and exhibits strong knowledge.
- If the candidate struggles, reduce difficulty slightly or test from a different angle before moving on.
- As the interview progresses, transition naturally between topics (e.g. starting with Resume projects -> moving to Role technicals -> Core CS -> and concluding with Behavioral/HR as appropriate for the type).
- Always match the overall tone of a senior corporate recruiter at ${company}. Keep questions realistic and challenging but professional.
- Speak directly to the candidate in the next question. Do not refer to parameters or state "based on your resume..." in the question itself.

Evaluation Rules:
1. Score: Rate the candidate's response to the last question on a scale from 1 (poor) to 10 (perfect).
2. Strengths: Identify 1-3 specific positive aspects of their answer.
3. Weaknesses: Identify 1-3 specific gaps or errors in their answer.
4. Suggestions: Provide clear, actionable advice on how they can improve their response.
5. Ideal Answer: Write a comprehensive, high-quality reference answer for the last question that demonstrates the standard expected at ${company} for a ${role} position.

Next Question Generation:
- If Is Last Question is "Yes", the 'nextQuestion' field MUST be an empty string ("").
- If Is Last Question is "No", you MUST generate the next single interview question in the 'nextQuestion' field. Keep it concise, professional, and in the language: ${language}.
  - If language is Mixed, use a professional blend of English and Hindi (Hinglish). If language is Hindi, use Hindi. If English, use English.

Response Format:
You must return a JSON object conforming exactly to the response schema:
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
Do not wrap in markdown or provide extra text.`;

  let attemptCount = 0;
  let rawText = '';
  
  while (attemptCount < 2) {
    attemptCount++;
    const startTime = Date.now();
    try {
      console.log(`[GROQ INTERVIEW] Evaluating answer, Attempt: ${attemptCount}`);
      const { content, usage } = await executeGroqCompletion(prompt, 2048, 0.7);
      rawText = content;
      const cleaned = cleanJsonResponseText(rawText);
      const parsed = JSON.parse(cleaned);

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
        throw new Error('Groq response JSON does not conform to the expected schema or validation constraints.');
      }
      
      parsed.usage = usage;
      parsed.responseTime = Date.now() - startTime;
      
      return parsed;
    } catch (err) {
      console.error(`[GROQ INTERVIEW EVALUATION] Attempt ${attemptCount} failed parsing/validating JSON:`, err.message);
      console.error('RAW GROQ RESPONSE WAS:', rawText);
      if (attemptCount >= 2) {
        const customErr = new Error(err.message || 'AI returned an invalid response.');
        customErr.status = err.status || 502;
        throw customErr;
      }
      console.warn(`[GROQ INTERVIEW EVALUATION] Malformed response, retrying JSON validation once...`);
    }
  }
};

/**
 * Generates a final interview report containing feedback summary, strengths, weaknesses,
 * placement readiness, and personalized career recommendations.
 * 
 * @param {Object} params - Dialogue data and user details
 * @returns {Promise<Object>} The compiled final report components from Groq
 */
export const generateInterviewReport = async ({
  interviewType,
  company,
  role,
  difficulty,
  resumeContext,
  conversationHistory,
  overallScore
}) => {
  const historyText = conversationHistory
    .map((q, idx) => {
      const evalText = q.evaluation
        ? `Score: ${q.evaluation.score}/10\nStrengths: ${q.evaluation.strengths.join(', ')}\nWeaknesses: ${q.evaluation.weaknesses.join(', ')}\nSuggestions: ${q.evaluation.suggestions.join(', ')}`
        : 'No evaluation details.';
      return `Question ${idx + 1}: ${q.question}\nCandidate Answer: ${q.userAnswer}\nEvaluation: ${evalText}`;
    })
    .join('\n\n');

  const prompt = `You are an expert corporate technical recruiter and placement officer.
Analyze the following mock placement interview dialogue, candidate responses, and individual question evaluations to write a cohesive final placement report.

Candidate/Interview Context:
- Target Job Role: ${role}
- Target Company: ${company}
- Interview Type: ${interviewType}
- Difficulty Level: ${difficulty}
- Combined Performance Score: ${overallScore}%
${resumeContext ? `- Candidate Resume Profile:\n${resumeContext}\n` : ''}

Full Dialogue History & Evaluations:
${historyText}

Strict Analysis Guidelines:
1. Synthesize all observations into a comprehensive, highly constructive "overallFeedback" summary block (150-250 words) evaluating speech precision, tech knowledge, and structure.
2. Formulate 2-4 primary recruiter-verified "strengths" demonstrated across the conversation.
3. Formulate 2-3 specific focus areas for improvement ("weaknesses").
4. List 3-4 specific preparation "recommendations" (next steps to take).
5. Map their "placementReadiness" classification. Choose exactly one from:
   - "Needs Improvement" (score < 50)
   - "Developing" (score 50-69)
   - "Interview Ready" (score 70-79)
   - "Placement Ready" (score 80-89)
   - "Excellent Candidate" (score >= 90)
6. Deliver tailored "careerAdvice" (100-150 words) targeting the role of ${role} at ${company}.

You must return a JSON object conforming exactly to the schema:
{
  "overallFeedback": "string",
  "strengths": ["string", ...],
  "weaknesses": ["string", ...],
  "recommendations": ["string", ...],
  "placementReadiness": "string",
  "careerAdvice": "string"
}

Strictly follow these rules:
- Return ONLY the JSON object. No explanation, no markdown wraps.`;

  console.log(`[GROQ REPORT] Requesting final placement summary for Session. Overall Score: ${overallScore}%`);

  const { content } = await executeGroqCompletion(prompt, 2048, 0.7);
  const cleaned = cleanJsonResponseText(content);
  return JSON.parse(cleaned);
};
