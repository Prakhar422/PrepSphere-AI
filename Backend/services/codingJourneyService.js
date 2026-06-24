
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

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 30000);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeout);

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
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      console.error('[TIMEOUT ERROR] Groq API question generation timed out.');
      throw new Error('AI question generation timed out. Please try again.');
    }
    console.error('[GROQ SERVICE ERROR] generateAIQuestion failure:', error.message || error);
    throw error;
  }
};

/**
 * Service to evaluate a candidate's DSA coding submission using the Groq API.
 * Performs AI code review, complexity assessment, edge case checking, and optimized solution generation.
 *
 * @param {Object} params - Evaluation parameters.
 * @param {string} params.title - Problem Title.
 * @param {string} params.description - Problem Description.
 * @param {string[]} params.constraints - Problem Constraints.
 * @param {Object[]} params.examples - Example test cases.
 * @param {string} params.expectedTimeComplexity - Expected time complexity.
 * @param {string} params.expectedSpaceComplexity - Expected space complexity.
 * @param {string} params.userCode - Solution code written by the user.
 * @param {string} params.language - Programming language used.
 * @param {string[]} [params.customTestCases] - Custom test cases provided by the user.
 * @returns {Promise<Object>} The evaluation report object matching the expected schema.
 */
export const evaluateSubmission = async ({
  title,
  description,
  constraints,
  examples,
  expectedTimeComplexity,
  expectedSpaceComplexity,
  userCode,
  language,
  customTestCases = []
}) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not defined in the environment variables. Please configure it in the .env file.');
  }

  const systemPrompt = `You are an expert technical interviewer and AI code reviewer at top tech firms.
Your task is to review the candidate's submitted code against the problem statement, expected complexities, constraints, examples, and any custom test case notes they supplied.
You will assess logic, correctness, potential edge cases, and algorithm efficiency. Since no real execution engine is attached, you will act as a static analysis reviewer to infer whether this solution would pass hidden tests.

Problem details:
- Title: ${title}
- Language: ${language}
- Expected Time Complexity: ${expectedTimeComplexity}
- Expected Space Complexity: ${expectedSpaceComplexity}

Problem Description:
${description}

Constraints:
${JSON.stringify(constraints, null, 2)}

Examples:
${JSON.stringify(examples, null, 2)}

Custom Test Case Notes:
${JSON.stringify(customTestCases, null, 2)}

Candidate Submitted Code:
\`\`\`${language.toLowerCase()}
${userCode}
\`\`\`

Evaluate the submission by checking correctness, edge cases (empty inputs, maximum values, boundaries, overflow), and efficiency.
- If it is fully correct and optimal, assign status="passed" and score=100 (or close).
- If it is mostly correct but inefficient or has minor flaws, assign status="partial" and score 50-89.
- If it has major logical bugs, syntax errors, or is completely wrong, assign status="failed" and score < 50.

You must return a single JSON object. Do not output any markdown formatting, code block backticks (e.g. \`\`\`json), explanations, or preamble. Return ONLY raw JSON matching this schema:
{
  "status": "passed" | "partial" | "failed",
  "score": 0..100, // Integer score between 0 and 100
  "confidence": 0..100, // Integer representing your confidence in this review (e.g. 90)
  "feedback": "Detailed, constructive feedback review explaining what works, what doesn't, syntax errors, and suggestions.",
  "strengths": ["Strength 1 (e.g. Clean pointer usage)", "Strength 2"],
  "improvements": ["Improvement 1 (e.g. Optimize space complexity)", "Improvement 2"],
  "edgeCasesCovered": ["Edge case 1 (e.g. Negative values handled)", "Edge case 2"],
  "potentialFailingCases": ["Failing case 1 (e.g. Large inputs timeout)", "Failing case 2"],
  "optimalSolution": "The full code implementation of the optimal solution in ${language}.",
  "timeComplexity": "Actual time complexity of the user's code (e.g., O(N^2))",
  "spaceComplexity": "Actual space complexity of the user's code (e.g., O(1))",
  "testCasesPassed": 0..50, // Estimated number of test cases passed (integer, e.g. 24)
  "totalTestCases": 15..50 // Estimated total test cases (integer, usually between 15 and 30)
}

Ensure all arrays and fields are populated. The status value must be strictly one of: "passed", "partial", "failed".`;

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
    temperature: 0.1,
    max_tokens: 3000
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 30000);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error('[GROQ EVALUATION SERVICE ERROR] HTTP Error response:', errText);
      throw new Error(`Groq API returned HTTP status ${response.status}: ${errText || 'Unknown error'}`);
    }

    const responseData = await response.json();
    if (!responseData.choices || responseData.choices.length === 0) {
      throw new Error('Empty response choices from Groq API.');
    }

    const rawJsonText = responseData.choices[0].message.content.trim();
    let evaluationResult;

    try {
      evaluationResult = JSON.parse(rawJsonText);
    } catch (parseError) {
      console.error('[GROQ EVALUATION SERVICE ERROR] JSON Parse failed. Raw response content:', rawJsonText);
      throw new Error('Groq AI generated an invalid JSON response structure.');
    }

    // 1. Sanitize status field to prevent invalid values in database enum. If status is invalid, default to 'failed'.
    let status = evaluationResult.status;
    if (!['passed', 'partial', 'failed'].includes(status)) {
      status = 'failed';
    }

    // 2. Sanitize numeric fields to fall within safe boundaries and parse integers.
    // score and confidence must be between 0 and 100.
    const score = Math.max(
      0,
      Math.min(100, Number(evaluationResult.score) || 0)
    );

    const confidence = Math.max(
      0,
      Math.min(100, Number(evaluationResult.confidence) || 0)
    );

    // testCasesPassed must be non-negative.
    const testCasesPassed = Math.max(
      0,
      parseInt(evaluationResult.testCasesPassed, 10) || 0
    );

    // totalTestCases must be greater than or equal to testCasesPassed.
    const totalTestCases = Math.max(
      testCasesPassed,
      parseInt(evaluationResult.totalTestCases, 10) || 0
    );

    // 3. Sanitize array fields to ensure they are arrays, defaulting to empty arrays if missing or invalid.
    const strengths = Array.isArray(evaluationResult.strengths) ? evaluationResult.strengths : [];
    const improvements = Array.isArray(evaluationResult.improvements) ? evaluationResult.improvements : [];
    const edgeCasesCovered = Array.isArray(evaluationResult.edgeCasesCovered) ? evaluationResult.edgeCasesCovered : [];
    const potentialFailingCases = Array.isArray(evaluationResult.potentialFailingCases) ? evaluationResult.potentialFailingCases : [];

    // 4. Sanitize string fields with safe defaults to prevent DB validation failure.
    const feedback = typeof evaluationResult.feedback === 'string' && evaluationResult.feedback.trim() !== '' 
      ? evaluationResult.feedback 
      : 'No feedback generated.';

    const optimalSolution = typeof evaluationResult.optimalSolution === 'string' 
      ? evaluationResult.optimalSolution 
      : '';

    const timeComplexity = typeof evaluationResult.timeComplexity === 'string' && evaluationResult.timeComplexity.trim() !== ''
      ? evaluationResult.timeComplexity 
      : 'Unknown';

    const spaceComplexity = typeof evaluationResult.spaceComplexity === 'string' && evaluationResult.spaceComplexity.trim() !== ''
      ? evaluationResult.spaceComplexity 
      : 'Unknown';

    // 5. Final validation return block to return a clean, fully-sanitized, production-safe object
    const sanitizedEvaluationResult = {
      status,
      score,
      confidence,
      feedback,
      strengths,
      improvements,
      edgeCasesCovered,
      potentialFailingCases,
      optimalSolution,
      timeComplexity,
      spaceComplexity,
      testCasesPassed,
      totalTestCases
    };

    return {
      ...sanitizedEvaluationResult
    };
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      console.error('[TIMEOUT ERROR] Groq API evaluation timed out.');
      throw new Error('AI evaluation timed out. Please try again.');
    }
    console.error('[GROQ EVALUATION SERVICE ERROR] evaluateSubmission failure:', error.message || error);
    throw error;
  }
};

