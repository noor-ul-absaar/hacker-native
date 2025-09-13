import type { Item } from '@/shared/types';

/**
 * Test factories for Comment component
 * Following the Factory pattern for test data generation
 */

export const createMockCommentItem = (overrides: Partial<Item> = {}): Item => ({
  id: 101,
  by: 'testuser',
  time: 1640995200,
  text: '<p>This is a test comment with <a href="https://example.com">link</a></p>',
  type: 'comment',
  dead: false,
  deleted: false,
  parent: 1,
  kids: [201, 202],
  poll: 0,
  parts: [],
  descendants: 2,
  score: 5,
  title: '',
  url: '',
  ...overrides,
});

export const createCommentWithoutReplies = (overrides: Partial<Item> = {}): Item =>
  createMockCommentItem({
    kids: [],
    descendants: 0,
    ...overrides,
  });

export const createCommentWithEmptyText = (overrides: Partial<Item> = {}): Item =>
  createMockCommentItem({
    text: '',
    ...overrides,
  });

export const createCommentWithUndefinedKids = (overrides: Partial<Item> = {}): Item =>
  createMockCommentItem({
    kids: undefined as any,
    descendants: 0,
    ...overrides,
  });

export const createCommentWithNullKids = (overrides: Partial<Item> = {}): Item =>
  createMockCommentItem({
    kids: null as any,
    descendants: 0,
    ...overrides,
  });

export const createCommentWithEmptyAuthor = (overrides: Partial<Item> = {}): Item =>
  createMockCommentItem({
    by: '',
    ...overrides,
  });

export const createVeryOldComment = (overrides: Partial<Item> = {}): Item =>
  createMockCommentItem({
    time: 946684800, // Year 2000
    ...overrides,
  });

export const createFutureComment = (overrides: Partial<Item> = {}): Item =>
  createMockCommentItem({
    time: Math.floor(Date.now() / 1000) + 86400, // Tomorrow
    ...overrides,
  });

export const createHtmlComment = (overrides: Partial<Item> = {}): Item =>
  createMockCommentItem({
    text: '<p>HTML content with <strong>bold</strong> and <em>italic</em> text</p>',
    ...overrides,
  });

export const createMalformedHtmlComment = (overrides: Partial<Item> = {}): Item =>
  createMockCommentItem({
    text: '<p>Unclosed paragraph <strong>bold without closing',
    ...overrides,
  });

export const createSpecialCharactersComment = (overrides: Partial<Item> = {}): Item =>
  createMockCommentItem({
    text: '<p>Special chars: &amp; &lt; &gt; &quot; &#39;</p>',
    ...overrides,
  });

export const createLongComment = (overrides: Partial<Item> = {}): Item =>
  createMockCommentItem({
    text: '<p>' + 'Very long comment content. '.repeat(50) + '</p>',
    ...overrides,
  });

export const createCommentWithManyReplies = (overrides: Partial<Item> = {}): Item =>
  createMockCommentItem({
    kids: Array.from({ length: 10 }, (_, i) => 200 + i),
    descendants: 10,
    ...overrides,
  });

// Mock dimension helpers
export const createMockDimensions = (width: number = 375, height: number = 812) => ({
  window: { width, height, scale: 1, fontScale: 1 },
  screen: { width, height, scale: 1, fontScale: 1 },
});

export const MOCK_COMMENT_TIMESTAMP = 1640995200;
