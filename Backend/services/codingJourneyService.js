
/**
 * Service to generate personalized DSA coding questions using the Groq API.
 * Uses a single request to return the complete question JSON.
 *
 * @param {Object} params - Generation parameters.
 * @param {string} params.company - Target company name.
 * @param {string} params.role - Target job role.
 * @param {string} params.difficulty - Question difficulty (Easy, Medium, Hard).
 * @param {string} params.topic - Question topic (e.g. Arrays, Strings).
 * @param {string} params.language - Targeted programming language (e.g. C++).
 * @param {string} params.ctc - Target CTC (e.g. "12 LPA").
 * @param {string[]} [params.excludeTitles] - List of question titles to exclude to prevent repeats.
 * @returns {Promise<Object>} The generated question object matching the required schema.
 */
export const generateAIQuestion = async ({ company, role, difficulty, topic, language, ctc, excludeTitles = [] }) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not defined in the environment variables. Please configure it in the .env file.');
  }

  // Construct exclusion guidance if excludeTitles is provided
  const exclusionText = excludeTitles.length > 0
    ? `Do NOT generate a question with any of the following titles: ${excludeTitles.map(t => `"${t}"`).join(', ')}. Keep the question unique.`
    : '';

  const systemPrompt = `You are a world-class DSA interviewer at top tech firms (like Google, Meta, Amazon).
Your task is to generate a premium, high-quality, and unique DSA coding interview question tailored to the candidate's preferences.
The question must resemble real coding platforms like LeetCode, GeeksforGeeks, and InterviewBit.

Parameters:
- Company: ${company}
- Target Role: ${role}
- Difficulty: ${difficulty}
- Topic: ${topic}
- Target Language: ${language}
- Target CTC: ${ctc}

${exclusionText}

You must return a single JSON object. Do not output any markdown formatting, code block backticks (e.g. \`\`\`json), explanations, or preamble. Return ONLY raw JSON matching this schema:
{
  "title": "Unique Question Title (camel-case or title-case, no trailing dots)",
  "difficulty": "${difficulty}",
  "topic": "${topic}",
  "tags": ["Tag1", "Tag2"], // relevant tags such as "Arrays", "Hash Table", "${company}", "${role}" etc.
  "description": "Clear and detailed problem description in LeetCode style. Introduce the problem, detail the rules, and define parameters.",
  "constraints": [
    "Constraint 1 (e.g., 1 <= nums.length <= 10^5)",
    "Constraint 2"
  ],
  "examples": [
    {
      "input": "First example input",
      "output": "First example output",
      "explanation": "Brief explanation of how input maps to output"
    },
    {
      "input": "Second example input",
      "output": "Second example output",
      "explanation": "Brief explanation"
    }
  ],
  "hints": [
    "Hint 1: Suggest a first step (e.g., hash map or pointer setup).",
    "Hint 2: Suggest a logic optimization.",
    "Hint 3: Suggest time/space complexity target."
  ],
  "expectedTimeComplexity": "O(N) or O(N log N) etc.",
  "expectedSpaceComplexity": "O(1) or O(N) etc."
}

Ensure the question is logically sound, constraints are realistic, and examples are mathematically/programmatically correct.`;

  const requestBody = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'user',
        content: systemPrompt
      }
    ],
    response_format: {
      type: 'json_object'
    },
    temperature: 0.2,
    max_tokens: 2000
  };

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[GROQ SERVICE ERROR] HTTP Error response:', errText);
      throw new Error(`Groq API returned HTTP status ${response.status}: ${errText || 'Unknown error'}`);
    }

    const responseData = await response.json();
    if (!responseData.choices || responseData.choices.length === 0) {
      throw new Error('Empty response choices from Groq API.');
    }

    const rawJsonText = responseData.choices[0].message.content.trim();
    let questionData;

    try {
      questionData = JSON.parse(rawJsonText);
    } catch (parseError) {
      console.error('[GROQ SERVICE ERROR] JSON Parse failed. Raw response content:', rawJsonText);
      throw new Error('Groq AI generated an invalid JSON response structure.');
    }

    // Validate top-level required fields existence
    const requiredFields = [
      'title', 'difficulty', 'topic', 'tags', 'description', 
      'constraints', 'examples', 'hints', 'expectedTimeComplexity', 'expectedSpaceComplexity'
    ];
    for (const field of requiredFields) {
      if (!(field in questionData)) {
        throw new Error("Invalid AI response format.");
      }
    }

    // Strict type checks
    if (
      typeof questionData.title !== 'string' ||
      typeof questionData.description !== 'string' ||
      typeof questionData.expectedTimeComplexity !== 'string' ||
      typeof questionData.expectedSpaceComplexity !== 'string' ||
      !Array.isArray(questionData.constraints) ||
      !Array.isArray(questionData.examples) ||
      !Array.isArray(questionData.hints) ||
      !Array.isArray(questionData.tags)
    ) {
      throw new Error("Invalid AI response format.");
    }

    // Validate examples structures
    const isValidExamples = questionData.examples.every(
      ex =>
        ex &&
        typeof ex.input === 'string' &&
        typeof ex.output === 'string'
    );

    if (!isValidExamples) {
      throw new Error("Invalid AI response format.");
    }

    return questionData;
  } catch (error) {
    console.error('[GROQ SERVICE ERROR] generateAIQuestion failure:', error.message || error);
    throw error;
  }
};
