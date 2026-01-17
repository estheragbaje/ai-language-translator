'use client';

import {
  Box,
  Button,
  HStack,
  IconButton,
  Text,
  VStack,
  Heading,
} from '@chakra-ui/react';
import { HistoryEntry } from '@/types/translator';
import { ALL_LANGUAGES } from '@/lib/constants';

interface HistoryPanelProps {
  history: HistoryEntry[];
  onClear: () => void;
  onReplay: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
}

export function HistoryPanel({
  history,
  onClear,
  onReplay,
  onDelete,
}: HistoryPanelProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <VStack align="stretch" gap={4} h="full">
      <HStack justify="space-between" align="center">
        <HStack gap={2}>
          <Text fontSize="2xl">📜</Text>
          <Heading size="lg" fontWeight="bold">
            Translation History
          </Heading>
        </HStack>
        {history.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            colorPalette="red"
            onClick={onClear}
            borderRadius="md"
          >
            Clear All
          </Button>
        )}
      </HStack>

      {history.length === 0 ? (
        <VStack
          gap={3}
          py={12}
          color="gray.500"
          _dark={{ color: 'gray.500' }}
          flex="1"
          justify="center"
        >
          <Text fontSize="4xl">🕐</Text>
          <Text fontWeight="medium">No translation history yet</Text>
          <Text fontSize="sm" textAlign="center" maxW="xs">
            Your translations will appear here
          </Text>
        </VStack>
      ) : (
        <VStack
          align="stretch"
          gap={2}
          flex="1"
          overflowY="auto"
          maxH="500px"
          pr={2}
        >
          {history.map((entry) => (
            <Box
              key={entry.id}
              p={4}
              bg="gray.50"
              borderRadius="lg"
              borderWidth="1px"
              borderColor="gray.200"
              _hover={{
                borderColor: 'blue.300',
              }}
              _dark={{
                bg: 'gray.900',
                borderColor: 'gray.700',
                _hover: { borderColor: 'blue.600' },
              }}
              transition="all 0.2s"
            >
              <VStack align="stretch" gap={2}>
                <HStack justify="space-between" align="start">
                  <HStack gap={2} fontSize="xs" color="gray.500">
                    <Text>
                      {ALL_LANGUAGES[entry.sourceLanguage]?.flag || '🌐'}
                    </Text>
                    <Text>→</Text>
                    <Text>
                      {ALL_LANGUAGES[entry.targetLanguage]?.flag || '🌐'}
                    </Text>
                    <Text>•</Text>
                    <Text>{formatDate(entry.timestamp)}</Text>
                  </HStack>
                  <IconButton
                    size="xs"
                    variant="ghost"
                    colorPalette="red"
                    onClick={() => onDelete(entry.id)}
                    aria-label="Delete"
                    borderRadius="md"
                  >
                    ×
                  </IconButton>
                </HStack>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={1}>
                    {entry.sourceText}
                  </Text>
                  <Text
                    fontSize="sm"
                    color="gray.600"
                    _dark={{ color: 'gray.400' }}
                  >
                    {entry.translatedText}
                  </Text>
                </Box>

                <Button
                  size="xs"
                  variant="ghost"
                  colorPalette="blue"
                  onClick={() => onReplay(entry)}
                  w="fit-content"
                  borderRadius="md"
                >
                  Replay
                </Button>
              </VStack>
            </Box>
          ))}
        </VStack>
      )}
    </VStack>
  );
}
