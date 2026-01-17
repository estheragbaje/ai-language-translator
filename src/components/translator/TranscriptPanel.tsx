'use client';

import {
  Box,
  Button,
  Card,
  HStack,
  Slider,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useRef, useState, useEffect } from 'react';

interface TranscriptPanelProps {
  title: string;
  text: string;
  languageFlag: string;
  languageName: string;
  isLoading?: boolean;
  showCopy?: boolean;
  showPlay?: boolean;
  showBookmark?: boolean;
  onCopy?: () => void;
  onPlay?: () => void;
  onBookmark?: () => void;
  audioUrl?: string | null;
  colorPalette?: 'blue' | 'green' | 'purple';
}

export function TranscriptPanel({
  title,
  text,
  languageFlag,
  languageName,
  isLoading = false,
  showCopy = true,
  showPlay = false,
  showBookmark = false,
  onCopy,
  onPlay,
  onBookmark,
  audioUrl,
  colorPalette = 'blue',
}: TranscriptPanelProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (details: { value: number[] }) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = details.value[0];
    setCurrentTime(details.value[0]);
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card.Root
      variant="outline"
      size="lg"
      colorPalette={colorPalette}
      width="full"
      display="flex"
      flexDirection="column"
      height="full"
    >
      <Card.Header>
        <HStack justify="space-between">
          <HStack gap={2}>
            <Text fontSize="2xl">{languageFlag}</Text>
            <VStack align="start" gap={0}>
              <Text fontWeight="bold" fontSize="lg">
                {title}
              </Text>
              <Text fontSize="sm" color="fg.muted">
                {languageName}
              </Text>
            </VStack>
          </HStack>
          <HStack gap={2}>
            {showPlay && onPlay && text && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onPlay}
                colorPalette={colorPalette}
              >
                ▶️ Play
              </Button>
            )}
            {showBookmark && onBookmark && text && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onBookmark}
                colorPalette="yellow"
                title="Bookmark this translation"
              >
                ⭐ Bookmark
              </Button>
            )}
            {showCopy && onCopy && text && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onCopy}
                colorPalette={colorPalette}
              >
                📋 Copy
              </Button>
            )}
          </HStack>
        </HStack>
      </Card.Header>
      <Card.Body flex="1" display="flex" flexDirection="column">
        {isLoading ? (
          <VStack gap={3} align="start" width="full">
            <Box height="4" bg="bg.muted" width="90%" borderRadius="md" />
            <Box height="4" bg="bg.muted" width="75%" borderRadius="md" />
            <Box height="4" bg="bg.muted" width="85%" borderRadius="md" />
          </VStack>
        ) : text ? (
          <Text
            fontSize="lg"
            lineHeight="tall"
            color="fg.default"
            whiteSpace="pre-wrap"
          >
            {text}
          </Text>
        ) : (
          <Text fontSize="md" color="fg.muted" fontStyle="italic">
            {title === 'Original'
              ? 'Press the microphone button to start recording...'
              : 'Translation will appear here...'}
          </Text>
        )}

        {/* Audio Player */}
        {audioUrl && (
          <VStack
            gap={4}
            width="full"
            mt={6}
            pt={6}
            borderTopWidth="1px"
            borderColor="border.subtle"
          >
            <audio ref={audioRef} src={audioUrl} preload="metadata" />

            <HStack width="full" gap={3}>
              <Button
                size="md"
                variant="solid"
                onClick={togglePlayPause}
                colorPalette={colorPalette}
                minW="100px"
              >
                {isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </Button>

              <VStack flex="1" gap={2} align="stretch">
                <Slider.Root
                  value={[currentTime]}
                  onValueChange={handleSeek}
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  colorPalette={colorPalette}
                >
                  <Slider.Control>
                    <Slider.Track>
                      <Slider.Range />
                    </Slider.Track>
                    <Slider.Thumb index={0} />
                  </Slider.Control>
                </Slider.Root>

                <HStack justify="space-between" fontSize="xs" color="fg.muted">
                  <Text>{formatTime(currentTime)}</Text>
                  <Text>{formatTime(duration)}</Text>
                </HStack>
              </VStack>
            </HStack>
          </VStack>
        )}
      </Card.Body>
    </Card.Root>
  );
}
