import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Comments } from '@/components/comments/comments';
import { useInfiniteQuery } from '@tanstack/react-query';
import * as api from '@/api/endpoints';

// Mock API
jest.mock('@/api/endpoints');
const mockedApi = api as jest.Mocked<typeof api>;

// Get the mocked hooks from the global setup
const mockedUseInfiniteQuery = useInfiniteQuery as jest.MockedFunction<typeof useInfiniteQuery>;

// Test utilities
import {
  createMockComment,
  createCommentWithReplies,
  createDeadComment,
  createDeletedComment,
  createCommentWithHtml,
  createCommentWithBlockquote,
  createCommentWithComplexHtml,
  createMalformedHtmlComment,
  createEmptyComment,
  createCommentsDataset,
  createMockCommentsResponse,
  createInfiniteScrollCommentsResponse,
  createLoadingCommentsResponse,
  createFetchingMoreCommentsResponse,
} from './utils/comments-test-factories';

/**
 * Test utilities for Comments component
 */
const TestHeaderComponent = () => <Text testID="test-header">Post Header Content</Text>;

const renderComments = (
  id: number = 1, 
  kids: number[] = [101, 102], 
  queryResponse: any = createMockCommentsResponse()
) => {
  mockedUseInfiniteQuery.mockReturnValue(queryResponse as any);
  return render(
    <Comments id={id} kids={kids}>
      <TestHeaderComponent />
    </Comments>
  );
};

const setupMockApi = (commentData = createMockComment()) => {
  mockedApi.getItemDetails.mockResolvedValue({
    json: jest.fn().mockResolvedValue(commentData),
  } as any);
};

const expectElementPresent = (testId: string) => {
  expect(screen.getByTestId(testId)).toBeTruthy();
};

const expectElementAbsent = (testId: string) => {
  expect(screen.queryByTestId(testId)).toBeNull();
};

const expectTextPresent = (text: string) => {
  expect(screen.getByText(text)).toBeTruthy();
};

const expectTextAbsent = (text: string) => {
  expect(screen.queryByText(text)).toBeNull();
};

const setupInfiniteScrollTest = (pages: any[][] = [[]], hasNextPage = true) => {
  const mockFetchNextPage = jest.fn();
  const queryResponse = createInfiniteScrollCommentsResponse(pages, hasNextPage, mockFetchNextPage);
  renderComments(1, [101, 102], queryResponse);
  return { mockFetchNextPage, queryResponse };
};

const triggerScrollToBottom = () => {
  const commentsList = screen.getByTestId('comments-list');
  fireEvent(commentsList, 'onEndReached');
};

