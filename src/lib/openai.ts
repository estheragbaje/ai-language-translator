import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function translateText(
  text: string,
  targetLanguage: string,
  style: 'formal' | 'informal' = 'formal'
): Promise<string> {
  const languageNames: Record<string, string> = {
    fr: 'French',
    es: 'Spanish',
    yo: 'Yoruba',
    rw: 'Kinyarwanda',
  };

  const targetLangName = languageNames[targetLanguage] || targetLanguage;
  const styleGuide =
    style === 'formal'
      ? 'formal and professional'
      : 'casual and conversational';

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a professional translator. Translate the given English text to ${targetLangName}. 
Use a ${styleGuide} tone. Maintain the original meaning and context. 
Return ONLY the translated text, without any explanations or additional commentary.`,
      },
      {
        role: 'user',
        content: text,
      },
    ],
    temperature: 0.3,
  });

  return completion.choices[0]?.message?.content?.trim() || '';
}

export async function speechToText(
  audioBuffer: Buffer,
  options: {
    language?: string;
    prompt?: string;
    temperature?: number;
  } = {}
): Promise<string> {
  try {
    const { language = 'en', prompt, temperature = 0 } = options;

    // Detect audio format from buffer signature
    const audioFormat = detectAudioFormat(audioBuffer);

    // Create a File object from the buffer with proper MIME type
    const audioFile = new File(
      [new Uint8Array(audioBuffer)],
      `audio.${audioFormat}`,
      {
        type: getMimeType(audioFormat),
      }
    );

    // Validate file size (max 25MB for Whisper)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (audioBuffer.length > maxSize) {
      throw new Error('Audio file too large. Maximum size is 25MB');
    }

    // Call OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language, // ISO-639-1 language code
      prompt, // Optional context to improve accuracy
      temperature, // 0-1, controls randomness
      response_format: 'json', // or 'text', 'srt', 'verbose_json', 'vtt'
    });

    return transcription.text.trim();
  } catch (error) {
    console.error('OpenAI Whisper error:', error);

    if (error instanceof Error) {
      // Provide more specific error messages
      if (error.message.includes('Invalid file format')) {
        throw new Error(
          'Unsupported audio format. Please use mp3, mp4, mpeg, mpga, m4a, wav, or webm'
        );
      }
      if (error.message.includes('rate limit')) {
        throw new Error('Rate limit exceeded. Please try again later');
      }
      if (error.message.includes('insufficient_quota')) {
        throw new Error('OpenAI API quota exceeded. Please check your billing');
      }
    }

    throw new Error('Speech-to-text conversion failed');
  }
}

// Helper function to detect audio format from buffer
function detectAudioFormat(buffer: Buffer): string {
  // Check magic numbers (file signatures)
  const header = buffer.slice(0, 12);

  // WebM: 1A 45 DF A3
  if (
    header[0] === 0x1a &&
    header[1] === 0x45 &&
    header[2] === 0xdf &&
    header[3] === 0xa3
  ) {
    return 'webm';
  }

  // WAV: 52 49 46 46 ... 57 41 56 45
  if (
    header[0] === 0x52 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x46 &&
    header[8] === 0x57 &&
    header[9] === 0x41 &&
    header[10] === 0x56 &&
    header[11] === 0x45
  ) {
    return 'wav';
  }

  // MP3: FF FB or FF F3 or FF F2 or ID3
  if (
    (header[0] === 0xff &&
      (header[1] === 0xfb || header[1] === 0xf3 || header[1] === 0xf2)) ||
    (header[0] === 0x49 && header[1] === 0x44 && header[2] === 0x33) // ID3
  ) {
    return 'mp3';
  }

  // M4A/MP4: ftyp
  if (header.slice(4, 8).toString() === 'ftyp') {
    return 'm4a';
  }

  // Default to webm (most common from browser MediaRecorder)
  return 'webm';
}

// Helper function to get MIME type from format
function getMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    webm: 'audio/webm',
    wav: 'audio/wav',
    mp3: 'audio/mpeg',
    mp4: 'audio/mp4',
    m4a: 'audio/m4a',
    mpeg: 'audio/mpeg',
    mpga: 'audio/mpeg',
  };

  return mimeTypes[format] || 'audio/webm';
}
