'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Toaster, toaster } from '@/components/ui/toaster';
import { LanguageSelector } from '@/components/translator/LanguageSelector';
import { RecordButton } from '@/components/translator/RecordButton';
import { TranscriptPanel } from '@/components/translator/TranscriptPanel';
import { TextTranslationInput } from '@/components/translator/TextTranslationInput';
import { ConversationPanel } from '@/components/translator/ConversationPanel';
import { TranslatorSidebar } from '@/components/translator/TranslatorSidebar';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { ALL_LANGUAGES, LANGUAGE_OPTIONS } from '@/lib/constants';
import {
  HistoryEntry,
  ConversationMessage,
  BookmarkEntry,
} from '@/types/translator';

export default function Home() {
  const [sourceLanguage, setSourceLanguage] = useState<string[]>(['en']);
  const [targetLanguage, setTargetLanguage] = useState<string[]>(['fr']);
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isConversationMode, setIsConversationMode] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<
    ConversationMessage[]
  >([]);
  const [currentSpeaker, setCurrentSpeaker] = useState<'A' | 'B'>('A');
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('translationHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    }

    const savedBookmarks = localStorage.getItem('translationBookmarks');
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (error) {
        console.error('Failed to load bookmarks:', error);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('translationHistory', JSON.stringify(history));
    }
  }, [history]);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('translationBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addToHistory = (
    sourceText: string,
    translatedText: string,
    sourceLang: string,
    targetLang: string,
  ) => {
    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      sourceText,
      translatedText,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      timestamp: Date.now(),
    };
    setHistory((prev) => [newEntry, ...prev].slice(0, 50)); // Keep last 50 entries
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('translationHistory');
    toaster.success({
      title: 'History cleared',
      description: 'All translation history has been removed',
    });
  };

  const deleteHistoryEntry = (id: string) => {
    setHistory((prev) => prev.filter((entry) => entry.id !== id));
  };

  const replayHistoryEntry = async (entry: HistoryEntry) => {
    setSourceLanguage([entry.sourceLanguage]);
    setTargetLanguage([entry.targetLanguage]);
    setSourceText(entry.sourceText);
    await handleTranslateText(entry.sourceText);
  };

  const toggleConversationMode = () => {
    setIsConversationMode(!isConversationMode);
    if (!isConversationMode) {
      // Entering conversation mode
      setCurrentSpeaker('A');
      toaster.info({
        title: 'Conversation Mode Active',
        description: 'Languages will auto-swap between speakers',
      });
    } else {
      // Exiting conversation mode
      toaster.info({
        title: 'Conversation Mode Disabled',
        description: 'Switched back to standard translation',
      });
    }
  };

  const clearConversation = () => {
    setConversationMessages([]);
    setCurrentSpeaker('A');
    toaster.success({
      title: 'Conversation cleared',
    });
  };

  const addConversationMessage = (
    text: string,
    translation: string,
    speaker: 'A' | 'B',
  ) => {
    const newMessage: ConversationMessage = {
      id: Date.now().toString(),
      speaker,
      text,
      translation,
      language: speaker === 'A' ? sourceLanguage[0] : targetLanguage[0],
      timestamp: Date.now(),
    };
    setConversationMessages((prev) => [...prev, newMessage]);
    // Toggle speaker for next turn
    setCurrentSpeaker(speaker === 'A' ? 'B' : 'A');
  };

  const addBookmark = (bookmark: Omit<BookmarkEntry, 'id' | 'timestamp'>) => {
    const newBookmark: BookmarkEntry = {
      ...bookmark,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    setBookmarks((prev) => [newBookmark, ...prev]);
    toaster.success({
      title: 'Bookmark saved',
      description: 'Translation added to bookmarks',
    });
  };

  const deleteBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id));
    toaster.success({
      title: 'Bookmark deleted',
    });
  };

  const useBookmark = async (bookmark: BookmarkEntry) => {
    setSourceLanguage([bookmark.sourceLanguage]);
    setTargetLanguage([bookmark.targetLanguage]);
    setSourceText(bookmark.sourceText);
    setTranslatedText(bookmark.translatedText);
    await generateAudio(bookmark.translatedText);
  };

  const handleQuickBookmark = () => {
    if (!sourceText || !translatedText) {
      toaster.error({
        title: 'Cannot bookmark',
        description: 'No translation available to bookmark',
      });
      return;
    }

    addBookmark({
      sourceText,
      translatedText,
      sourceLanguage: sourceLanguage[0],
      targetLanguage: targetLanguage[0],
    });
  };

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

    // In conversation mode, also swap the current speaker
    if (isConversationMode) {
      setCurrentSpeaker(currentSpeaker === 'A' ? 'B' : 'A');
    }
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
        },
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

      // Generate audio for the translation BEFORE any mode-specific logic
      // Pass the current target language explicitly to avoid race conditions
      await generateAudio(translated, targetLanguage[0]);

      // In conversation mode, add to conversation
      if (isConversationMode) {
        addConversationMessage(text, translated, currentSpeaker);
        // Auto-swap languages for next speaker
        setTimeout(() => {
          swapLanguages();
        }, 100);
      } else {
        // Add to history in normal mode
        addToHistory(text, translated, sourceLanguage[0], targetLanguage[0]);
      }

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

  const generateAudio = async (text: string, language?: string) => {
    try {
      const audioLanguage = language || targetLanguage[0];
      console.log('🔊 Generating audio for language:', audioLanguage);
      
      const ttsResponse = await fetch('/api/tts/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language: audioLanguage,
        }),
      });

      if (!ttsResponse.ok) {
        throw new Error('Text-to-speech failed');
      }

      const audioBlob = await ttsResponse.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      // Auto-play the audio with better error handling
      console.log('▶️ Playing audio...');
      const audio = new Audio(url);
      
      // Wait for audio to load before playing
      await new Promise((resolve, reject) => {
        audio.onloadeddata = () => {
          audio.play()
            .then(() => {
              console.log('✅ Audio playing successfully');
              resolve(true);
            })
            .catch((error) => {
              console.error('❌ Auto-play failed:', error);
              toaster.info({
                title: 'Audio ready',
                description: 'Click play to hear the translation',
              });
              resolve(false);
            });
        };
        audio.onerror = reject;
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
    <Box
      minH="100vh"
      bg="gray.50"
      _dark={{ bg: 'gray.900' }}
      position="relative"
    >
      {/* Sidebar Toggle Button - Top Right */}
      <IconButton
        position="fixed"
        top={4}
        right={4}
        size="lg"
        variant="solid"
        colorPalette="blue"
        onClick={() => setIsSidebarOpen(true)}
        aria-label="Open history and bookmarks"
        zIndex={10}
        shadow="md"
      >
        ☰
      </IconButton>

      <Container maxW="6xl" py={{ base: 6, md: 10 }}>
        <VStack gap={{ base: 6, md: 8 }} align="stretch">
          {/* Header */}
          <VStack gap={3} textAlign="center">
            <Box
              px={6}
              py={2}
              bg="blue.50"
              _dark={{ bg: 'blue.900/20' }}
              borderRadius="full"
              display="inline-block"
            >
              <Text
                fontSize="sm"
                fontWeight="medium"
                color="blue.600"
                _dark={{ color: 'blue.300' }}
              >
                AI-Powered Translation
              </Text>
            </Box>
            <Heading
              size={{ base: '2xl', md: '4xl' }}
              fontWeight="extrabold"
              letterSpacing="tight"
            >
              Real-Time Voice Translator
            </Heading>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color="gray.600"
              _dark={{ color: 'gray.400' }}
              maxW="3xl"
              fontWeight="medium"
            >
              Speak naturally and get instant translations in multiple languages
            </Text>

            {/* Action Buttons */}
            <HStack gap={3} mt={2} flexWrap="wrap" justify="center">
              <Button
                size="md"
                variant={isConversationMode ? 'solid' : 'outline'}
                colorPalette={isConversationMode ? 'green' : 'gray'}
                onClick={toggleConversationMode}
              >
                {isConversationMode
                  ? '💬 Conversation Mode Active'
                  : '💬 Enable Conversation Mode'}
              </Button>
            </HStack>
          </VStack>

          {/* Input Method Tabs with Language Selection */}
          <Box
            bg="white"
            _dark={{ bg: 'gray.800', borderColor: 'gray.700' }}
            borderRadius="2xl"
            shadow="xs"
            borderWidth="1px"
            borderColor="gray.100"
            overflow="hidden"
          >
            <Tabs.Root defaultValue="voice" size="lg" variant="plain">
              <HStack
                px={4}
                pt={4}
                pb={2}
                justify="space-between"
                align="center"
                flexWrap="wrap"
                gap={3}
              >
                <Tabs.List
                  bg="gray.100"
                  _dark={{ bg: 'gray.900' }}
                  borderRadius="lg"
                  p={0.5}
                  display="inline-flex"
                  gap={0.5}
                >
                  <Tabs.Trigger
                    value="voice"
                    px={3}
                    py={1.5}
                    borderRadius="md"
                    fontWeight="semibold"
                    fontSize="sm"
                    _selected={{
                      bg: 'white',
                      _dark: { bg: 'gray.800' },
                      shadow: 'sm',
                    }}
                  >
                    🎤 Voice
                  </Tabs.Trigger>
                  <Tabs.Trigger
                    value="text"
                    px={3}
                    py={1.5}
                    borderRadius="md"
                    fontWeight="semibold"
                    fontSize="sm"
                    _selected={{
                      bg: 'white',
                      _dark: { bg: 'gray.800' },
                      shadow: 'sm',
                    }}
                  >
                    ⌨️ Text
                  </Tabs.Trigger>
                </Tabs.List>

                {/* Language Selection on the right */}
                <HStack
                  gap={2}
                  align="center"
                  display={{ base: 'none', md: 'flex' }}
                >
                  <Box minW="180px">
                    <LanguageSelector
                      label=""
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
                    fontSize="lg"
                    colorPalette="blue"
                    px={2}
                    minW="auto"
                  >
                    ⇄
                  </Button>
                  <Box minW="180px">
                    <LanguageSelector
                      label=""
                      value={targetLanguage}
                      options={getAvailableTargetLanguages()}
                      onChange={setTargetLanguage}
                    />
                  </Box>
                </HStack>
              </HStack>

              {/* Mobile language selection */}
              <HStack
                px={4}
                pb={3}
                gap={2}
                justify="center"
                display={{ base: 'flex', md: 'none' }}
                flexWrap="wrap"
              >
                <Box flex="1" minW="140px">
                  <LanguageSelector
                    label=""
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
                  fontSize="lg"
                  colorPalette="blue"
                  px={2}
                  minW="auto"
                  alignSelf="flex-end"
                  mb={2}
                >
                  ⇄
                </Button>
                <Box flex="1" minW="140px">
                  <LanguageSelector
                    label=""
                    value={targetLanguage}
                    options={getAvailableTargetLanguages()}
                    onChange={setTargetLanguage}
                  />
                </Box>
              </HStack>

              {/* Voice Tab */}
              <Tabs.Content value="voice">
                <VStack gap={3} py={4} px={3} minH="130px">
                  <RecordButton
                    state={state}
                    duration={duration}
                    onStart={startRecording}
                    onStop={stopRecording}
                  />

                  <Text
                    fontSize="sm"
                    color="gray.600"
                    _dark={{ color: 'gray.400' }}
                    minH="20px"
                    textAlign="center"
                    fontWeight="medium"
                  >
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
                <Box py={4} px={3}>
                  <TextTranslationInput
                    onTranslate={handleTranslateText}
                    isTranslating={isTranslating}
                    disabled={state === 'recording' || state === 'processing'}
                  />
                </Box>
              </Tabs.Content>
            </Tabs.Root>
          </Box>

          {/* Transcripts */}
          <Grid
            templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
            gap={{ base: 4, md: 6 }}
            alignItems="stretch"
          >
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
                showBookmark={true}
                onCopy={() => handleCopyText(translatedText)}
                onPlay={handlePlayAudio}
                onBookmark={handleQuickBookmark}
                audioUrl={audioUrl}
                colorPalette="green"
              />
            </GridItem>
          </Grid>

          {/* Conversation Panel */}
          {isConversationMode && (
            <ConversationPanel
              messages={conversationMessages}
              onClear={clearConversation}
              personALanguage={sourceLanguage[0]}
              personBLanguage={targetLanguage[0]}
            />
          )}

          {/* Footer */}
          <Box pt={{ base: 12, md: 16 }}>
            <Text
              fontSize="sm"
              color="gray.500"
              _dark={{ color: 'gray.500' }}
              textAlign="center"
              fontWeight="medium"
            >
              Project powered by ElevenLabs, OpenAI & Chakra UI
            </Text>
          </Box>
        </VStack>
      </Container>

      <TranslatorSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        history={history}
        bookmarks={bookmarks}
        onClearHistory={clearHistory}
        onReplayHistory={replayHistoryEntry}
        onDeleteHistory={deleteHistoryEntry}
        onAddBookmark={addBookmark}
        onDeleteBookmark={deleteBookmark}
        onUseBookmark={useBookmark}
        currentSource={sourceText}
        currentTranslation={translatedText}
        sourceLanguage={sourceLanguage[0]}
        targetLanguage={targetLanguage[0]}
      />

      <Toaster />
    </Box>
  );
}
