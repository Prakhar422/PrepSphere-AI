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
      console.warn(`Validation failed: Missing key "${key}"`);
      return false;
    }
  }

  // Validate nested fields
  if (typeof data.atsAnalysis.score !== 'number' || typeof data.atsAnalysis.label !== 'string') {
    console.warn('Validation failed: Invalid atsAnalysis structure');
    return false;
  }

  if (
    typeof data.diagnostics.skillsMatch !== 'number' ||
    typeof data.diagnostics.formatting !== 'number'
  ) {
    console.warn('Validation failed: Invalid diagnostics scores');
    return false;
  }

  if (
    !Array.isArray(data.placementReadiness.stages) ||
    typeof data.placementReadiness.currentStage !== 'number'
  ) {
    console.warn('Validation failed: Invalid placementReadiness stages or currentStage');
    return false;
  }

  if (!Array.isArray(data.improvementSuggestions) || !Array.isArray(data.missingKeywords)) {
    console.warn('Validation failed: Suggestions or missing keywords is not an array');
    return false;
  }

  if (!Array.isArray(data.sectionAnalysis)) {
    console.warn('Validation failed: sectionAnalysis is not an array');
    return false;
  }

  if (
    typeof data.overallReport.rating !== 'number' ||
    typeof data.overallReport.strengths !== 'string' ||
    typeof data.overallReport.weaknesses !== 'string' ||
    typeof data.overallReport.recruiterPerspective !== 'string' ||
    typeof data.overallReport.finalAdvice !== 'string'
  ) {
    console.warn('Validation failed: Invalid overallReport structure');
    return false;
  }

  return true;
};

/**
 * Service to analyze resume text using the Gemini 2.5 Flash model.
 * 
 * @param {string} extractedText - Cleaned plain text extracted from a resume file.
 * @returns {Promise<any>} Structured analysis object matching the expected schema.
 */
export const analyzeResumeWithGemini = async (extractedText) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Gemini API Key exists:", !!apiKey);
    console.log("Calling Gemini...");
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in the environment variables');
    }

    // Initialize the Gemini client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = `You are a Senior ATS (Applicant Tracking System) Engine and an expert Technical Recruiter.
Analyze the following resume text and provide a highly detailed, objective assessment.
The response must be valid JSON matching the exact schema specified below.
Do not write any markdown formatting, explanations, or code blocks.
Your output must be strictly the JSON object.

JSON Schema:
{
  "atsAnalysis": {
    "score": <number 0-100 reflecting overall match score>,
    "label": "<string: 'Excellent', 'Good', 'Needs Improvement', or 'Needs Optimization'>"
  },
  "diagnostics": {
    "title": "Diagnostics Rating",
    "description": "<string: brief summary of diagnostic rating of the layout and keyword optimization>",
    "skillsMatch": <number 0-100 reflecting skills align>,
    "formatting": <number 0-100 reflecting format compliance>
  },
  "documentSource": {
    "fileName": "",
    "fileSize": "",
    "cloudinaryUrl": ""
  },
  "placementReadiness": {
    "currentStage": <number 1-4: 1 for Foundation, 2 for Intermediate, 3 for Advanced, 4 for Placement Ready>,
    "stages": [
      {
        "title": "Foundation Scope",
        "completed": <boolean>,
        "description": "<string: description of foundation elements found or missing>"
      },
      {
        "title": "Intermediate Matrix",
        "completed": <boolean>,
        "description": "<string: description of intermediate items found or missing>"
      },
      {
        "title": "Advanced ATS Align",
        "completed": <boolean>,
        "description": "<string: description of advanced ATS alignments found or missing>"
      },
      {
        "title": "Placement Ready",
        "completed": <boolean>,
        "description": "<string: description of placement readiness criteria met or missing>"
      }
    ]
  },
  "improvementSuggestions": [
    {
      "title": "<string: concise suggestion title>",
      "priority": "<string: 'HIGH', 'MEDIUM', or 'LOW'>",
      "description": "<string: clear explanation and action items for the candidate>"
    }
  ],
  "missingKeywords": [
    <strings representing key tools, technologies, and concepts missing or underrepresented that are critical for premium placements>
  ],
  "sectionAnalysis": [
    {
      "section": "Education",
      "score": <number 0-100>,
      "status": "<string: 'Strong', 'Good', or 'Needs Improvement'>",
      "suggestions": "<string: specific feedback for this section>"
    },
    {
      "section": "Projects",
      "score": <number 0-100>,
      "status": "<string: 'Strong', 'Good', or 'Needs Improvement'>",
      "suggestions": "<string: specific feedback for this section>"
    },
    {
      "section": "Experience",
      "score": <number 0-100>,
      "status": "<string: 'Strong', 'Good', or 'Needs Improvement'>",
      "suggestions": "<string: specific feedback for this section>"
    },
    {
      "section": "Skills",
      "score": <number 0-100>,
      "status": "<string: 'Strong', 'Good', or 'Needs Improvement'>",
      "suggestions": "<string: specific feedback for this section>"
    },
    {
      "section": "Achievements",
      "score": <number 0-100>,
      "status": "<string: 'Strong', 'Good', or 'Needs Improvement'>",
      "suggestions": "<string: specific feedback for this section>"
    },
    {
      "section": "Certifications",
      "score": <number 0-100>,
      "status": "<string: 'Strong', 'Good', or 'Needs Improvement'>",
      "suggestions": "<string: specific feedback for this section>"
    }
  ],
  "overallReport": {
    "rating": <number 1.0-5.0 reflecting overall resume score>,
    "strengths": "<string: detailed discussion of top strengths>",
    "weaknesses": "<string: detailed discussion of primary weaknesses>",
    "recruiterPerspective": "<string: a quick assessment of how a real human recruiter views this candidate>",
    "finalAdvice": "<string: final actionable recommendation to elevate the candidate's chances>"
  }
}`;

    const prompt = `${systemPrompt}\n\nResume Extracted Text:\n${extractedText}`;

    // Request analysis with JSON enforcement
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    console.log("Gemini request completed");

    const rawText = result.response.text();
    const cleanedJsonText = cleanJsonResponseText(rawText);
    
    let parsedData;
    try {
      parsedData = JSON.parse(cleanedJsonText);
    } catch (parseError) {
      console.error('Error parsing Gemini JSON response:', parseError);
      console.error('Raw response text was:', rawText);
      throw new Error('Gemini model response was not valid JSON');
    }

    if (!validateAnalysisJson(parsedData)) {
      throw new Error('Gemini response JSON failed schema validation checks');
    }

    return parsedData;
  } catch (error) {
    console.error('Error in geminiService.js:', error);
    throw error;
  }
};
