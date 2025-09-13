import type { Item } from '@/shared/types';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';

/**
 * Test factories for Post component
 * Following the Factory pattern for test data generation
 */

export const createMockPost = (overrides: Partial<Item> = {}): Item => ({
  id: 1,
  title: 'Test Post',
  url: 'https://example.com/article',
  score: 100,
  by: 'testuser',
  time: 1640995200,
  kids: [101, 102, 103],
  type: 'story',
  text: '',
  dead: false,
  deleted: false,
  parent: 0,
  poll: 0,
  parts: [],
  descendants: 3,
  ...overrides,
});

export const createExternalPost = (overrides: Partial<Item> = {}): Item =>
  createMockPost({
    title: 'External Post with URL',
    url: 'https://example.com/article',
    text: undefined as unknown as string,
    ...overrides,
  });

export const createInternalPost = (overrides: Partial<Item> = {}): Item =>
  createMockPost({
    id: 2,
    title: 'Internal Post with Text',
    url: '',
    score: 50,
    by: 'author',
    text: 'This is the post content',
    kids: [201],
    descendants: 1,
    ...overrides,
  });

export const createAskHNPost = (overrides: Partial<Item> = {}): Item =>
  createMockPost({
    id: 3,
    title: 'Ask HN: How to test React components?',
    url: '',
    text: 'Looking for best practices...',
    kids: [301, 302],
    descendants: 2,
    ...overrides,
  });

export const createJobPost = (overrides: Partial<Item> = {}): Item =>
  createMockPost({
    id: 4,
    title: 'Software Engineer at Company',
    url: 'https://company.com/jobs',
    score: 0, // Job posts typically don't have scores
    kids: [],
    descendants: 0,
    ...overrides,
  });

// Mock utilities
export const mockedRouter = router as jest.Mocked<typeof router>;
export const mockedLinking = Linking as jest.Mocked<typeof Linking>;
export const mockedHaptics = Haptics as jest.Mocked<typeof Haptics>;
export const mockOpenURL = (global as any).mockOpenURL;

// Common test data
export const MOCK_TIMESTAMP = 1640995200; // 2022-01-01
export const MOCK_FUTURE_TIMESTAMP = 1672531200; // 2023-01-01

// Helper for time-based tests
export const createTimedPost = (hoursAgo: number): Item =>
  createMockPost({
    time: Math.floor(Date.now() / 1000) - (hoursAgo * 3600),
  });
