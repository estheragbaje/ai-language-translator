'use client';

import { Box, Button, HStack, Text, VStack, Heading } from '@chakra-ui/react';
import { ALL_LANGUAGES } from '@/lib/constants';

interface ConversationMessage {
  id: string;
  speaker: 'A' | 'B';
  text: string;
  translation: string;
  language: string;
  timestamp: number;
}

interface ConversationPanelProps {
  messages: ConversationMessage[];
  onClear: () => void;
  personALanguage: string;
  personBLanguage: string;
}

export function ConversationPanel({
  messages,
  onClear,
  personALanguage,
  personBLanguage,
}: ConversationPanelProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <Box
      bg="white"
      _dark={{ bg: 'gray.800', borderColor: 'gray.700' }}
      borderRadius="2xl"
      shadow="xs"
      borderWidth="1px"
      borderColor="gray.100"
      p={6}
      h="full"
    >
      <VStack align="stretch" gap={4} h="full">
        <HStack justify="space-between" align="center">
          <HStack gap={2}>
            <Text fontSize="2xl">💬</Text>
            <Heading size="lg" fontWeight="bold">
              Conversation
            </Heading>
          </HStack>
          {messages.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              colorPalette="red"
              onClick={onClear}
            >
              Clear
            </Button>
          )}
        </HStack>

        {/* Language indicators */}
        <HStack
          justify="space-around"
          p={3}
          bg="gray.50"
          _dark={{ bg: 'gray.900' }}
          borderRadius="lg"
        >
          <HStack gap={2}>
            <Box
              w={8}
              h={8}
              borderRadius="full"
              bg="blue.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontWeight="bold"
              color="blue.700"
              _dark={{ bg: 'blue.900', color: 'blue.300' }}
            >
              A
            </Box>
            <Text fontSize="sm" fontWeight="medium">
              {ALL_LANGUAGES[personALanguage]?.flag}{' '}
              {ALL_LANGUAGES[personALanguage]?.name}
            </Text>
          </HStack>
          <Text fontSize="lg">⇄</Text>
          <HStack gap={2}>
            <Box
              w={8}
              h={8}
              borderRadius="full"
              bg="green.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontWeight="bold"
              color="green.700"
              _dark={{ bg: 'green.900', color: 'green.300' }}
            >
              B
            </Box>
            <Text fontSize="sm" fontWeight="medium">
              {ALL_LANGUAGES[personBLanguage]?.flag}{' '}
              {ALL_LANGUAGES[personBLanguage]?.name}
            </Text>
          </HStack>
        </HStack>

        {messages.length === 0 ? (
          <VStack
            gap={3}
            py={12}
            color="gray.500"
            _dark={{ color: 'gray.500' }}
            flex="1"
            justify="center"
          >
            <Text fontSize="4xl">💭</Text>
            <Text fontWeight="medium">No conversation yet</Text>
            <Text fontSize="sm" textAlign="center" maxW="xs">
              Start speaking to begin the conversation
            </Text>
          </VStack>
        ) : (
          <VStack
            align="stretch"
            gap={3}
            flex="1"
            overflowY="auto"
            maxH="500px"
            pr={2}
          >
            {messages.map((message) => (
              <Box
                key={message.id}
                alignSelf={message.speaker === 'A' ? 'flex-start' : 'flex-end'}
                maxW="75%"
              >
                <VStack align="stretch" gap={1}>
                  <HStack gap={2} fontSize="xs" color="gray.500">
                    <Box
                      w={5}
                      h={5}
                      borderRadius="full"
                      bg={message.speaker === 'A' ? 'blue.100' : 'green.100'}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="bold"
                      fontSize="xs"
                      color={message.speaker === 'A' ? 'blue.700' : 'green.700'}
                      _dark={{
                        bg: message.speaker === 'A' ? 'blue.900' : 'green.900',
                        color:
                          message.speaker === 'A' ? 'blue.300' : 'green.300',
                      }}
                    >
                      {message.speaker}
                    </Box>
                    <Text>{formatTime(message.timestamp)}</Text>
                  </HStack>
                  <Box
                    p={3}
                    bg={message.speaker === 'A' ? 'blue.50' : 'green.50'}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor={
                      message.speaker === 'A' ? 'blue.200' : 'green.200'
                    }
                    _dark={{
                      bg:
                        message.speaker === 'A'
                          ? 'blue.900/30'
                          : 'green.900/30',
                      borderColor:
                        message.speaker === 'A' ? 'blue.700' : 'green.700',
                    }}
                  >
                    <Text fontSize="sm" fontWeight="semibold" mb={1}>
                      {message.text}
                    </Text>
                    <Text
                      fontSize="xs"
                      color="gray.600"
                      _dark={{ color: 'gray.400' }}
                      fontStyle="italic"
                    >
                      {message.translation}
                    </Text>
                  </Box>
                </VStack>
              </Box>
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  );
}
