// Language types
export type SourceLanguage = 'en';
export type TargetLanguage = 'fr' | 'es' | 'yo' | 'rw';
export type Language = SourceLanguage | TargetLanguage;

// Language info
export interface LanguageInfo {
  code: Language;
  name: string;
  flag: string;
  voiceId?: string;
}

// Recording states
export type RecordingState = 'idle' | 'recording' | 'processing' | 'playing';

// Translation request/response
export interface TranslationRequest {
  text: string;
  source: SourceLanguage;
  target: TargetLanguage;
  style?: 'formal' | 'informal';
}

export interface TranslationResponse {
  translated: string;
  provider: string;
  latencyMs: number;
}

// TTS request
export interface TTSRequest {
  text: string;
  language: TargetLanguage;
  voiceId?: string;
}

// STT response
export interface STTEvent {
  type: 'partial' | 'final';
  text: string;
  timestamp: number;
}

// Transcript entry
export interface TranscriptEntry {
  id: string;
  sourceText: string;
  translatedText: string;
  targetLanguage: TargetLanguage;
  timestamp: number;
  audioUrl?: string;
}
