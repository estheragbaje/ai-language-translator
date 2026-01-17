// Language types
export type Language = 'en' | 'fr' | 'es' | 'yo' | 'rw';
export type SourceLanguage = Language;
export type TargetLanguage = Language;

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

// History entry
export interface HistoryEntry {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: number;
}

// Bookmark entry
export interface BookmarkEntry {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  category?: string;
  note?: string;
  timestamp: number;
}

// Conversation message
export interface ConversationMessage {
  id: string;
  speaker: 'A' | 'B';
  text: string;
  translation: string;
  language: string;
  timestamp: number;
}
