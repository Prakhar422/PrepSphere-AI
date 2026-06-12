import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Clean potential markdown wrappers from Gemini response string.
 * Handles cases where the model returns JSON inside markdown code blocks.
 * 
 * @param {string} text 
 * @returns {string}
 */
const cleanJsonResponseText = (text) => {
  if (!text) return '';
  let cleaned = text.trim();
  
  // Remove markdown code blocks if present
  const regex = /^\s*```(?:json)?\s*([\s\S]*?)\s*```\s*$/;
  const match = cleaned.match(regex);
  if (match) {
    cleaned = match[1].trim();
  }
  return cleaned;
};

/**
 * Validate that the parsed JSON conforms to the required QuizBank questions schema.
 * 
 * @param {any} data 
 * @param {string} expectedCategory
 * @param {string} expectedDifficulty
 * @returns {boolean}
 */
const validateQuizJson = (data, expectedCategory, expectedDifficulty) => {
  if (!data || typeof data !== 'object') return false;

  if (data.category !== expectedCategory || data.difficulty !== expectedDifficulty) {
    console.warn(`[GEMINI QUIZ] Validation failed: Category or difficulty mismatch. Expected category: "${expectedCategory}", difficulty: "${expectedDifficulty}". Got category: "${data.category}", difficulty: "${data.difficulty}".`);
    return false;
  }

  if (!Array.isArray(data.questions) || data.questions.length !== 10) {
    console.warn('[GEMINI QUIZ] Validation failed: Questions list is not an array of exactly 10 items.');
    return false;
  }

  for (let i = 0; i < data.questions.length; i++) {
    const q = data.questions[i];
    if (!q.question || typeof q.question !== 'string') {
      console.warn(`[GEMINI QUIZ] Validation failed: Question at index ${i} is missing text.`);
      return false;
    }

    if (!Array.isArray(q.options) || q.options.length !== 4) {
      console.warn(`[GEMINI QUIZ] Validation failed: Question at index ${i} must have exactly 4 options.`);
      return false;
    }

    const keys = q.options.map(opt => opt.key);
    const uniqueKeys = new Set(keys);
    if (uniqueKeys.size !== 4 || !['A', 'B', 'C', 'D'].every(k => uniqueKeys.has(k))) {
      console.warn(`[GEMINI QUIZ] Validation failed: Question at index ${i} must contain exactly one option for A, B, C, and D.`);
      return false;
    }

    for (const opt of q.options) {
      if (!opt.text || typeof opt.text !== 'string') {
        console.warn(`[GEMINI QUIZ] Validation failed: Option text is missing or invalid for option "${opt.key}" in question at index ${i}.`);
        return false;
      }
    }

    if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
      console.warn(`[GEMINI QUIZ] Validation failed: Question at index ${i} has invalid correct answer "${q.correctAnswer}".`);
      return false;
    }

    if (!q.explanation || typeof q.explanation !== 'string') {
      console.warn(`[GEMINI QUIZ] Validation failed: Explanation is missing for question at index ${i}.`);
      return false;
    }
  }

  return true;
};

/**
 * Determine if a Gemini error is a temporary server error suitable for retries (500, 502, 503, 504).
 * 
 * @param {any} error 
 * @returns {boolean}
 */
const isTemporaryServerError = (error) => {
  const status = error.status || error.statusCode;
  if (status === 500 || status === 502 || status === 503 || status === 504) {
    return true;
  }

  const msg = (error.message || '').toLowerCase();
  const serverErrorIndicators = [
    '500',
    '502',
    '503',
    '504',
    'service unavailable',
    'gateway timeout',
    'bad gateway',
    'internal server error',
    'overloaded',
    'experiencing high demand'
  ];

  return serverErrorIndicators.some(indicator => msg.includes(indicator));
};

/**
 * AI-powered quiz generation using Gemini.
 * 
 * @param {string} category - Requested quiz category
 * @param {string} difficulty - Requested quiz difficulty
 * @returns {Promise<object>} Parsed and validated quiz data object
 */
