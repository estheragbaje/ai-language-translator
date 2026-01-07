'use client';

import { Button, Card, HStack, Text, VStack, Textarea } from '@chakra-ui/react';
import { useState } from 'react';

interface TextTranslationInputProps {
  onTranslate: (text: string) => void;
  isTranslating?: boolean;
  disabled?: boolean;
}

export function TextTranslationInput({
  onTranslate,
  isTranslating = false,
  disabled = false,
}: TextTranslationInputProps) {
  const [text, setText] = useState('');

  const handleTranslate = () => {
    if (text.trim()) {
      onTranslate(text.trim());
    }
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <Card.Root variant="subtle" size="lg">
      <Card.Header>
        <HStack justify="space-between">
          <VStack align="start" gap={0}>
            <Text fontWeight="bold" fontSize="lg">
              ✍️ Text Translation
            </Text>
            <Text fontSize="sm" color="fg.muted">
              Type or paste text to translate
            </Text>
          </VStack>
        </HStack>
      </Card.Header>
      <Card.Body>
        <VStack gap={3} width="full">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to translate..."
            size="lg"
            minHeight="120px"
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey) {
                handleTranslate();
              }
            }}
          />
          <HStack width="full" justify="flex-end" gap={2}>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClear}
              disabled={!text || disabled}
            >
              Clear
            </Button>
            <Button
              size="sm"
              colorPalette="blue"
              onClick={handleTranslate}
              disabled={!text.trim() || disabled}
              loading={isTranslating}
            >
              Translate
            </Button>
          </HStack>
          <Text fontSize="xs" color="fg.muted">
            💡 Tip: Press Cmd+Enter to translate
          </Text>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
