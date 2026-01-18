import { LanguageInfo, TargetLanguage } from '@/types/translator';

export const ALL_LANGUAGES: Record<string, LanguageInfo> = {
  en: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    voiceId: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_EN,
  },
  fr: {
    code: 'fr',
    name: 'French',
    flag: '🇫🇷',
    voiceId: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_FR,
  },
  es: {
    code: 'es',
    name: 'Spanish',
    flag: '🇪🇸',
    voiceId: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_ES,
  },
  yo: {
    code: 'yo',
    name: 'Yoruba',
    flag: '🇳🇬',
    voiceId: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_YO,
  },
  rw: {
    code: 'rw',
    name: 'Kinyarwanda',
    flag: '🇷🇼',
    voiceId: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_RW,
  },
};

export const LANGUAGE_OPTIONS = Object.values(ALL_LANGUAGES);

// Legacy exports for backward compatibility
export const SOURCE_LANGUAGE = ALL_LANGUAGES.en;
export const TARGET_LANGUAGES: Record<TargetLanguage, LanguageInfo> = {
  fr: ALL_LANGUAGES.fr,
  es: ALL_LANGUAGES.es,
  yo: ALL_LANGUAGES.yo,
  rw: ALL_LANGUAGES.rw,
  en: ALL_LANGUAGES.en,
};
export const TARGET_LANGUAGE_OPTIONS = Object.values(TARGET_LANGUAGES);

export const MAX_RECORDING_DURATION = 60000; // 60 seconds
export const AUDIO_SAMPLE_RATE = 16000; // 16kHz for STT
export const AUDIO_CHUNK_SIZE = 4096;
