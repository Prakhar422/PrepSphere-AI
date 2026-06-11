import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Clean potential markdown wrappers from Gemini response string.
 * This function handles cases where the model returns JSON inside markdown code blocks.
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
 * Validate that the parsed JSON conforms to the required ATS analysis schema.
 * 
 * @param {any} data 
 * @returns {boolean}
 */
const validateAnalysisJson = (data) => {
  if (!data || typeof data !== 'object') return false;

  // Basic check for required top-level keys
  const requiredKeys = [
    'atsAnalysis',
    'diagnostics',
    'placementReadiness',
    'improvementSuggestions',
    'missingKeywords',
    'sectionAnalysis',
    'overallReport'
  ];

  for (const key of requiredKeys) {
    if (!(key in data)) {
      console.warn(`[GEMINI] Validation failed: Missing key "${key}"`);
      return false;
    }
  }

  // Validate nested fields
  if (typeof data.atsAnalysis.score !== 'number' || typeof data.atsAnalysis.label !== 'string') {
    console.warn('[GEMINI] Validation failed: Invalid atsAnalysis structure');
    return false;
  }

  if (
    typeof data.diagnostics.skillsMatch !== 'number' ||
    typeof data.diagnostics.formatting !== 'number'
  ) {
    console.warn('[GEMINI] Validation failed: Invalid diagnostics scores');
    return false;
  }

  if (
    !Array.isArray(data.placementReadiness.stages) ||
    typeof data.placementReadiness.currentStage !== 'number'
  ) {
    console.warn('[GEMINI] Validation failed: Invalid placementReadiness stages or currentStage');
    return false;
  }

  if (!Array.isArray(data.improvementSuggestions) || !Array.isArray(data.missingKeywords)) {
    console.warn('[GEMINI] Validation failed: Suggestions or missing keywords is not an array');
    return false;
  }

  if (!Array.isArray(data.sectionAnalysis)) {
    console.warn('[GEMINI] Validation failed: sectionAnalysis is not an array');
    return false;
  }

  if (
    typeof data.overallReport.rating !== 'number' ||
    typeof data.overallReport.strengths !== 'string' ||
    typeof data.overallReport.weaknesses !== 'string' ||
    typeof data.overallReport.recruiterPerspective !== 'string' ||
    typeof data.overallReport.finalAdvice !== 'string'
  ) {
    console.warn('[GEMINI] Validation failed: Invalid overallReport structure');
    return false;
  }

  return true;
};

/**
 * Helper to determine if a Gemini error is transient and retryable.
 * 
 * @param {any} error 
 * @returns {boolean}
 */
const isRetryableError = (error) => {
  const message = error.message || '';
  const status = error.status || error.statusCode;

  // Retry on rate limit (429) or service unavailable (503)
  if (status === 429 || status === 503) {
    return true;
  }

  const retryableStrings = [
    '429',
    'RESOURCE_EXHAUSTED',
    '503',
    'Service Unavailable',
    'experiencing high demand',
    'overloaded',
    'rate limit',
    'quota exceeded',
    'socket hang up',
    'ECONNRESET',
    'ETIMEDOUT'
  ];

  return retryableStrings.some(str => message.toLowerCase().includes(str.toLowerCase()));
};

/**
 * Helper to execute a function with exponential backoff.
 * 
 * @param {Function} fn - The async function to execute.
 * @param {number} maxAttempts - Maximum attempts limit.
 * @param {number[]} delaySequence - Backoff delays sequence in ms.
 * @returns {Promise<any>}
 */
