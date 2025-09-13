import type { Item } from '@/shared/types';

/**
 * Test factories for Comments component
 * Following the Factory pattern for test data generation
 */

export const createMockComment = (overrides: Partial<Item> = {}): Item => ({
  id: 101,
  by: 'user1',
  time: 1640995200,
  text: 'This is a test comment',
  type: 'comment' as const,
  dead: false,
  deleted: false,
  parent: 1,
  kids: [],
  poll: 0,
  parts: [],
  descendants: 0,
  score: 5,
  title: '',
  url: '',
  ...overrides,
});

export const createCommentWithReplies = (overrides: Partial<Item> = {}): Item =>
  createMockComment({
    id: 102,
    text: 'Comment with replies',
    kids: [201, 202, 203],
    descendants: 3,
    ...overrides,
  });

export const createNestedComment = (parentId: number, overrides: Partial<Item> = {}): Item =>
  createMockComment({
    id: 200 + parentId,
    by: `user${parentId}`,
    text: `Reply to comment ${parentId}`,
    parent: parentId,
    ...overrides,
  });

export const createDeadComment = (overrides: Partial<Item> = {}): Item =>
  createMockComment({
    id: 999,
    text: 'Dead comment',
    dead: true,
    ...overrides,
  });

export const createDeletedComment = (overrides: Partial<Item> = {}): Item =>
  createMockComment({
    id: 998,
    text: 'Deleted comment',
    deleted: true,
    ...overrides,
  });

export const createCommentWithHtml = (overrides: Partial<Item> = {}): Item =>
  createMockComment({
    id: 103,
    text: '<p>Comment with <strong>HTML</strong> content</p><pre><code>console.log("code block");</code></pre>',
    ...overrides,
  });

export const createCommentWithBlockquote = (overrides: Partial<Item> = {}): Item =>
  createMockComment({
    id: 104,
    text: '<blockquote>This is a quoted text</blockquote><p>Regular text follows</p>',
    ...overrides,
  });

export const createCommentWithComplexHtml = (overrides: Partial<Item> = {}): Item =>
  createMockComment({
    id: 105,
    text: `
      <p>Complex HTML structure:</p>
      <ul>
        <li>Item 1 with <a href="https://example.com">link</a></li>
        <li>Item 2 with <em>emphasis</em></li>
      </ul>
      <pre><code>
        function example() {
          return "nested code";
        }
      </code></pre>
    `,
    ...overrides,
  });

export const createMalformedHtmlComment = (overrides: Partial<Item> = {}): Item =>
  createMockComment({
    id: 106,
    text: '<p>Unclosed tag <strong>bold text <em>mixed tags</p>',
    ...overrides,
  });

export const createEmptyComment = (overrides: Partial<Item> = {}): Item =>
  createMockComment({
    id: 107,
    text: '',
    ...overrides,
  });

export const createLongComment = (overrides: Partial<Item> = {}): Item =>
  createMockComment({
    id: 108,
    text: 'A'.repeat(1000) + ' This is a very long comment that tests performance',
    ...overrides,
  });

export const createCommentsDataset = (count: number): Item[] => {
  return Array.from({ length: count }, (_, index) => createMockComment({
    id: 100 + index + 1,
    by: `user${index + 1}`,
    text: `Comment ${index + 1} content`,
    time: 1640995200 + (index * 60), // Different timestamps
  }));
};

// Test data helpers for different scenarios
export const createMockCommentsResponse = (comments: Item[] = []) => ({
  data: {
    pages: [comments],
    pageParams: [undefined],
  },
  hasNextPage: false,
  isLoading: false,
  isFetchingNextPage: false,
  fetchNextPage: jest.fn(),
  refetch: jest.fn(),
  error: null,
  isError: false,
});

export const createInfiniteScrollCommentsResponse = (
  pages: Item[][] = [[]], 
  hasNextPage: boolean = true,
  fetchNextPage = jest.fn()
) => ({
  data: {
    pages,
    pageParams: pages.map((_, index) => index === 0 ? undefined : index),
  },
  hasNextPage,
  isLoading: false,
  isFetchingNextPage: false,
  fetchNextPage,
  refetch: jest.fn(),
  error: null,
  isError: false,
});

export const createLoadingCommentsResponse = () => ({
  data: undefined,
  hasNextPage: false,
  isLoading: true,
  isFetchingNextPage: false,
  fetchNextPage: jest.fn(),
  refetch: jest.fn(),
  error: null,
  isError: false,
});

export const createFetchingMoreCommentsResponse = (existingPages: Item[][] = [[]]) => ({
  data: {
    pages: existingPages,
    pageParams: existingPages.map((_, index) => index === 0 ? undefined : index),
  },
  hasNextPage: true,
  isLoading: true,
  isFetchingNextPage: true,
  fetchNextPage: jest.fn(),
  refetch: jest.fn(),
  error: null,
  isError: false,
});

export const MOCK_TIMESTAMP = 1640995200;
