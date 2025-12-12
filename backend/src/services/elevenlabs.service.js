/**
 * ElevenLabs Text-to-Speech Service
 * 
 * Converts simplified lecture explanations into natural-sounding speech audio.
 * Uses ElevenLabs API with the "Rachel" voice (warm, clear, educational tone).
 * 
 * Free Tier Limits:
 * - 10,000 characters per month
 * - Up to 3 custom voices
 * - Standard quality audio
 * 
 * API Documentation: https://elevenlabs.io/docs/api-reference/text-to-speech
 * 
 * Required environment variables:
 * - ELEVENLABS_API_KEY: Your ElevenLabs API key
 * - ELEVENLABS_VOICE_ID: Voice ID (default: Rachel - 21m00Tcm4TlvDq8ikWAM)
 * 
 * Usage:
 * const tts = new ElevenLabsService(apiKey, voiceId);
 * const audioBuffer = await tts.textToSpeech("Hello world");
 */

const axios = require('axios');

class ElevenLabsService {
  constructor(apiKey, voiceId = null) {
    if (!apiKey) {
      throw new Error('ElevenLabs API key is required');
    }
    
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    
    // Default to Rachel voice - clear, warm, educational tone
    // Other good options:
    // - Bella: 21m00Tcm4TlvDq8ikWAM (friendly, young)
    // - Antoni: ErXwobaYiN019PkySvjV (male, professional)
    this.voiceId = voiceId || '21m00Tcm4TlvDq8ikWAM';
    
    // Free tier character limit
    this.monthlyCharLimit = 10000;
    
    console.log('✅ ElevenLabs TTS Service initialized');
  }

  /**
   * Convert text to speech and return audio buffer
   * 
   * @param {string} text - Text to convert (max 5000 chars per request)
   * @param {Object} options - Voice settings
   * @param {number} options.stability - Voice stability 0-1 (default: 0.5)
   * @param {number} options.similarity_boost - Clarity 0-1 (default: 0.75)
   * @returns {Promise<Object>} - Audio result with buffer and metadata
   * 
   * Voice Settings:
   * - stability: Higher = more consistent, Lower = more expressive
   * - similarity_boost: Higher = clearer but less natural
   * 
   * For educational content, we use:
   * - stability: 0.5 (balanced)
   * - similarity_boost: 0.75 (clear pronunciation)
   */
  async textToSpeech(text, options = {}) {
    try {
      // Validate text length
      if (!text || text.trim().length === 0) {
        throw new Error('Text cannot be empty');
      }
      
      // Truncate if exceeds limit (safety measure)
      const maxChars = 5000;
      const truncatedText = text.length > maxChars 
        ? text.substring(0, maxChars) 
        : text;
      
      // Default voice settings optimized for educational content
      const voiceSettings = {
        stability: options.stability || 0.5,
        similarity_boost: options.similarity_boost || 0.75,
        style: options.style || 0,           // 0 = neutral
        use_speaker_boost: true              // Enhance voice clarity
      };
      
      // Prepare API request
      const url = `${this.baseUrl}/text-to-speech/${this.voiceId}`;
      
      const requestBody = {
        text: truncatedText,
        model_id: 'eleven_monolingual_v1',  // Fast, high quality
        voice_settings: voiceSettings
      };
      
      const headers = {
        'Accept': 'audio/mpeg',              // MP3 format
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey
      };
      
      console.log(`🔊 Converting ${truncatedText.length} characters to speech...`);
      
      // Make API request
      const response = await axios.post(url, requestBody, {
        headers: headers,
        responseType: 'arraybuffer',         // Get audio as binary
        timeout: 30000                       // 30 second timeout
      });
      
      // Convert response to Buffer
      const audioBuffer = Buffer.from(response.data);
      
      console.log(`✅ Audio generated: ${audioBuffer.length} bytes`);
      
      return {
        audio: audioBuffer,
        format: 'audio/mpeg',
        size: audioBuffer.length,
        duration: this._estimateDuration(truncatedText),
        success: true
      };
      
    } catch (error) {
      console.error('❌ ElevenLabs TTS error:', error.response?.data || error.message);
      
      // Handle specific API errors
      if (error.response?.status === 401) {
        throw new Error('Invalid ElevenLabs API key');
      } else if (error.response?.status === 429) {
        throw new Error('ElevenLabs quota exceeded - try again next month');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid request - check text format');
      }
      
      throw new Error(`Text-to-speech failed: ${error.message}`);
    }
  }

  /**
   * Check remaining character quota for current month
   * 
   * @returns {Promise<Object>} - Quota information
   * 
   * Returns:
   * {
   *   character_count: number,      // Characters used this month
   *   character_limit: number,      // Total monthly limit
   *   remaining: number,            // Characters remaining
   *   can_extend: boolean,
   *   status: string
   * }
   */
  async getQuota() {
    try {
      const url = `${this.baseUrl}/user`;
      
      const response = await axios.get(url, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });
      
      const subscription = response.data.subscription;
      
      return {
        character_count: subscription.character_count,
        character_limit: subscription.character_limit,
        remaining: subscription.character_limit - subscription.character_count,
        can_extend: subscription.can_extend_character_limit,
        status: subscription.status
      };
      
    } catch (error) {
      console.error('❌ Quota check error:', error.message);
      throw new Error(`Failed to check quota: ${error.message}`);
    }
  }

  /**
   * Estimate audio duration based on text length
   * Average speaking rate: ~150 words per minute
   * 
   * @param {string} text - Input text
   * @returns {number} - Estimated duration in seconds
   */
  _estimateDuration(text) {
    const words = text.split(' ').length;
    const wordsPerMinute = 150;
    const minutes = words / wordsPerMinute;
    return Math.round(minutes * 60);
  }

  /**
   * Get list of available voices
   * Useful for letting users choose their preferred voice
   * 
   * @returns {Promise<Array>} - Array of voice objects
   */
  async getVoices() {
    try {
      const url = `${this.baseUrl}/voices`;
      
      const response = await axios.get(url, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });
      
      return response.data.voices.map(voice => ({
        voice_id: voice.voice_id,
        name: voice.name,
        category: voice.category,
        description: voice.description,
        preview_url: voice.preview_url
      }));
      
    } catch (error) {
      console.error('❌ Get voices error:', error.message);
      throw new Error(`Failed to get voices: ${error.message}`);
    }
  }

  /**
   * Check if text is within monthly quota
   * 
   * @param {string} text - Text to check
   * @returns {Promise<boolean>} - True if within quota
   */
  async canProcessText(text) {
    try {
      const quota = await this.getQuota();
      const textLength = text.length;
      
      return quota.remaining >= textLength;
    } catch (error) {
      console.error('⚠️ Quota check failed:', error.message);
      // If quota check fails, assume we can process (fail open)
      return true;
    }
  }
}

module.exports = ElevenLabsService;
