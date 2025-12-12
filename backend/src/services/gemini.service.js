// Grok AI Service – handles all lecture processing prompts

const fetchFn = globalThis.fetch;

if (typeof fetchFn !== 'function') {
  throw new Error('? Fetch API is not available. Run the server on Node.js 18+ to call Grok.');
}

const apiKey = process.env.GROK_API_KEY;
if (!apiKey) {
  throw new Error('? GROK_API_KEY is not set in the backend .env file');
}

const GROK_API_URL = process.env.GROK_API_URL || 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL = process.env.GROK_MODEL || 'grok-beta';
const DEFAULT_SYSTEM_PROMPT = 'You are an assistive AI that helps teachers simplify lecture transcripts for neurodivergent students.';

console.log(`? Grok API key detected (length: ${apiKey.length})`);
console.log(`? Using Grok model: ${GROK_MODEL}`);

async function callGrok(prompt, { maxTokens = 600, temperature = 0.25, systemPrompt = DEFAULT_SYSTEM_PROMPT } = {}) {
  const payload = {
    model: GROK_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature,
    max_tokens: maxTokens
  };

  const response = await fetchFn(GROK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Grok API ${response.status}: ${rawText}`);
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (parseError) {
    throw new Error(`Invalid JSON from Grok: ${rawText}`);
  }

  const message = data?.choices?.[0]?.message?.content;
  if (!message) {
    throw new Error('Grok API returned an empty response');
  }

  return message.trim();
}

async function generateSimpleSummary(text) {
  const prompt = `Simplify this lecture text for students with dyslexia.

Rules:
- Use simple words (no jargon)
- Keep sentences under 15 words
- Use active voice
- Explain technical terms in parentheses

Text: ${text}

Simple summary:`;

  try {
    console.log('?? Generating simple summary with Grok...');
    const summary = await callGrok(prompt, { maxTokens: 350 });
    console.log('? Simple summary generated');
    return summary;
  } catch (error) {
    console.error('? Grok simple summary error:', error.message);
    return text;
  }
}

async function generateStepByStep(text) {
  const prompt = `Break down this lecture into simple numbered steps for students with dyslexia.

Rules:
- Start with "Step 1:", "Step 2:", etc.
- Each step is one clear idea
- Maximum 15 words per step
- Use simple language

Text: ${text}

Steps:`;

  try {
    console.log('?? Generating step-by-step with Grok...');
    const steps = await callGrok(prompt, { maxTokens: 400 });
    console.log('? Step-by-step generated');
    return steps;
  } catch (error) {
    console.error('? Grok step-by-step error:', error.message);
    return 'No steps available';
  }
}

async function generateSummary(text) {
  const prompt = `Create a brief summary of this lecture in 3-5 sentences.

Rules:
- Each sentence max 15 words
- Simple, clear language
- Focus on main message only

Text: ${text}

Summary:`;

  try {
    console.log('?? Generating lecture summary with Grok...');
    const summary = await callGrok(prompt, { maxTokens: 400 });
    console.log('? Summary generated');
    return summary;
  } catch (error) {
    console.error('? Grok summary error:', error.message);
    return text.substring(0, 200) + '...';
  }
}

async function generateMindMap(text) {
  const prompt = `Create a mind map structure from this lecture text.

Return ONLY valid JSON in this exact format:
{
  "mainTopic": "Main topic in 2-5 words",
  "branches": [
    {
      "label": "Branch name (2-4 words)",
      "children": ["Sub-point 1", "Sub-point 2"]
    }
  ]
}

Text: ${text}

JSON only:`;

  try {
    console.log('?? Generating mind map with Grok...');
    const rawJson = await callGrok(prompt, { maxTokens: 500, temperature: 0.15 });
    const cleaned = rawJson
      .replace(/```json\s*/gi, '')
      .replace(/```/g, '')
      .trim();

    const mindMap = JSON.parse(cleaned);

    if (!mindMap.mainTopic || !Array.isArray(mindMap.branches)) {
      throw new Error('Missing required fields in mind map JSON');
    }

    console.log('? Mind map generated:', mindMap.mainTopic);
    return mindMap;
  } catch (error) {
    console.error('? Grok mind map error:', error.message);
    return {
      mainTopic: 'Lecture Content',
      branches: []
    };
  }
}

async function processSegment(text) {
  console.log(`\n?? Processing text segment with Grok (${text.length} chars)...\n`);

  try {
    const [simpleSummary, stepByStepExplanation, summary, mindMap] = await Promise.all([
      generateSimpleSummary(text),
      generateStepByStep(text),
      generateSummary(text),
      generateMindMap(text)
    ]);

    console.log('\n? Grok processing complete\n');

    return {
      simpleSummary,
      stepByStepExplanation,
      summary,
      mindMap
    };
  } catch (error) {
    console.error('? Error in Grok processSegment:', error.message);
    throw error;
  }
}

module.exports = {
  processSegment
};
