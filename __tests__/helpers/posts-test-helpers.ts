import React from 'react';
import { render, RenderResult } from '@testing-library/react-native';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { Posts } from '@/components/posts/Posts';
import type { Item } from '@/shared/types';
import type { StoryType } from '@/constants/stories';

// Get the mocked hooks from the global setup
export const mockedUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
export const mockedUseInfiniteQuery = useInfiniteQuery as jest.MockedFunction<typeof useInfiniteQuery>;

// Mock data generators
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

export const mockStoryIds = [1, 2, 3, 4, 5];
export const mockStoryDetails = createMockStoryItems(2);

// Query state builders
export const createUseQueryState = (overrides: any = {}) => ({
  data: mockStoryIds,
  isLoading: false,
  error: null,
  isError: false,
  ...overrides,
});

export const createUseInfiniteQueryState = (overrides: any = {}) => ({
  data: {
    pages: [mockStoryDetails],
  },
  hasNextPage: false,
  fetchNextPage: jest.fn(),
  isLoading: false,
  isFetchingNextPage: false,
  error: null,
  isError: false,
  ...overrides,
});

// Common render functions
export const renderPostsWithMocks = (
  queryState: any = {},
  infiniteQueryState: any = {},
  storyType: StoryType = 'topstories'
): RenderResult => {
  mockedUseQuery.mockReturnValue(createUseQueryState(queryState) as any);
  mockedUseInfiniteQuery.mockReturnValue(createUseInfiniteQueryState(infiniteQueryState) as any);
  
  return render(<Posts storyType={storyType} />);
};

// State scenarios
export const LOADING_STATE = {
  query: { data: undefined, isLoading: true },
  infiniteQuery: { data: undefined, isLoading: true },
};

export const SUCCESS_STATE = {
  query: { data: mockStoryIds, isLoading: false },
  infiniteQuery: { 
    data: { pages: [mockStoryDetails] }, 
    isLoading: false,
    hasNextPage: false 
  },
};

export const ERROR_STATE = {
  query: { 
    data: undefined, 
    isLoading: false, 
    error: new Error('Network error'), 
    isError: true 
  },
  infiniteQuery: { 
    data: undefined, 
    isLoading: false, 
    error: new Error('Network error'), 
    isError: true 
  },
};

export const INFINITE_SCROLL_STATE = {
  query: { data: mockStoryIds, isLoading: false },
  infiniteQuery: { 
    data: { pages: [mockStoryDetails.slice(0, 1)] }, 
    hasNextPage: true,
    isLoading: false 
  },
};

export const FETCHING_MORE_STATE = {
  query: { data: mockStoryIds, isLoading: false },
  infiniteQuery: { 
    data: { pages: [mockStoryDetails.slice(0, 1)] }, 
    hasNextPage: true,
    isLoading: true,
    isFetchingNextPage: true 
  },
};

// Test utilities
export const createDeadAndDeletedPosts = (): Item[] => [
  ...mockStoryDetails,
  createMockStoryItem({ id: 3, title: 'Dead Story', dead: true }),
  createMockStoryItem({ id: 4, title: 'Deleted Story', deleted: true }),
];

export const createMixedValidityPosts = (): Item[] => [
  createMockStoryItem({ id: 1, dead: true }),
  mockStoryDetails[1],
  createMockStoryItem({ id: 3, deleted: true }),
];

export const createLargeDataset = (size: number): Item[] => 
  Array.from({ length: size }, (_, i) => 
    createMockStoryItem({
      id: i + 1,
      title: `Story ${i + 1}`,
    })
  );

// Scroll event creators
export const createScrollEvent = (yOffset: number, contentHeight = 1000, layoutHeight = 800) => ({
  nativeEvent: {
    contentOffset: { y: yOffset },
    contentSize: { height: contentHeight },
    layoutMeasurement: { height: layoutHeight },
  },
});

export const createEndReachedEvent = (distanceFromEnd = 0) => ({ distanceFromEnd });
