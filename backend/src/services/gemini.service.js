/**
 * Gemini AI Service - Text Processing
 * 
 * Handles all AI text processing for dyslexic students:
 * 1. Generate summary (3-5 key points)
 * 2. Generate mind map (hierarchical structure)
 * 3. Simplify text (8th grade reading level for TTS)
 * 
 * Uses Google Gemini 1.5 Flash model
 * Optimized for educational content
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('❌ Gemini API key is required');
    }

    this.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 2048
      }
    });

    console.log('✅ Gemini Service initialized with model: gemini-1.5-flash');
  }

  /**
   * Generate a concise summary with key points
   * Optimized for dyslexic readers (simple language, bullets)
   */
  async generateSummary(transcript) {
    try {
      console.log('🔄 Generating summary...');
      
      // Truncate long transcripts
      const maxLength = 8000;
      const text = transcript.length > maxLength 
        ? transcript.substring(0, maxLength) + '...'
        : transcript;

      const prompt = `You are helping a student with dyslexia understand a lecture.

Create a summary with 3-5 bullet points from this lecture transcript.

Rules:
- Use simple, everyday words (8th grade level)
- Each bullet: maximum 15 words
- Start with a bullet point (•)
- Focus only on MAIN ideas
- Use active voice

Transcript:
${text}

Summary:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text().trim();

      console.log('✅ Summary generated');
      return summary;
    } catch (error) {
      console.error('❌ Summary generation error:', error.message);
      throw error;
    }
  }

  /**
   * Generate a mind map structure (JSON format)
   * Visual learning aid for dyslexic students
   */
  async generateMindMap(transcript) {
    try {
      console.log('🔄 Generating mind map...');

      const maxLength = 8000;
      const text = transcript.length > maxLength 
        ? transcript.substring(0, maxLength) + '...'
        : transcript;

      const prompt = `You are creating a mind map for a student with dyslexia.

Convert this lecture into a mind map structure.

Rules:
- Return ONLY valid JSON, no markdown
- Use simple labels (3-4 words max)
- 1 central topic + 3-5 main branches + 2-3 sub-branches each
- Easy to understand (8th grade level)
- Active phrases

JSON Format (EXACT):
{
  "title": "Central Topic",
  "branches": [
    {
      "label": "Main Branch 1",
      "children": ["Sub-point 1", "Sub-point 2"]
    },
    {
      "label": "Main Branch 2",
      "children": ["Sub-point 3"]
    }
  ]
}

Transcript:
${text}

Return ONLY the JSON:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let jsonText = response.text().trim();

      // Clean up markdown if present
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      const mindMap = JSON.parse(jsonText);

      console.log('✅ Mind map generated:', mindMap.title);
      return mindMap;
    } catch (error) {
      console.error('❌ Mind map generation error:', error.message);
      // Return fallback structure
      return {
        title: 'Lecture Overview',
        branches: [
          {
            label: 'Main Topics',
            children: ['Key concept 1', 'Key concept 2']
          }
        ]
      };
    }
  }

  /**
   * Simplify complex text for Text-to-Speech
   * 8th grade reading level, short sentences
   * This will be converted to speech by ElevenLabs
   */
  async simplifyText(transcript) {
    try {
      console.log('🔄 Simplifying text for speech...');

      const maxLength = 8000;
      const text = transcript.length > maxLength 
        ? transcript.substring(0, maxLength) + '...'
        : transcript;

      const prompt = `You are a patient teacher explaining to a student with dyslexia.

Explain the MAIN concept from this lecture in the simplest way possible.

Rules:
- 8th grade reading level (simple words everyone knows)
- Maximum 10 words per sentence
- Short paragraphs (2-3 sentences each)
- NO jargon or academic words
- Use active voice
- Include 1-2 simple examples
- Total: 150-250 words
- Make it conversational like talking to a friend

Transcript:
${text}

Return ONLY the simplified explanation:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const simplified = response.text().trim();

      // Limit for TTS (5000 chars max per request)
      const maxChars = 5000;
      const finalText = simplified.length > maxChars 
        ? simplified.substring(0, maxChars) 
        : simplified;

      console.log('✅ Text simplified for speech:', finalText.length, 'characters');
      return finalText;
    } catch (error) {
      console.error('❌ Text simplification error:', error.message);
      throw error;
    }
  }

  /**
   * Process all transformations in parallel
   * Returns: summary, mindMap, simplified text
   */
  async processAllTransformations(transcript) {
    try {
      console.log('\n🚀 Starting all AI transformations in parallel...\n');

      const startTime = Date.now();

      // Run all three operations simultaneously
      const [summary, mindMap, simplified] = await Promise.all([
        this.generateSummary(transcript),
        this.generateMindMap(transcript),
        this.simplifyText(transcript)
      ]);

      const duration = Date.now() - startTime;

      console.log(`\n✅ All transformations completed in ${duration}ms\n`);

      return {
        summary,
        mindMap,
        simplifiedText: simplified,
        duration,
        success: true
      };
    } catch (error) {
      console.error('❌ Error in processAllTransformations:', error.message);
      throw error;
    }
  }
}

module.exports = GeminiService;
