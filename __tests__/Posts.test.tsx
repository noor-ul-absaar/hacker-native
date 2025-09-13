import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { Posts } from '@/components/posts/Posts';
import * as api from '@/api/endpoints';

// Test utilities
import { createMockStoryItems, createDeadStory, createDeletedStory, createLargeDataset } from './utils/test-factories';
import { 
  mockedUseQuery, 
  mockedUseInfiniteQuery,
  mockQueryLoading,
  mockQuerySuccess,
  mockQueryError,
  mockInfiniteQueryLoading,
  mockInfiniteQuerySuccess,
  mockInfiniteQueryWithMore,
  mockInfiniteQueryFetching,
} from './utils/mock-builders';
import { scrollToTop, scrollNearBottom, triggerEndReached } from './utils/scroll-helpers';

// Mock API
jest.mock('@/api/endpoints');
const mockedApi = api as jest.Mocked<typeof api>;

// Test data
const mockStoryIds = [1, 2, 3, 4, 5];
const mockStoryDetails = createMockStoryItems(2);

// Setup helpers
const setupBasicRender = (queryState: any, infiniteQueryState: any) => {
  mockedUseQuery.mockReturnValue(queryState as any);
  mockedUseInfiniteQuery.mockReturnValue(infiniteQueryState as any);
  return render(<Posts storyType="topstories" />);
};

const setupLoadingState = () => 
  setupBasicRender(mockQueryLoading(), mockInfiniteQueryLoading());

const setupSuccessState = () => 
  setupBasicRender(mockQuerySuccess(mockStoryIds), mockInfiniteQuerySuccess([mockStoryDetails]));

const setupErrorState = () => 
  setupBasicRender(mockQueryError(new Error('Network error')), mockQueryError(new Error('Network error')));

const setupInfiniteScrollState = (fetchNextPage = jest.fn()) => {
  const mockData = mockInfiniteQueryWithMore([mockStoryDetails.slice(0, 1)]);
  mockData.fetchNextPage = fetchNextPage;
  return setupBasicRender(mockQuerySuccess(mockStoryIds), mockData);
};

const expectFlatListProp = (propName: string, expectedValue: any) => {
  setupSuccessState();
  const flatList = screen.getByTestId('posts-list');
  expect(flatList.props[propName]).toEqual(expectedValue);
};

