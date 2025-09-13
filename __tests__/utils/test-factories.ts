import type { Item } from '@/shared/types';

/**
 * Test data factories following the Factory pattern
 * Used by companies like Shopify, GitHub, etc.
 */

export const createMockStoryItem = (overrides: Partial<Item> = {}): Item => ({
  id: 1,
  title: 'Test Story 1',
  by: 'user1',
  time: 1640995200,
  score: 100,
  url: 'https://example.com/1',
  type: 'story' as const,
  kids: [101, 102],
  dead: false,
  deleted: false,
  text: '',
  parent: 0,
  poll: 0,
  parts: [],
  descendants: 5,
  ...overrides,
});

export const createMockStoryItems = (count: number): Item[] => 
  Array.from({ length: count }, (_, i) => 
    createMockStoryItem({
      id: i + 1,
      title: `Test Story ${i + 1}`,
      by: `user${i + 1}`,
      score: (i + 1) * 100,
      url: `https://example.com/${i + 1}`,
      kids: [(i + 1) * 100 + 1, (i + 1) * 100 + 2],
      descendants: (i + 1) * 5,
    })
  );

export const createDeadStory = (id = 3): Item => 
  createMockStoryItem({ id, title: 'Dead Story', dead: true });

export const createDeletedStory = (id = 4): Item => 
  createMockStoryItem({ id, title: 'Deleted Story', deleted: true });

export const createLargeDataset = (size: number): Item[] => 
  Array.from({ length: size }, (_, i) => 
    createMockStoryItem({
      id: i + 1,
      title: `Story ${i + 1}`,
    })
  );
