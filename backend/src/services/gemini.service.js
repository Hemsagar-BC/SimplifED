// Google Gemini API service - All AI-powered features for EchoNotes
// Features:
//   1. simplifyText - Convert academic text to simple English (no jargon)
//   2. generateStepByStep - Break down complex concepts into steps
//   3. generateClarityNotes - Explain difficult terms with examples
//   4. extractKeyPoints - Identify main concepts and definitions
//   5. generateSummary - Create concise lecture summary
// Model: gemini-1.5-flash for speed and cost-efficiency
// All responses optimized for dyslexic readers (short sentences, clear language)

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Simplify academic text to simple English suitable for dyslexic students
 * @param {string} text - Original lecture text (academic language)
 * @returns {Promise<string>} Simplified version with no jargon
 */
async function simplifyText(text) {
  // Prompt optimized for dyslexia-friendly output
  // Rules: short sentences (max 15 words), common words, active voice
  const prompt = `You are an expert at making academic content accessible for students with dyslexia.

Simplify this lecture text using these STRICT rules:
1. Use sentences of maximum 15 words
2. Replace complex words with simple everyday alternatives
3. Use active voice, not passive
4. Break long paragraphs into 2-3 sentence chunks
5. Explain any technical terms in parentheses
6. Use "you" to make it personal and engaging
7. NO jargon or academic language

Original text:
${text}

Simplified version:`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('❌ Error simplifying text:', error);
    throw new Error('Failed to simplify text');
  }
}

/**
 * Generate step-by-step explanation of a concept
 * @param {string} concept - Complex concept or topic to explain
 * @returns {Promise<string>} Step-by-step breakdown
 */
async function generateStepByStep(concept) {
  // Create numbered steps with clear progression
  const prompt = `Break down this concept into a simple step-by-step explanation for students with dyslexia.

Rules:
1. Use numbered steps (Step 1, Step 2, etc.)
2. Each step should be ONE simple action or idea
3. Maximum 15 words per sentence
4. Use everyday language, no jargon
5. Include a simple example if helpful
6. Make it visual and concrete

Concept to explain:
${concept}

Step-by-step explanation:`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('❌ Error generating step-by-step:', error);
    throw new Error('Failed to generate step-by-step explanation');
  }
}

/**
 * Generate clarity notes for difficult terms or concepts
 * Creates simple definitions with real-world examples
 * @param {string} text - Text containing terms that need clarification
 * @returns {Promise<Array>} Array of clarity notes: [{term, definition, example}]
 */
async function generateClarityNotes(text) {
  // Identify jargon and create side notes
  const prompt = `Identify difficult terms or concepts in this text and create clarity notes for students.

For each difficult term, provide:
1. Simple definition (max 20 words)
2. Real-world example or analogy
3. Why it matters (1 sentence)

Format as JSON array:
[
  {
    "term": "the difficult word or phrase",
    "definition": "simple explanation",
    "example": "real-world example",
    "whyItMatters": "why students should know this"
  }
]

Text to analyze:
${text}

Clarity notes (JSON only, no other text):`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonText = response.text().trim();
    
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const clarityNotes = JSON.parse(jsonText);
    return clarityNotes;
  } catch (error) {
    console.error('❌ Error generating clarity notes:', error);
    // Return empty array instead of failing
    return [];
  }
}

/**
 * Extract key points and main concepts from lecture segment
 * @param {string} text - Lecture segment text
 * @returns {Promise<Array<string>>} Array of key points (short phrases)
 */
async function extractKeyPoints(text) {
  // Identify main ideas as bullet points
  const prompt = `Extract the key points from this lecture segment.

Rules:
1. Each key point should be 5-10 words maximum
2. Focus on main ideas, definitions, and important facts
3. Use simple language
4. Return as a simple list, one per line
5. Maximum 5 key points

Lecture text:
${text}

Key points (one per line):`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Split by newlines and filter empty lines
    const keyPoints = text
      .split('\n')
      .map(line => line.replace(/^[-•*]\s*/, '').trim())
      .filter(line => line.length > 0);
    
    return keyPoints;
  } catch (error) {
    console.error('❌ Error extracting key points:', error);
    return [];
  }
}

/**
 * Generate overall summary of lecture segment
 * @param {string} text - Lecture text to summarize
 * @returns {Promise<string>} Concise summary (3-5 sentences)
 */
async function generateSummary(text) {
  // Create brief summary
  const prompt = `Create a brief summary of this lecture segment for students with dyslexia.

Rules:
1. 3-5 sentences maximum
2. Each sentence max 15 words
3. Capture the main message only
4. Use simple, clear language
5. Make it engaging and encouraging

Lecture text:
${text}

Summary:`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('❌ Error generating summary:', error);
    throw new Error('Failed to generate summary');
  }
}

/**
 * Process complete segment with all AI features at once
 * @param {string} text - Raw transcribed text
 * @returns {Promise<object>} All processed data: {simplified, stepByStep, clarityNotes, keyPoints, summary}
 */
async function processSegment(text) {
  try {
    console.log('🤖 Processing segment with Gemini...');
    
    // Run all AI processing in parallel for speed
    const [simplified, clarityNotes, keyPoints, summary] = await Promise.all([
      simplifyText(text),
      generateClarityNotes(text),
      extractKeyPoints(text),
      generateSummary(text)
    ]);
    
    // Generate step-by-step only if segment has concepts worth explaining
    // Check if text has technical terms or complex ideas
    let stepByStep = null;
    if (text.length > 100 && (text.includes('process') || text.includes('concept') || text.includes('theory'))) {
      stepByStep = await generateStepByStep(text);
    }
    
    console.log('✅ Segment processing complete');
    
    return {
      simplified,
      stepByStep,
      clarityNotes,
      keyPoints,
      summary,
      processedAt: new Date()
    };
  } catch (error) {
    console.error('❌ Error processing segment:', error);
    throw error;
  }
}

module.exports = {
  simplifyText,
  generateStepByStep,
  generateClarityNotes,
  extractKeyPoints,
  generateSummary,
  processSegment  // All-in-one function
};