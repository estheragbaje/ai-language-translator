'use client';

import { Box, Button, Card, HStack, Text, VStack } from '@chakra-ui/react';

interface TranscriptPanelProps {
  title: string;
  text: string;
  languageFlag: string;
  languageName: string;
  isLoading?: boolean;
  showCopy?: boolean;
  showPlay?: boolean;
  onCopy?: () => void;
  onPlay?: () => void;
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
  onCopy,
  onPlay,
  colorPalette = 'blue',
}: TranscriptPanelProps) {
  return (
    <Card.Root variant="outline" size="lg" colorPalette={colorPalette}>
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
      <Card.Body>
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
      </Card.Body>
    </Card.Root>
  );
}
