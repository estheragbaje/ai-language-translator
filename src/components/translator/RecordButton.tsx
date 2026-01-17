'use client';

import { RecordingState } from '@/types/translator';
import { Box, Button, Circle, HStack, Text, VStack } from '@chakra-ui/react';

interface RecordButtonProps {
  state: RecordingState;
  duration: number;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export function RecordButton({
  state,
  duration,
  onStart,
  onStop,
  disabled = false,
}: RecordButtonProps) {
  const isRecording = state === 'recording';
  const isProcessing = state === 'processing';

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <VStack gap={4}>
      <Box position="relative">
        {isRecording && (
          <Circle
            size="120px"
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            bg="red.500"
            opacity={0.2}
            animation="pulse 1.5s ease-in-out infinite"
          />
        )}
        <Button
          size="2xl"
          colorPalette={isRecording ? 'red' : 'blue'}
          variant={isRecording ? 'solid' : 'surface'}
          onClick={isRecording ? onStop : onStart}
          disabled={disabled || isProcessing}
          loading={isProcessing}
          width="100px"
          height="100px"
          borderRadius="full"
          _hover={{
            transform: 'scale(1.05)',
          }}
          transition="all 0.2s"
        >
          <VStack gap={1}>
            <Text fontSize="2xl" fontWeight="medium">
              {isRecording ? 'Stop' : 'Record'}
            </Text>
          </VStack>
        </Button>
      </Box>

      {isRecording && (
        <HStack gap={2}>
          <Circle
            size="8px"
            bg="red.500"
            animation="blink 1s ease-in-out infinite"
          />
          <Text fontSize="lg" fontWeight="mono" color="red.600">
            {formatDuration(duration)}
          </Text>
        </HStack>
      )}

      <style jsx global>{`
        @keyframes pulse {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.2;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.3;
          }
        }
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>
    </VStack>
  );
}
