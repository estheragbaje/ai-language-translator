'use client';

import { Box, Tabs, VStack } from '@chakra-ui/react';
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
} from '@/components/ui/drawer';
import { HistoryPanel } from './HistoryPanel';
import { BookmarksPanel } from './BookmarksPanel';
import { HistoryEntry, BookmarkEntry } from '@/types/translator';

interface TranslatorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  bookmarks: BookmarkEntry[];
  onClearHistory: () => void;
  onReplayHistory: (entry: HistoryEntry) => void;
  onDeleteHistory: (id: string) => void;
  onAddBookmark: (bookmark: Omit<BookmarkEntry, 'id' | 'timestamp'>) => void;
  onDeleteBookmark: (id: string) => void;
  onUseBookmark: (bookmark: BookmarkEntry) => void;
  currentSource?: string;
  currentTranslation?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
}

export function TranslatorSidebar({
  isOpen,
  onClose,
  history,
  bookmarks,
  onClearHistory,
  onReplayHistory,
  onDeleteHistory,
  onAddBookmark,
  onDeleteBookmark,
  onUseBookmark,
  currentSource,
  currentTranslation,
  sourceLanguage,
  targetLanguage,
}: TranslatorSidebarProps) {
  return (
    <DrawerRoot
      open={isOpen}
      onOpenChange={(e: { open: boolean }) => !e.open && onClose()}
      size="md"
      placement="end"
    >
      <DrawerBackdrop />
      <DrawerContent>
        <DrawerCloseTrigger />
        <DrawerHeader>
          <DrawerTitle fontSize="xl" fontWeight="bold">
            Translation Manager
          </DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <Box h="full">
            <Tabs.Root defaultValue="history" fitted variant="enclosed">
              <Tabs.List
                bg="gray.100"
                _dark={{ bg: 'gray.900' }}
                borderRadius="lg"
                p={1}
                mb={4}
              >
                <Tabs.Trigger
                  value="history"
                  flex="1"
                  fontWeight="semibold"
                  fontSize="sm"
                  _selected={{
                    bg: 'white',
                    _dark: { bg: 'gray.800' },
                    shadow: 'sm',
                  }}
                >
                  History
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="bookmarks"
                  flex="1"
                  fontWeight="semibold"
                  fontSize="sm"
                  _selected={{
                    bg: 'white',
                    _dark: { bg: 'gray.800' },
                    shadow: 'sm',
                  }}
                >
                  Bookmarks
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="history">
                <VStack align="stretch" gap={4}>
                  <HistoryPanel
                    history={history}
                    onClear={onClearHistory}
                    onReplay={onReplayHistory}
                    onDelete={onDeleteHistory}
                  />
                </VStack>
              </Tabs.Content>

              <Tabs.Content value="bookmarks">
                <VStack align="stretch" gap={4}>
                  <BookmarksPanel
                    bookmarks={bookmarks}
                    onAdd={onAddBookmark}
                    onDelete={onDeleteBookmark}
                    onUse={onUseBookmark}
                    currentSource={currentSource}
                    currentTranslation={currentTranslation}
                    sourceLanguage={sourceLanguage}
                    targetLanguage={targetLanguage}
                  />
                </VStack>
              </Tabs.Content>
            </Tabs.Root>
          </Box>
        </DrawerBody>
      </DrawerContent>
    </DrawerRoot>
  );
}
