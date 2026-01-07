import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

if (!process.env.ELEVENLABS_API_KEY) {
  throw new Error('ELEVENLABS_API_KEY is not set in environment variables');
}

export const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// Voice ID mapping for each language
export const VOICE_IDS: Record<string, string> = {
  fr: process.env.ELEVENLABS_VOICE_ID_FR || 'Xb7hH8MSUJpSbSDYk0k2', // Default French voice
  es: process.env.ELEVENLABS_VOICE_ID_ES || 'GBv7mTt0atIp3Br8iCZE', // Default Spanish voice
  yo: process.env.ELEVENLABS_VOICE_ID_YO || 'pNInz6obpgDQGcFmaJgB', // Default Yoruba voice
  rw: process.env.ELEVENLABS_VOICE_ID_RW || 'nPczCjzI2devNBz1zQrb', // Default Kinyarwanda voice
};

export async function textToSpeech(
  text: string,
  languageCode: string
): Promise<Buffer> {
  const voiceId = VOICE_IDS[languageCode];

  if (!voiceId) {
    throw new Error(`No voice ID configured for language: ${languageCode}`);
  }

  const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
    text,
    modelId: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128',
  });

  // Convert ReadableStream to buffer
  const reader = audioStream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  return Buffer.concat(chunks);
}

export async function speechToText(_audioBuffer: Buffer): Promise<string> {
  // ElevenLabs STT API is not well-documented in the SDK
  // Using OpenAI Whisper is recommended for STT
  throw new Error(
    'Please use OpenAI Whisper for speech-to-text. Import from @/lib/openai instead.'
  );
}
