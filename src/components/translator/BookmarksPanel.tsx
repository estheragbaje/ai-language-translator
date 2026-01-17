'use client';

import {
  Box,
  Button,
  HStack,
  IconButton,
  Input,
  Text,
  VStack,
  Heading,
} from '@chakra-ui/react';
import { useState } from 'react';
import { BookmarkEntry } from '@/types/translator';
import { ALL_LANGUAGES } from '@/lib/constants';

interface BookmarksPanelProps {
  bookmarks: BookmarkEntry[];
  onAdd: (bookmark: Omit<BookmarkEntry, 'id' | 'timestamp'>) => void;
  onDelete: (id: string) => void;
  onUse: (bookmark: BookmarkEntry) => void;
  currentSource?: string;
  currentTranslation?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
}

export function BookmarksPanel({
  bookmarks,
  onAdd,
  onDelete,
  onUse,
  currentSource,
  currentTranslation,
  sourceLanguage,
  targetLanguage,
}: BookmarksPanelProps) {
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddBookmark = () => {
    if (
      !currentSource ||
      !currentTranslation ||
      !sourceLanguage ||
      !targetLanguage
    ) {
      return;
    }

    onAdd({
      sourceText: currentSource,
      translatedText: currentTranslation,
      sourceLanguage,
      targetLanguage,
      category: category || undefined,
      note: note || undefined,
    });

    setCategory('');
    setNote('');
    setShowAddForm(false);
  };

  const groupedBookmarks = bookmarks.reduce(
    (acc, bookmark) => {
      const cat = bookmark.category || 'Uncategorized';
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(bookmark);
      return acc;
    },
    {} as Record<string, BookmarkEntry[]>,
  );

  const canAddBookmark =
    currentSource && currentTranslation && sourceLanguage && targetLanguage;

  return (
    <VStack align="stretch" gap={4} h="full">
      <HStack justify="space-between" align="center">
        <HStack gap={2}>
          <Text fontSize="2xl">⭐</Text>
          <Heading size="lg" fontWeight="bold">
            Bookmarks
          </Heading>
        </HStack>
      </HStack>

      {/* Add Bookmark Button */}
      {canAddBookmark && !showAddForm && (
        <Button
          size="sm"
          variant="outline"
          colorPalette="blue"
          onClick={() => setShowAddForm(true)}
          borderRadius="md"
        >
          + Add Current Translation
        </Button>
      )}

      {/* Add Bookmark Form */}
      {showAddForm && (
        <Box
          p={4}
          bg="blue.50"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="blue.200"
          _dark={{ bg: 'blue.900/20', borderColor: 'blue.700' }}
        >
          <VStack align="stretch" gap={3}>
            <Text fontSize="sm" fontWeight="medium">
              Adding: &quot;{currentSource?.substring(0, 30)}...&quot;
            </Text>
            <Input
              placeholder="Category (optional)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              size="sm"
              bg="white"
              _dark={{ bg: 'gray.800' }}
            />
            <Input
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              size="sm"
              bg="white"
              _dark={{ bg: 'gray.800' }}
            />
            <HStack justify="flex-end" gap={2}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowAddForm(false);
                  setCategory('');
                  setNote('');
                }}
                borderRadius="md"
              >
                Cancel
              </Button>
              <Button size="sm" colorPalette="blue" onClick={handleAddBookmark} borderRadius="md">
                Save
              </Button>
            </HStack>
          </VStack>
        </Box>
      )}

      {bookmarks.length === 0 ? (
        <VStack
          gap={3}
          py={12}
          color="gray.500"
          _dark={{ color: 'gray.500' }}
          flex="1"
          justify="center"
        >
          <Text fontSize="4xl">📌</Text>
          <Text fontWeight="medium">No bookmarks yet</Text>
          <Text fontSize="sm" textAlign="center" maxW="xs">
            Save frequently used phrases for quick access
          </Text>
        </VStack>
      ) : (
        <VStack
          align="stretch"
          gap={4}
          flex="1"
          overflowY="auto"
          maxH="500px"
          pr={2}
        >
          {Object.entries(groupedBookmarks).map(([cat, items]) => (
            <Box key={cat}>
              <Text
                fontSize="xs"
                fontWeight="bold"
                textTransform="uppercase"
                color="gray.500"
                mb={2}
              >
                {cat}
              </Text>
              <VStack align="stretch" gap={2}>
                {items.map((bookmark) => (
                  <Box
                    key={bookmark.id}
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
                            {ALL_LANGUAGES[bookmark.sourceLanguage]?.flag ||
                              '🌐'}
                          </Text>
                          <Text>→</Text>
                          <Text>
                            {ALL_LANGUAGES[bookmark.targetLanguage]?.flag ||
                              '🌐'}
                          </Text>
                        </HStack>
                        <IconButton
                          size="xs"
                          variant="ghost"
                          colorPalette="red"
                          onClick={() => onDelete(bookmark.id)}
                          aria-label="Delete"
                          borderRadius="md"
                        >
                          ×
                        </IconButton>
                      </HStack>

                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={1}>
                          {bookmark.sourceText}
                        </Text>
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          _dark={{ color: 'gray.400' }}
                        >
                          {bookmark.translatedText}
                        </Text>
                        {bookmark.note && (
                          <Text
                            fontSize="xs"
                            color="blue.600"
                            _dark={{ color: 'blue.400' }}
                            mt={1}
                            fontStyle="italic"
                          >
                            {bookmark.note}
                          </Text>
                        )}
                      </Box>

                      <Button
                        size="xs"
                        variant="ghost"
                        colorPalette="blue"
                        onClick={() => onUse(bookmark)}
                        w="fit-content"
                        borderRadius="md"
                      >
                        Use This
                      </Button>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          ))}
        </VStack>
      )}
    </VStack>
  );
}
