'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  Heading,
  HStack,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Toaster, toaster } from '@/components/ui/toaster';
import { LanguageSelector } from '@/components/translator/LanguageSelector';
import { RecordButton } from '@/components/translator/RecordButton';
import { TranscriptPanel } from '@/components/translator/TranscriptPanel';
import { TextTranslationInput } from '@/components/translator/TextTranslationInput';
import { AudioPlayer } from '@/components/translator/AudioPlayer';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { ALL_LANGUAGES, LANGUAGE_OPTIONS } from '@/lib/constants';

export default function Home() {
  const [sourceLanguage, setSourceLanguage] = useState<string[]>(['en']);
  const [targetLanguage, setTargetLanguage] = useState<string[]>(['fr']);
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const { state, duration, startRecording, stopRecording, reset } =
    useAudioRecorder({
      onRecordingComplete: async (blob) => {
        try {
          await handleVoiceTranslation(blob);
          // Reset recorder state after successful processing
          setTimeout(() => reset(), 100);
        } catch (error) {
          console.error('Voice translation error:', error);
          toaster.error({
            title: 'Error',
            description: 'Failed to process audio',
          });
          // Reset recorder state even on error
          setTimeout(() => reset(), 100);
        }
      },
    });

  const swapLanguages = () => {
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
    // Clear translations when swapping
    setSourceText('');
    setTranslatedText('');
  };

  const getAvailableTargetLanguages = () => {
    return LANGUAGE_OPTIONS.filter((lang) => lang.code !== sourceLanguage[0]);
  };

  const getAvailableSourceLanguages = () => {
    return LANGUAGE_OPTIONS.filter((lang) => lang.code !== targetLanguage[0]);
  };

  const handleVoiceTranslation = async (audioBlob: Blob) => {
    try {
      console.log('🎤 Starting STT with audio blob:', audioBlob.size, 'bytes');

      // Step 1: Convert speech to text
      const sttResponse = await fetch(
        `/api/stt/stream?language=${sourceLanguage[0]}`,
        {
          method: 'POST',
          body: audioBlob,
        }
      );

      console.log('📡 STT Response status:', sttResponse.status);

      if (!sttResponse.ok) {
        const errorData = await sttResponse
          .json()
          .catch(() => ({ error: 'Unknown error' }));
        console.error('❌ STT failed:', errorData);
        throw new Error(errorData.error || 'Speech-to-text failed');
      }

      const sttData = await sttResponse.json();
      console.log('✅ STT Success:', sttData);

      const { text: transcribedText } = sttData;

      if (!transcribedText || transcribedText.trim() === '') {
        throw new Error('No speech detected in the recording');
      }

      setSourceText(transcribedText);

      toaster.success({
        title: 'Transcription complete',
        description: transcribedText.substring(0, 50) + '...',
      });

      // Step 2: Translate the text
      await handleTranslateText(transcribedText);
    } catch (error) {
      console.error('❌ Voice translation error:', error);
      throw error;
    }
  };

  const handleTranslateText = async (text: string) => {
    setIsTranslating(true);
    setSourceText(text);

    try {
      // Call translation API
      const translationResponse = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          source: sourceLanguage[0],
          target: targetLanguage[0],
          style: 'formal',
        }),
      });

      if (!translationResponse.ok) {
        throw new Error('Translation failed');
      }

      const { translated, latencyMs } = await translationResponse.json();
      setTranslatedText(translated);

      // Generate audio for the translation
      await generateAudio(translated);

      toaster.success({
        title: 'Translation complete',
        description: `Translated to ${
          ALL_LANGUAGES[targetLanguage[0]]?.name || 'Unknown'
        } in ${latencyMs}ms`,
      });
    } catch (error) {
      toaster.error({
        title: 'Translation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      setIsTranslating(false);
    }
  };

  const generateAudio = async (text: string) => {
    try {
      const ttsResponse = await fetch('/api/tts/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language: targetLanguage[0],
        }),
      });

      if (!ttsResponse.ok) {
        throw new Error('Text-to-speech failed');
      }

      const audioBlob = await ttsResponse.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      // Auto-play the audio
      const audio = new Audio(url);
      audio.play().catch((error) => {
        console.error('Auto-play failed:', error);
        // Auto-play might be blocked by browser, that's okay
      });
    } catch (error) {
      console.error('TTS error:', error);
      // Don't throw - audio is optional
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toaster.success({
      title: 'Copied to clipboard',
    });
  };

  const handlePlayAudio = async () => {
    if (audioUrl) {
      // Audio already generated, just play it
      return;
    }

    if (!translatedText) {
      toaster.error({
        title: 'No translation',
        description: 'Please translate some text first',
      });
      return;
    }

    // Generate audio if not already available
    try {
      toaster.loading({
        title: 'Generating audio...',
        description: 'Creating speech from translation',
      });
      await generateAudio(translatedText);
    } catch (error) {
      toaster.error({
        title: 'Audio generation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const selectedLang = ALL_LANGUAGES[targetLanguage[0]] || ALL_LANGUAGES.fr;

  return (
    <Box minH="100vh" bg="bg.subtle">
      <Container maxW="container.xl" py={8}>
        <VStack gap={8} align="stretch">
          {/* Header */}
          <VStack gap={2} textAlign="center">
            <Heading size="4xl" fontWeight="bold">
              🌍 AI Voice Translator
            </Heading>
            <Text fontSize="lg" color="fg.muted">
              Translate between English, French, Spanish, Yoruba, and
              Kinyarwanda in real-time
            </Text>
          </VStack>

          {/* Language Selection */}
          <HStack gap={4} justify="center" align="end" flexWrap="wrap">
            <Box
              flex={{ base: '1', md: 'initial' }}
              minW={{ base: 'full', md: '200px' }}
            >
              <LanguageSelector
                label="From"
                value={sourceLanguage}
                options={getAvailableSourceLanguages()}
                onChange={setSourceLanguage}
                disabled={false}
              />
            </Box>
            <Button
              size="sm"
              variant="ghost"
              onClick={swapLanguages}
              aria-label="Swap languages"
              mb={{ base: 0, md: 2 }}
            >
              ⇄
            </Button>
            <Box
              flex={{ base: '1', md: 'initial' }}
              minW={{ base: 'full', md: '200px' }}
            >
              <LanguageSelector
                label="To"
                value={targetLanguage}
                options={getAvailableTargetLanguages()}
                onChange={setTargetLanguage}
              />
            </Box>
          </HStack>

          {/* Input Method Tabs */}
          <Tabs.Root defaultValue="voice" size="lg" variant="enclosed">
            <Tabs.List>
              <Tabs.Trigger value="voice">
                🎤 Voice
              </Tabs.Trigger>
              <Tabs.Trigger value="text">
                ⌨️ Text
              </Tabs.Trigger>
            </Tabs.List>

            {/* Voice Tab */}
            <Tabs.Content value="voice">
              <VStack gap={6} py={8} minH="200px">
                <RecordButton
                  state={state}
                  duration={duration}
                  onStart={startRecording}
                  onStop={stopRecording}
                />

                <Text fontSize="sm" color="fg.muted" minH="20px" textAlign="center">
                  {state === 'recording'
                    ? '🎙️ Recording... Speak clearly into your microphone'
                    : state === 'processing'
                    ? '⚙️ Processing your recording...'
                    : '\u00A0'}
                </Text>
              </VStack>
            </Tabs.Content>

            {/* Text Tab */}
            <Tabs.Content value="text">
              <Box py={8}>
                <TextTranslationInput
                  onTranslate={handleTranslateText}
                  isTranslating={isTranslating}
                  disabled={state === 'recording' || state === 'processing'}
                />
              </Box>
            </Tabs.Content>
          </Tabs.Root>

          {/* Transcripts */}
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} alignItems="stretch">
            <GridItem display="flex">
              <TranscriptPanel
                title="Original"
                text={sourceText}
                languageFlag={ALL_LANGUAGES[sourceLanguage[0]]?.flag || '🌐'}
                languageName={
                  ALL_LANGUAGES[sourceLanguage[0]]?.name || 'Unknown'
                }
                isLoading={state === 'processing' && !sourceText}
                showCopy={true}
                onCopy={() => handleCopyText(sourceText)}
                colorPalette="blue"
              />
            </GridItem>
            <GridItem display="flex">
              <TranscriptPanel
                title="Translation"
                text={translatedText}
                languageFlag={selectedLang.flag}
                languageName={selectedLang.name}
                isLoading={isTranslating}
                showCopy={true}
                showPlay={true}
                onCopy={() => handleCopyText(translatedText)}
                onPlay={handlePlayAudio}
                audioUrl={audioUrl}
                colorPalette="green"
              />
            </GridItem>
          </Grid>

          {/* Footer */}
          <VStack
            gap={2}
            pt={8}
            borderTopWidth="1px"
            borderColor="border.default"
          >
            <Text fontSize="sm" color="fg.muted" textAlign="center">
              Powered by ElevenLabs & OpenAI • Built with Next.js & Chakra UI
            </Text>
            <HStack gap={4} fontSize="xs" color="fg.subtle">
              <Text>🎤 Voice-first translation</Text>
              <Text>•</Text>
              <Text>⚡ Real-time processing</Text>
              <Text>•</Text>
              <Text>🌐 4 languages supported</Text>
            </HStack>
          </VStack>
        </VStack>
      </Container>

      <Toaster />
    </Box>
  );
}
