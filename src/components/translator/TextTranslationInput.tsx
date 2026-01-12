'use client';

import { Button, HStack, Text, VStack, Textarea, Box } from '@chakra-ui/react';
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

  const charCount = text.length;

  return (
    <VStack gap={3} width="full" align="stretch">
      <Box position="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          size="lg"
          minHeight="100px"
          disabled={disabled}
          resize="vertical"
          borderRadius="lg"
          borderWidth="2px"
          borderColor="gray.200"
          _dark={{ borderColor: 'gray.700' }}
          _hover={{
            borderColor: 'blue.400',
            _dark: { borderColor: 'blue.500' },
          }}
          _focus={{
            borderColor: 'blue.500',
            _dark: { borderColor: 'blue.400' },
            boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
          }}
          fontSize="md"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleTranslate();
            }
          }}
        />
        {charCount > 0 && (
          <Text
            position="absolute"
            bottom={2}
            right={3}
            fontSize="xs"
            color="gray.500"
            _dark={{ color: 'gray.500' }}
            pointerEvents="none"
          >
            {charCount} characters
          </Text>
        )}
      </Box>

      <HStack width="full" justify="space-between" align="center">
        <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.500' }}>
          Press Cmd/Ctrl + Enter to translate
        </Text>
        <HStack gap={2}>
          <Button
            size="sm"
            variant="outline"
            onClick={handleClear}
            disabled={!text || disabled}
            colorPalette="gray"
          >
            Clear
          </Button>
          <Button
            size="sm"
            onClick={handleTranslate}
            disabled={!text.trim() || disabled}
            loading={isTranslating}
            colorPalette="blue"
            fontWeight="semibold"
          >
            {isTranslating ? 'Translating...' : 'Translate'}
          </Button>
        </HStack>
      </HStack>
    </VStack>
  );
}