export const generateQuizWithGemini = async (category, difficulty) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in the environment variables.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.75,
      maxOutputTokens: 4096
    }
  });

  const prompt = `You are a Senior Technical Recruiter and Aptitude Assessment Creator.
Generate a brand-new, highly realistic campus placement mock assessment quiz with exactly 10 questions for the category "${category}" and difficulty level "${difficulty}".

Instructions:
1. Generate completely fresh, creative and unique questions. Do NOT repeat common textbook, standard repository, or internet interview questions.
2. Avoid repeating previously generated question structures, templates, or styles.
3. The questions must be realistic campus placement questions matching assessments from top-tier technology and consulting companies.
4. Strictly maintain the requested category: "${category}".
5. Strictly maintain the requested difficulty level: "${difficulty}". Ensure the difficulty is balanced evenly across all 10 questions in the quiz.
6. Avoid any duplicate or highly similar questions within the same quiz. Every question must test a different sub-topic or concept.
7. Return only valid JSON matching the format below. Do NOT wrap the JSON in markdown code blocks or fences. Do NOT include any explanations, preamble, or conversational text outside the JSON.

Return ONLY valid RFC8259 JSON in exactly this structure.

{
  "category": "${category}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "question": "Question text here",
      "options": [
        {
          "key": "A",
          "text": "Option A text"
        },
        {
          "key": "B",
          "text": "Option B text"
        },
        {
          "key": "C",
          "text": "Option C text"
        },
        {
          "key": "D",
          "text": "Option D text"
        }
      ],
      "correctAnswer": "A",
      "explanation": "Explanation of why this answer is correct must be under 30 words.."
    }
  ]
}

Rules:
- The questions array MUST contain exactly 10 question objects.
- Return ONLY the JSON object.
- Do NOT include markdown.
- Do NOT include code fences.
- Do NOT include comments.
- Do NOT include trailing commas.
- Do NOT include any explanation before or after the JSON.`;

  const maxRetries = 3;
  const backoffDelays = [1000, 2000, 4000]; // 1s, 2s, 4s delays
  let attempt = 0;

  while (true) {
    const startTime = Date.now();
    try {
      console.log(`[GEMINI REQUEST] Category: "${category}", Difficulty: "${difficulty}", Source: "Gemini", Retry number: ${attempt}`);
      
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ]
      });

      const rawResponse = result.response.text();

console.log("\n================ RAW GEMINI RESPONSE ================\n");
console.log(rawResponse);
console.log("\n=====================================================\n");

const cleanedResponse = cleanJsonResponseText(rawResponse);

console.log("\n================ CLEANED RESPONSE ================\n");
console.log(cleanedResponse);
console.log("\n==================================================\n");

let parsedData;

try {
    parsedData = JSON.parse(cleanedResponse);
} catch (parseError) {
    console.error("JSON Parse Error:", parseError);
    throw parseError;
}

      if (!validateQuizJson(parsedData, category, difficulty)) {
        throw new Error('Generated quiz response JSON failed internal schema validation checks.');
      }

      const elapsed = Date.now() - startTime;
      console.log(`[GEMINI SUCCESS] Category: "${category}", Difficulty: "${difficulty}", Source: "Gemini", Retry number: ${attempt}, Response status: 200, Execution time: ${elapsed}ms`);
      
      return parsedData;

    } catch (error) {
      const elapsed = Date.now() - startTime;
      const status = error.status || error.statusCode || 500;
      
      console.error(`[GEMINI ERROR] Category: "${category}", Difficulty: "${difficulty}", Source: "Gemini", Retry number: ${attempt}, Response status: ${status}, Execution time: ${elapsed}ms`);
      console.error('Complete Stack Trace:', error.stack || error);

      // Retry only for temporary server errors (500, 502, 503, 504)
      if (attempt < maxRetries && isTemporaryServerError(error)) {
        const delay = backoffDelays[attempt];
        attempt++;
        console.warn(`[GEMINI RETRY] Retrying in ${delay}ms... (Attempt ${attempt} of ${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
};