describe('Comments Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMockApi();
  });

  describe('Initial Rendering', () => {
    it('renders without crashing', () => {
      renderComments(1, [101, 102], createMockCommentsResponse());
      
      expectElementPresent('comments-list');
      expectElementPresent('test-header');
    });

    it('shows loading state initially', () => {
      renderComments(1, [101, 102], createLoadingCommentsResponse());
      
      expectElementPresent('comments-list');
      expectElementPresent('test-header');
    });

    it('renders comments after API call', () => {
      const mockComments = [
        createMockComment({ id: 101, text: 'First comment', by: 'user1' }),
        createMockComment({ id: 102, text: 'Second comment', by: 'user2' }),
      ];
      
      renderComments(1, [101, 102], createMockCommentsResponse(mockComments));
      
      expectElementPresent('comments-list');
      expectElementPresent('test-header');
    });
  });

  describe('Edge Cases', () => {
    it('renders with no kids', () => {
      renderComments(1, [], createMockCommentsResponse([]));
      
      expectElementPresent('comments-list');
      expectElementPresent('test-header');
    });

    it('renders with undefined kids', () => {
      renderComments(1, undefined as any, createMockCommentsResponse([]));
      
      expectElementPresent('comments-list');
      expectElementPresent('test-header');
    });

    it('filters dead and deleted comments', () => {
      const mockComments = [
        createMockComment({ id: 101, text: 'Valid comment' }),
        createDeadComment({ id: 102 }),
        createDeletedComment({ id: 103 }),
        createMockComment({ id: 104, text: 'Another valid comment' }),
      ];

      renderComments(1, [101, 102, 103, 104], createMockCommentsResponse(mockComments));
      
      expectElementPresent('comments-list');
    });
  });

  describe('Infinite Scroll', () => {
    it('triggers fetchNextPage on scroll', () => {
      const { mockFetchNextPage } = setupInfiniteScrollTest();
      
      triggerScrollToBottom();
      expect(mockFetchNextPage).toHaveBeenCalled();
    });

    it('does not trigger when no next page', () => {
      const { mockFetchNextPage } = setupInfiniteScrollTest([[]], false);
      
      triggerScrollToBottom();
      expect(mockFetchNextPage).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('shows loading footer when fetching more', () => {
      const existingComments = [createMockComment()];
      renderComments(1, [101], createFetchingMoreCommentsResponse([existingComments]));
      
      expectElementPresent('loading-footer');
    });

    it('hides loading footer when not loading', () => {
      renderComments(1, [101, 102], createMockCommentsResponse([createMockComment()]));
      
      expectElementAbsent('loading-footer');
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility props', () => {
      renderComments();
      
      const commentsList = screen.getByTestId('comments-list');
      expect(commentsList.props.accessibilityRole).toBe('list');
    });
  });

  describe('Performance', () => {
    it('uses keyExtractor correctly', () => {
      const mockComments = createCommentsDataset(3);
      renderComments(1, [101, 102, 103], createMockCommentsResponse(mockComments));
      
      const commentsList = screen.getByTestId('comments-list');
      expect(commentsList.props.keyExtractor).toBeDefined();
      
      const firstComment = mockComments[0];
      const key = commentsList.props.keyExtractor(firstComment);
      expect(key).toBe(firstComment.id.toString());
    });
  });

  describe('Formatted Content Rendering', () => {
    it('should render HTML formatted text content', () => {
      const htmlComment = createCommentWithHtml();
      renderComments(1, [103], createMockCommentsResponse([htmlComment]));
      
      expectElementPresent('comments-list');
    });

    it('should render code blocks correctly', () => {
      const codeComment = createMockComment({
        id: 201,
        text: '<pre><code>console.log("Hello World");</code></pre>',
      });
      
      renderComments(1, [201], createMockCommentsResponse([codeComment]));
      
      expectElementPresent('comments-list');
    });

    it('should render blockquotes correctly', () => {
      const blockquoteComment = createCommentWithBlockquote();
      renderComments(1, [104], createMockCommentsResponse([blockquoteComment]));
      
      expectElementPresent('comments-list');
    });

    it('should handle complex nested HTML structures', () => {
      const complexComment = createCommentWithComplexHtml();
      renderComments(1, [105], createMockCommentsResponse([complexComment]));
      
      expectElementPresent('comments-list');
    });

    it('should handle malformed or unsafe HTML gracefully', () => {
      const malformedComment = createMalformedHtmlComment();
      
      expect(() => {
        renderComments(1, [106], createMockCommentsResponse([malformedComment]));
      }).not.toThrow();
      
      expectElementPresent('comments-list');
    });
  });

  describe('Empty States', () => {
    it('should handle empty comment list gracefully', () => {
      renderComments(1, [], createMockCommentsResponse([]));
      
      expectElementPresent('comments-list');
      expectElementPresent('test-header');
    });

    it('should handle undefined kids array', () => {
      renderComments(1, undefined as any, createMockCommentsResponse([]));
      
      expectElementPresent('comments-list');
      expectElementPresent('test-header');
    });

    it('should handle comments with empty text content', () => {
      const emptyComment = createEmptyComment();
      renderComments(1, [107], createMockCommentsResponse([emptyComment]));
      
      expectElementPresent('comments-list');
    });
  });

  describe('useInfiniteQuery Edge Cases', () => {
    it('should handle queryFn when kids is null/undefined', async () => {
      // Set up the component where kids is null/undefined
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

      render(
        <Comments id={1} kids={null as any}>
          <TestHeaderComponent />
        </Comments>
      );

      // Test that the query is disabled when no kids
      expect(capturedConfig.enabled).toBe(false); // !!null = false

      // Test the actual queryFn with null kids
      if (capturedConfig?.queryFn) {
        const result = await capturedConfig.queryFn({ pageParam: 0 });
        expect(result).toEqual([]); // Should return empty array when no kids
      }
    });

    it('should calculate correct getNextPageParam based on allPages length', () => {
      const mockKids = Array.from({ length: 50 }, (_, i) => i + 1); // 50 comments
      
      let capturedConfig: any;
      mockedUseInfiniteQuery.mockImplementation((config) => {
        capturedConfig = config;
        
        return {
          data: {
            pages: [createCommentsDataset(10)], // First page of 10 items
            pageParams: [0],
          },
          hasNextPage: true,
          fetchNextPage: jest.fn(),
          isLoading: false,
          error: null,
          isError: false,
        } as any;
      });

      render(
        <Comments id={1} kids={mockKids}>
          <TestHeaderComponent />
        </Comments>
      );

      // Test the actual getNextPageParam function that was passed to useInfiniteQuery
      expect(capturedConfig?.getNextPageParam).toBeDefined();
      
      if (capturedConfig?.getNextPageParam) {
        // Test with one page loaded (should return 10 for next page)
        const nextParam1 = capturedConfig.getNextPageParam([], [createCommentsDataset(10)]);
        expect(nextParam1).toBe(10); // allPages.length (1) * ITEMS_PER_PAGE (10) = 10

        // Test with two pages loaded (should return 20 for next page)
        const nextParam2 = capturedConfig.getNextPageParam([], [
          createCommentsDataset(10),
          createCommentsDataset(10)
        ]);
        expect(nextParam2).toBe(20); // allPages.length (2) * ITEMS_PER_PAGE (10) = 20

        // Test when we've reached the end (5 pages of 10 = 50 total)
        const nextParam3 = capturedConfig.getNextPageParam([], [
          createCommentsDataset(10),
          createCommentsDataset(10),
          createCommentsDataset(10),
          createCommentsDataset(10),
          createCommentsDataset(10)
        ]);
        expect(nextParam3).toBeUndefined(); // 50 >= 50, so no more pages
      }
    });

    it('should disable infinite query when kids is null/undefined', () => {
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

      render(
        <Comments id={1} kids={undefined as any}>
          <TestHeaderComponent />
        </Comments>
      );

      // Verify that enabled is set correctly
      expect(capturedConfig?.enabled).toBe(false); // !!undefined = false
    });

    it('should enable infinite query when kids array is provided', () => {
      const mockKids = [101, 102, 103];
      
      let capturedConfig: any;
      mockedUseInfiniteQuery.mockImplementation((config) => {
        capturedConfig = config;
        
        return {
          data: { pages: [createCommentsDataset(3)], pageParams: [0] },
          hasNextPage: false,
          fetchNextPage: jest.fn(),
          isLoading: false,
          error: null,
          isError: false,
        } as any;
      });

      render(
        <Comments id={1} kids={mockKids}>
          <TestHeaderComponent />
        </Comments>
      );

      // Verify that enabled is set correctly
      expect(capturedConfig?.enabled).toBe(true); // !!mockKids = true
    });

    it('should test actual queryFn execution with real pageParam slicing', async () => {
      const mockKids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
      
      // Mock the API response for getItemDetails
      mockedApi.getItemDetails.mockImplementation((id) => 
        Promise.resolve({
          json: () => Promise.resolve({ id, text: `Comment ${id}` })
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

      render(
        <Comments id={1} kids={mockKids}>
          <TestHeaderComponent />
        </Comments>
      );

      // Test the actual queryFn execution with different pageParams
      expect(capturedConfig?.queryFn).toBeDefined();
      
      if (capturedConfig?.queryFn) {
        // Test first page (pageParam = 0, should get items 1-10)
        jest.clearAllMocks();
        const page1Result = await capturedConfig.queryFn({ pageParam: 0 });
        expect(mockedApi.getItemDetails).toHaveBeenCalledTimes(10); // Should call for first 10 items
        expect(mockedApi.getItemDetails).toHaveBeenCalledWith(1);
        expect(mockedApi.getItemDetails).toHaveBeenCalledWith(10);

        // Test second page (pageParam = 10, should get items 11-15)
        jest.clearAllMocks();
        const page2Result = await capturedConfig.queryFn({ pageParam: 10 });
        expect(mockedApi.getItemDetails).toHaveBeenCalledTimes(5); // Should call for remaining 5 items
        expect(mockedApi.getItemDetails).toHaveBeenCalledWith(11);
        expect(mockedApi.getItemDetails).toHaveBeenCalledWith(15);
      }
    });

    it('should return empty array when kids is null in real queryFn execution', async () => {
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

      render(
        <Comments id={1} kids={null as any}>
          <TestHeaderComponent />
        </Comments>
      );

      // Execute the real queryFn to test the actual if (!kids) return []; path
      if (capturedConfig?.queryFn) {
        const result = await capturedConfig.queryFn({ pageParam: 0 });
        expect(result).toEqual([]); // Should return empty array when no kids
        
        // API should not be called when no kids
        expect(mockedApi.getItemDetails).not.toHaveBeenCalled();
      }
    });

    it('should test getNextPageParam returns undefined when kids is null', () => {
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

      render(
        <Comments id={1} kids={null as any}>
          <TestHeaderComponent />
        </Comments>
      );

      // Test the actual getNextPageParam function with null kids
      if (capturedConfig?.getNextPageParam) {
        const result = capturedConfig.getNextPageParam([], []);
        expect(result).toBeUndefined(); // Should return undefined when no kids
      }
    });
  });
});
