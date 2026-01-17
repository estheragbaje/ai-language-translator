'use client';

import { Button, Card, HStack, Slider, Text, VStack } from '@chakra-ui/react';
import { useRef, useState, useEffect } from 'react';

interface AudioPlayerProps {
  audioUrl: string | null;
  languageFlag: string;
  languageName: string;
  onClose?: () => void;
}

export function AudioPlayer({
  audioUrl,
  languageFlag,
  languageName,
  onClose,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

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

  if (!audioUrl) return null;

  return (
    <Card.Root variant="elevated" size="lg" colorPalette="green">
      <Card.Header>
        <HStack justify="space-between">
          <HStack gap={2}>
            <Text fontSize="2xl">🔊</Text>
            <VStack align="start" gap={0}>
              <Text fontWeight="bold" fontSize="lg">
                Audio Playback
              </Text>
              <Text fontSize="sm" color="fg.muted">
                {languageFlag} {languageName}
              </Text>
            </VStack>
          </HStack>
          {onClose && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              borderRadius="md"
            >
              ×
            </Button>
          )}
        </HStack>
      </Card.Header>
      <Card.Body>
        <VStack gap={4} width="full">
          <audio ref={audioRef} src={audioUrl} preload="metadata" />

          <HStack width="full" gap={3}>
            <Button
              size="lg"
              variant={isPlaying ? 'outline' : 'solid'}
              colorPalette="green"
              onClick={togglePlayPause}
              borderRadius="full"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>

            <VStack flex={1} gap={1}>
              <Slider.Root
                value={[currentTime]}
                max={duration || 100}
                onValueChange={handleSeek}
                width="full"
              >
                <Slider.Control>
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumb index={0} />
                </Slider.Control>
              </Slider.Root>

              <HStack width="full" justify="space-between">
                <Text fontSize="xs" color="fg.muted" fontFamily="mono">
                  {formatTime(currentTime)}
                </Text>
                <Text fontSize="xs" color="fg.muted" fontFamily="mono">
                  {formatTime(duration)}
                </Text>
              </HStack>
            </VStack>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