const retryWithBackoff = async (fn, maxAttempts = 4, delaySequence = [0, 2000, 4000, 8000]) => {
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
      console.warn(`[GEMINI] Attempt ${attempt} failed: ${error.message || error}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Service to analyze resume text using the Gemini 2.5 Flash model.
 * 
 * @param {string} extractedText - Cleaned plain text extracted from a resume file.
 * @returns {Promise<any>} Structured analysis object matching the expected schema.
 */
export const analyzeResumeWithGemini = async (extractedText) => {
  const startTime = Date.now();
  
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in the environment variables');
    }

    // 1. Limit and pre-process resume text
    let cleanedResume = (extractedText || '')
      .replace(/[ \t]+/g, ' ')       // Collapse multiple spaces
      .replace(/\n{3,}/g, '\n\n')    // Normalize excessive newlines
      .trim();
    
    const originalLength = cleanedResume.length;
    const maxChars = 15000;
    
    if (cleanedResume.length > maxChars) {
      cleanedResume = cleanedResume.slice(0, maxChars) + '\n[Truncated due to length limit]';
    }
    
    const truncatedLength = cleanedResume.length;

    // 2. Initialize client using lower temperature for high schema determinism
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
        maxOutputTokens: 4000
      }
    });

    // 3. Keep Prompt Concise
    const systemPrompt = `You are a Senior ATS (Applicant Tracking System) Engine and expert Technical Recruiter.
Analyze the provided resume text objectively and output a single valid JSON object matching the required schema.
Keep all generated suggestions, descriptions, and text fields concise and brief (maximum 2 sentences per text block) to avoid truncation and ensure fast processing.
Do NOT wrap the JSON in markdown code blocks. Do NOT include any explanations, preamble, or conversational text outside the JSON.

Required JSON Schema:
{
  "atsAnalysis": {
    "score": 85, // Number: 0 to 100 reflecting overall candidate alignment
    "label": "Excellent" // String: "Excellent", "Good", "Needs Improvement", or "Needs Optimization"
  },
  "diagnostics": {
    "title": "Diagnostics Rating",
    "description": "Short diagnostic summary string.",
    "skillsMatch": 80, // Number: 0 to 100
    "formatting": 90 // Number: 0 to 100
  },
  "documentSource": {
    "fileName": "",
    "fileSize": "",
    "cloudinaryUrl": ""
  },
  "placementReadiness": {
    "currentStage": 3, // Number: 1 (Foundation), 2 (Intermediate), 3 (Advanced), 4 (Placement Ready)
    "stages": [
      { "title": "Foundation Scope", "completed": true, "description": "Status text." },
      { "title": "Intermediate Matrix", "completed": true, "description": "Status text." },
      { "title": "Advanced ATS Align", "completed": true, "description": "Status text." },
      { "title": "Placement Ready", "completed": false, "description": "Status text." }
    ]
  },
  "improvementSuggestions": [
    { "title": "Concise suggestion", "priority": "HIGH", "description": "Detailed explanation." } // Priority: "HIGH", "MEDIUM", "LOW"
  ],
  "missingKeywords": [ "React", "Node.js" ], // Array of string keywords missing/underrepresented
  "sectionAnalysis": [
    { "section": "Education", "score": 90, "status": "Strong", "suggestions": "Detail..." }, // Allowed sections: "Education", "Projects", "Skills", "Experience", "Achievements", "Certifications"
    { "section": "Projects", "score": 80, "status": "Good", "suggestions": "Detail..." },
    { "section": "Experience", "score": 75, "status": "Needs Improvement", "suggestions": "Detail..." },
    { "section": "Skills", "score": 90, "status": "Strong", "suggestions": "Detail..." },
    { "section": "Achievements", "score": 80, "status": "Good", "suggestions": "Detail..." },
    { "section": "Certifications", "score": 85, "status": "Strong", "suggestions": "Detail..." }
  ],
  "overallReport": {
    "rating": 4.5, // Number: 1.0 to 5.0
    "strengths": "Detailed strengths description.",
    "weaknesses": "Detailed weaknesses description.",
    "recruiterPerspective": "Assessment of how a human recruiter views this profile.",
    "finalAdvice": "Final actionable advice to elevate candidate chances."
  }
}`;

    // 4. Call Gemini with backoff retry wrapper using separate role parts
    console.log(`[GEMINI] Dispatching request (Original Length: ${originalLength}, Truncated Length: ${truncatedLength})`);
    
    const result = await retryWithBackoff(async (attempt) => {
      if (attempt > 1) {
        console.log(`[GEMINI] Retrying API request... Attempt #${attempt}`);
      }
      return await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              { text: systemPrompt },
              { text: `Resume Content:\n${cleanedResume}` }
            ]
          }
        ]
      });
    });

    const rawResponse = result.response.text();
    const cleanedResponse = cleanJsonResponseText(rawResponse);
    
    let parsedData;
    try {
      parsedData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('[GEMINI] Error parsing response JSON:', parseError);
      console.error('[GEMINI] Raw response text was:', rawResponse);
      throw new Error('Malformed JSON response returned by the AI model.');
    }

    if (!validateAnalysisJson(parsedData)) {
      throw new Error('Gemini response JSON failed internal schema validation checks.');
    }

    const elapsed = Date.now() - startTime;
    console.log(`[GEMINI] Successful completion. Prompt size: ~${systemPrompt.length} chars. Execution time: ${elapsed}ms`);

    return parsedData;

  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`[GEMINI] Analysis failed after ${elapsed}ms:`, error);

    // Differentiate error types and throw clean descriptive errors
    const errorMsg = error.message || '';
    const status = error.status || error.statusCode;

    if (errorMsg.includes('API_KEY_INVALID') || (status === 400 && errorMsg.includes('API key'))) {
      throw new Error('Invalid Gemini API Key. Please verify your environment configuration.');
    }

    if (status === 429 || errorMsg.includes('429') || errorMsg.includes('quota exceeded') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('Gemini API Rate Limit exceeded. Please try again in a few moments.');
    }

    if (status === 503 || errorMsg.includes('503') || errorMsg.includes('high demand') || errorMsg.includes('overloaded') || errorMsg.includes('Service Unavailable')) {
      throw new Error('Gemini API is currently experiencing high demand. Please try again shortly.');
    }

    if (errorMsg.includes('Malformed JSON') || errorMsg.includes('failed internal schema validation')) {
      throw new Error(`Gemini generated an invalid response structure: ${errorMsg}`);
    }

    throw new Error(`Gemini AI service error: ${error.message || 'Unknown error occurred during analysis.'}`);
  }
};