describe('Posts Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render loading state initially', () => {
      setupLoadingState();
      expect(screen.getByTestId('activity-indicator')).toBeTruthy();
    });

    it('should render posts after successful API call', () => {
      setupSuccessState();
      expect(screen.getByText('Test Story 1')).toBeTruthy();
      expect(screen.getByText('Test Story 2')).toBeTruthy();
    });

    it('should filter out dead and deleted posts', () => {
      const mockStoriesWithDead = [
        ...mockStoryDetails,
        createDeadStory(3),
        createDeletedStory(4),
      ];

      setupBasicRender(
        mockQuerySuccess([1, 2, 3, 4]),
        mockInfiniteQuerySuccess([mockStoriesWithDead])
      );

      expect(screen.getByText('Test Story 1')).toBeTruthy();
      expect(screen.getByText('Test Story 2')).toBeTruthy();
      expect(screen.queryByText('Dead Story')).toBeNull();
      expect(screen.queryByText('Deleted Story')).toBeNull();
    });
  });

  describe('Infinite Scroll', () => {
    it('loads more posts when scrolling to bottom', async () => {
      const mockFetchNextPage = jest.fn();
      setupInfiniteScrollState(mockFetchNextPage);

      const flatList = screen.getByTestId('posts-list');
      
      expect(flatList.props.data).toHaveLength(1);
      expect(screen.getByText('Test Story 1')).toBeTruthy();
      expect(screen.queryByText('Test Story 2')).toBeNull();

      fireEvent(flatList, 'onEndReached');
      expect(mockFetchNextPage).toHaveBeenCalled();

      mockedUseInfiniteQuery.mockReturnValue(
        mockInfiniteQuerySuccess([
          mockStoryDetails.slice(0, 1), 
          mockStoryDetails.slice(1, 2)
        ]) as any
      );

      const { rerender } = render(<Posts storyType="topstories" />);
      await waitFor(() => {
        expect(screen.getByText('Test Story 1')).toBeTruthy();
        expect(screen.getByText('Test Story 2')).toBeTruthy();
      });
    });

    it('triggers fetch when reaching bottom', () => {
      const mockFetchNextPage = jest.fn();
      setupInfiniteScrollState(mockFetchNextPage);

      fireEvent(screen.getByTestId('posts-list'), 'onEndReached');
      expect(mockFetchNextPage).toHaveBeenCalled();
    });

    it('handles scroll events properly', () => {
      const mockFetchNextPage = jest.fn();
      setupInfiniteScrollState(mockFetchNextPage);

      const flatList = screen.getByTestId('posts-list');
      
      fireEvent.scroll(flatList, scrollToTop());
      fireEvent.scroll(flatList, scrollNearBottom());
      fireEvent(flatList, 'onEndReached', triggerEndReached());

      expect(mockFetchNextPage).toHaveBeenCalled();
    });

    it('shows loading while fetching more', () => {
      const mockFetchNextPage = jest.fn();
      const { rerender } = setupInfiniteScrollState(mockFetchNextPage);

      fireEvent(screen.getByTestId('posts-list'), 'onEndReached');
      expect(mockFetchNextPage).toHaveBeenCalled();

      const fetchingData = mockInfiniteQueryFetching([mockStoryDetails.slice(0, 1)]);
      fetchingData.fetchNextPage = mockFetchNextPage;
      mockedUseInfiniteQuery.mockReturnValue(fetchingData as any);

      rerender(<Posts storyType="topstories" />);
      expect(screen.getByTestId('loading-footer')).toBeTruthy();
    });

    it('stops fetching when no more pages', () => {
      const mockFetchNextPage = jest.fn();
      setupBasicRender(
        mockQuerySuccess(mockStoryIds),
        { ...mockInfiniteQuerySuccess([mockStoryDetails.slice(0, 2)]), fetchNextPage: mockFetchNextPage }
      );

      fireEvent(screen.getByTestId('posts-list'), 'onEndReached');
      expect(mockFetchNextPage).not.toHaveBeenCalled();
    });

    it('sets threshold correctly', () => {
      expectFlatListProp('onEndReachedThreshold', 0.5);
    });
  });

  describe('Loading States', () => {
    it('shows spinner when loading', () => {
      setupBasicRender(mockQueryLoading(), mockInfiniteQueryLoading());
      expect(screen.getByTestId('activity-indicator')).toBeTruthy();
    });

    it('shows posts when data loads', () => {
      setupBasicRender(mockQuerySuccess(mockStoryIds), mockInfiniteQuerySuccess([mockStoryDetails.slice(0, 1)]));
      expect(screen.getByTestId('posts-list')).toBeTruthy();
      expect(screen.getByText('Test Story 1')).toBeTruthy();
    });

    it('shows empty list when no data', () => {
      setupBasicRender(mockQuerySuccess([]), mockInfiniteQuerySuccess([]));
      expect(screen.getByTestId('posts-list')).toBeTruthy();
      expect(screen.getByTestId('posts-list').props.data).toEqual([]);
    });

    it('handles missing data gracefully', () => {
      setupBasicRender(
        { data: undefined, isLoading: false, error: null },
        { data: undefined, pages: [], isLoading: false, error: null, hasNextPage: false, fetchNextPage: jest.fn() }
      );
      expect(screen.getByTestId('posts-list')).toBeTruthy();
      expect(screen.getByTestId('posts-list').props.data).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      setupErrorState();
      expect(screen.queryByText('Test Story 1')).toBeNull();
    });
  });

  describe('Component Features', () => {
    it('has proper accessibility', () => {
      expectFlatListProp('accessibilityRole', 'list');
    });

    it('uses keyExtractor correctly', () => {
      setupSuccessState();
      const flatList = screen.getByTestId('posts-list');
      expect(flatList.props.keyExtractor).toBeDefined();
      
      const key = flatList.props.keyExtractor(mockStoryDetails[0]);
      expect(key).toBe('1');
    });

    it('styles container properly', () => {
      expectFlatListProp('contentContainerStyle', { flexGrow: 1 });
    });

    it('renders separators between items', () => {
      setupSuccessState();
      const flatList = screen.getByTestId('posts-list');
      expect(flatList.props.ItemSeparatorComponent).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    const testEdgeCase = (description: string, queryData: any, infiniteQueryData: any, expectedLength: number) => {
      it(description, () => {
        setupBasicRender(mockQuerySuccess(queryData), mockInfiniteQuerySuccess(infiniteQueryData));
        const flatList = screen.getByTestId('posts-list');
        expect(flatList.props.data).toHaveLength(expectedLength);
      });
    };

    testEdgeCase('handles empty story IDs', [], [[]], 0);
    testEdgeCase('handles partial loading', mockStoryIds, [
      [mockStoryDetails[0]], 
      [mockStoryDetails[1]]
    ], 2);
    
    it('filters out dead and deleted posts', () => {
      const deadPosts = mockStoryDetails.map(post => ({ ...post, dead: true, deleted: true }));
      setupBasicRender(mockQuerySuccess(mockStoryIds), mockInfiniteQuerySuccess([deadPosts]));
      expect(screen.getByTestId('posts-list').props.data).toEqual([]);
    });

    it('handles large datasets', () => {
      const largeDataset = createLargeDataset(50);
      setupBasicRender(
        mockQuerySuccess(largeDataset.map(story => story.id)),
        mockInfiniteQuerySuccess([largeDataset])
      );
      
      const flatList = screen.getByTestId('posts-list');
      expect(flatList.props.data).toHaveLength(50);
      expect(flatList.props.keyExtractor(flatList.props.data[0])).toBe('1');
      expect(flatList.props.keyExtractor(flatList.props.data[49])).toBe('50');
    });
  });

  describe('useInfiniteQuery Edge Cases', () => {
    it('handles null storyListQuery data', async () => {
      mockedUseQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      let capturedConfig: any;
      mockedUseInfiniteQuery.mockImplementation((config) => {
        capturedConfig = config;
        
        return {
          data: undefined,
          hasNextPage: false,
          fetchNextPage: jest.fn(),
          isLoading: false,
          error: null,
          isError: false,
        } as any;
      });

      render(<Posts storyType="topstories" />);

      expect(capturedConfig.enabled).toBe(false);

      if (capturedConfig?.queryFn) {
        const result = await capturedConfig.queryFn({ pageParam: 0 });
        expect(result).toEqual([]);
      }
    });

    it('calculates correct pagination params', () => {
      const mockStoryIds = Array.from({ length: 50 }, (_, i) => i + 1);
      
      mockedUseQuery.mockReturnValue({
        data: mockStoryIds,
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      let capturedConfig: any;
      mockedUseInfiniteQuery.mockImplementation((config) => {
        capturedConfig = config;
        
        return {
          data: {
            pages: [mockStoryDetails.slice(0, 10)],
            pageParams: [0],
          },
          hasNextPage: true,
          fetchNextPage: jest.fn(),
          isLoading: false,
          error: null,
          isError: false,
        } as any;
      });

      render(<Posts storyType="topstories" />);

      expect(capturedConfig?.getNextPageParam).toBeDefined();
      
      if (capturedConfig?.getNextPageParam) {
        const nextParam1 = capturedConfig.getNextPageParam([], [mockStoryDetails.slice(0, 10)]);
        expect(nextParam1).toBe(10);

        const nextParam2 = capturedConfig.getNextPageParam([], [
          mockStoryDetails.slice(0, 10),
          mockStoryDetails.slice(10, 20)
        ]);
        expect(nextParam2).toBe(20);

        const nextParam3 = capturedConfig.getNextPageParam([], [
          mockStoryDetails.slice(0, 10),
          mockStoryDetails.slice(10, 20),
          mockStoryDetails.slice(20, 30),
          mockStoryDetails.slice(30, 40),
          mockStoryDetails.slice(40, 50)
        ]);
        expect(nextParam3).toBeUndefined();
      }
    });

    it('tests actual queryFn with page slicing', async () => {
      const mockStoryIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
      
      mockedUseQuery.mockReturnValue({
        data: mockStoryIds,
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      mockedApi.getItemDetails.mockImplementation((id) => 
        Promise.resolve({
          json: () => Promise.resolve({ id, title: `Story ${id}` })
        }) as any
      );

      let capturedConfig: any;
      mockedUseInfiniteQuery.mockImplementation((config) => {
        capturedConfig = config;
        
        return {
          data: { pages: [], pageParams: [] },
          hasNextPage: true,
          fetchNextPage: jest.fn(),
          isLoading: false,
          error: null,
          isError: false,
        } as any;
      });

      render(<Posts storyType="topstories" />);

      expect(capturedConfig?.queryFn).toBeDefined();
      
      if (capturedConfig?.queryFn) {
        jest.clearAllMocks();
        const page1Result = await capturedConfig.queryFn({ pageParam: 0 });
        expect(mockedApi.getItemDetails).toHaveBeenCalledTimes(10);
        expect(mockedApi.getItemDetails).toHaveBeenCalledWith(1);
        expect(mockedApi.getItemDetails).toHaveBeenCalledWith(10);

        jest.clearAllMocks();
        const page2Result = await capturedConfig.queryFn({ pageParam: 10 });
        expect(mockedApi.getItemDetails).toHaveBeenCalledTimes(5);
        expect(mockedApi.getItemDetails).toHaveBeenCalledWith(11);
        expect(mockedApi.getItemDetails).toHaveBeenCalledWith(15);
      }
    });

    it('should return empty array when storyListQuery.data is null in real queryFn execution', async () => {
      mockedUseQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      let capturedConfig: any;
      mockedUseInfiniteQuery.mockImplementation((config) => {
        capturedConfig = config;
        
        return {
          data: undefined,
          hasNextPage: false,
          fetchNextPage: jest.fn(),
          isLoading: false,
          error: null,
          isError: false,
        } as any;
      });

      render(<Posts storyType="topstories" />);

      if (capturedConfig?.queryFn) {
        const result = await capturedConfig.queryFn({ pageParam: 0 });
        expect(result).toEqual([]);
        expect(mockedApi.getItemDetails).not.toHaveBeenCalled();
      }
    });

    it('should return undefined from getNextPageParam when storyListQuery.data is null', () => {
      // Set storyListQuery.data to null to trigger the if (!storyListQuery.data) return undefined; path
      mockedUseQuery.mockReturnValue({
        data: null, // This will trigger the if (!storyListQuery.data) return undefined; path
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      let capturedConfig: any;
      mockedUseInfiniteQuery.mockImplementation((config) => {
        capturedConfig = config;
        
        return {
          data: undefined,
          hasNextPage: false,
          fetchNextPage: jest.fn(),
          isLoading: false,
          error: null,
          isError: false,
        } as any;
      });

      render(<Posts storyType="topstories" />);

      // Test the actual getNextPageParam function that was passed to useInfiniteQuery
      expect(capturedConfig?.getNextPageParam).toBeDefined();
      
      if (capturedConfig?.getNextPageParam) {
        // Call getNextPageParam when storyListQuery.data is null
        const result = capturedConfig.getNextPageParam([], [mockStoryDetails.slice(0, 10)]);
        
        // Should return undefined when storyListQuery.data is null
        expect(result).toBeUndefined();
      }
    });

    it('should return undefined from getNextPageParam when storyListQuery.data is undefined', () => {
      // Set storyListQuery.data to undefined to trigger the if (!storyListQuery.data) return undefined; path
      mockedUseQuery.mockReturnValue({
        data: undefined, // This will trigger the if (!storyListQuery.data) return undefined; path
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      let capturedConfig: any;
      mockedUseInfiniteQuery.mockImplementation((config) => {
        capturedConfig = config;
        
        return {
          data: undefined,
          hasNextPage: false,
          fetchNextPage: jest.fn(),
          isLoading: false,
          error: null,
          isError: false,
        } as any;
      });

      render(<Posts storyType="topstories" />);

      // Test the actual getNextPageParam function that was passed to useInfiniteQuery
      expect(capturedConfig?.getNextPageParam).toBeDefined();
      
      if (capturedConfig?.getNextPageParam) {
        // Call getNextPageParam when storyListQuery.data is undefined
        const result = capturedConfig.getNextPageParam([], [mockStoryDetails.slice(0, 10)]);
        
        // Should return undefined when storyListQuery.data is undefined
        expect(result).toBeUndefined();
      }
    });
  });

  describe('storyListQuery Edge Cases', () => {
    it('should test actual storyListQuery queryFn execution for topstories', async () => {
      const mockStoryIds = [1, 2, 3, 4, 5];
      
      mockedApi.getTopStories.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockStoryIds),
      } as any);

      let capturedStoryListConfig: any;
      mockedUseQuery.mockImplementation((config) => {
        capturedStoryListConfig = config;
        
        return {
          data: mockStoryIds,
          isLoading: false,
          error: null,
          isError: false,
        } as any;
      });

      mockedUseInfiniteQuery.mockReturnValue({
        data: { pages: [mockStoryDetails], pageParams: [0] },
        hasNextPage: false,
        fetchNextPage: jest.fn(),
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      render(<Posts storyType="topstories" />);

      expect(capturedStoryListConfig?.queryFn).toBeDefined();
      
      if (capturedStoryListConfig?.queryFn) {
        const result = await capturedStoryListConfig.queryFn();
        
        expect(mockedApi.getTopStories).toHaveBeenCalled();
        expect(result).toEqual(mockStoryIds);
      }
    });

    it('should test actual storyListQuery queryFn execution for beststories', async () => {
      const mockStoryIds = [10, 11, 12, 13, 14];
      
      mockedApi.getBestStories.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockStoryIds),
      } as any);

      let capturedStoryListConfig: any;
      mockedUseQuery.mockImplementation((config) => {
        capturedStoryListConfig = config;
        
        return {
          data: mockStoryIds,
          isLoading: false,
          error: null,
          isError: false,
        } as any;
      });

      mockedUseInfiniteQuery.mockReturnValue({
        data: { pages: [mockStoryDetails], pageParams: [0] },
        hasNextPage: false,
        fetchNextPage: jest.fn(),
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      render(<Posts storyType="beststories" />);

      expect(capturedStoryListConfig?.queryFn).toBeDefined();
      
      if (capturedStoryListConfig?.queryFn) {
        const result = await capturedStoryListConfig.queryFn();
        
        expect(mockedApi.getBestStories).toHaveBeenCalled();
        expect(result).toEqual(mockStoryIds);
      }
    });

    it('should test actual storyListQuery queryFn execution for askstories', async () => {
      const mockStoryIds = [20, 21, 22, 23, 24];
      
      mockedApi.getAskStories.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockStoryIds),
      } as any);

      let capturedStoryListConfig: any;
      mockedUseQuery.mockImplementation((config) => {
        capturedStoryListConfig = config;
        
        return {
          data: mockStoryIds,
          isLoading: false,
          error: null,
          isError: false,
        } as any;
      });

      mockedUseInfiniteQuery.mockReturnValue({
        data: { pages: [mockStoryDetails], pageParams: [0] },
        hasNextPage: false,
        fetchNextPage: jest.fn(),
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      render(<Posts storyType="askstories" />);

      expect(capturedStoryListConfig?.queryFn).toBeDefined();
      
      if (capturedStoryListConfig?.queryFn) {
        const result = await capturedStoryListConfig.queryFn();
        
        expect(mockedApi.getAskStories).toHaveBeenCalled();
        expect(result).toEqual(mockStoryIds);
      }
    });

    it('should test actual storyListQuery queryFn execution for showstories', async () => {
      const mockStoryIds = [30, 31, 32, 33, 34];
      
      mockedApi.getShowStories.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockStoryIds),
      } as any);

      let capturedStoryListConfig: any;
      mockedUseQuery.mockImplementation((config) => {
        capturedStoryListConfig = config;
        
        return {
          data: mockStoryIds,
          isLoading: false,
          error: null,
          isError: false,
        } as any;
      });

      mockedUseInfiniteQuery.mockReturnValue({
        data: { pages: [mockStoryDetails], pageParams: [0] },
        hasNextPage: false,
        fetchNextPage: jest.fn(),
        isLoading: false,
        error: null,
        isError: false,
      } as any);

      render(<Posts storyType="showstories" />);

      expect(capturedStoryListConfig?.queryFn).toBeDefined();
      
      if (capturedStoryListConfig?.queryFn) {
        const result = await capturedStoryListConfig.queryFn();
        
        expect(mockedApi.getShowStories).toHaveBeenCalled();
        expect(result).toEqual(mockStoryIds);
      }
    });
  });
});
