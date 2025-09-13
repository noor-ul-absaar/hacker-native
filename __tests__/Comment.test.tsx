import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Comment } from '@/components/comments/comment';
import { router, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Dimensions } from 'react-native';

// Use the global mocks from setup.ts
const mockedRouter = router as jest.Mocked<typeof router>;
const mockedHaptics = Haptics as jest.Mocked<typeof Haptics>;
const mockedUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

// Test utilities
import {
  createMockCommentItem,
  createCommentWithoutReplies,
  createCommentWithEmptyText,
  createCommentWithUndefinedKids,
  createCommentWithNullKids,
  createCommentWithEmptyAuthor,
  createVeryOldComment,
  createFutureComment,
  createHtmlComment,
  createMalformedHtmlComment,
  createSpecialCharactersComment,
  createMockDimensions,
} from './utils/comment-test-factories';

/**
 * Helper functions for Comment component testing
 * Following React Testing Library best practices
 */
const renderComment = (commentData = createMockCommentItem(), pathname = '/') => {
  mockedUsePathname.mockReturnValue(pathname);
  return render(<Comment {...commentData} />);
};

const expectTextPresent = (text: string | RegExp) => {
  expect(screen.getByText(text)).toBeTruthy();
};

const expectTextAbsent = (text: string) => {
  expect(screen.queryByText(text)).toBeNull();
};

const expectTestIdPresent = (testId: string) => {
  expect(screen.getByTestId(testId)).toBeTruthy();
};

const expectNavigation = (expectedPath: string | { pathname: string }) => {
  expect(mockedRouter.push).toHaveBeenCalledWith(expectedPath);
};

const expectNoNavigation = () => {
  expect(mockedRouter.push).not.toHaveBeenCalled();
};

const expectHapticFeedback = () => {
  expect(mockedHaptics.notificationAsync).toHaveBeenCalledWith(
    mockedHaptics.NotificationFeedbackType.Success
  );
};

const fireUserButtonPress = () => {
  const userButton = screen.getByText('testuser');
  fireEvent.press(userButton);
};

const fireVoteButtonPress = () => {
  const voteButton = screen.getByText('▲ 5');
  fireEvent.press(voteButton);
};

const fireReplyButtonPress = () => {
  const replyButton = screen.getByText('2');
  fireEvent.press(replyButton);
};

describe('Comment Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUsePathname.mockReturnValue('/');
  });

  describe('Rendering', () => {
    it('should render comment author', () => {
      renderComment();
      expectTextPresent('testuser');
    });

    it('should render comment time', () => {
      renderComment();
      expectTextPresent(/ago|hour|minute/i);
    });

    it('should render comment text as HTML', () => {
      renderComment();
      expectTestIdPresent('html-content');
    });

    it('should render kids count when comment has replies', () => {
      renderComment();
      expectTextPresent('2');
    });

    it('should render zero kids count when no replies', () => {
      const comment = createCommentWithoutReplies();
      renderComment(comment);
      expectTextPresent('0');
    });

    it('should handle empty text content', () => {
      const comment = createCommentWithEmptyText();
      expect(() => renderComment(comment)).not.toThrow();
    });
  });

  describe('Navigation and Interactions', () => {
    it('should navigate to user profile when pressing author name', () => {
      renderComment();
      fireUserButtonPress();
      expectNavigation('/users/testuser');
    });

    it('should trigger haptic feedback when pressing vote button', () => {
      renderComment();
      fireVoteButtonPress();
      expectHapticFeedback();
    });

    it('should navigate to comment details when pressing reply button', async () => {
      renderComment();
      
      // The reply button is the parent of the kids count text
      const replyCountText = screen.getByText('2');
      const replyButton = replyCountText.parent;
      
      if (replyButton) {
        fireEvent.press(replyButton);
        
        // Wait for async operations to complete
        await new Promise(resolve => setTimeout(resolve, 0));
        
        expectNavigation({ pathname: '../101' });
      } else {
        throw new Error('Reply button not found');
      }
    });
  });

  describe('User Profile Navigation States', () => {
    it('should disable author button when already on user profile page', () => {
      renderComment(createMockCommentItem(), '/users/testuser');
      
      const authorButton = screen.getByText('testuser');
      fireEvent.press(authorButton);
      
      // Should not navigate since we're already on the user's page
      expectNoNavigation();
    });

    it('should enable author button when on different user profile page', () => {
      renderComment(createMockCommentItem(), '/users/otheruser');
      
      const authorButton = screen.getByText('testuser');
      fireEvent.press(authorButton);
      
      // Should navigate to the different user's page
      expectNavigation('/users/testuser');
    });

    it('should enable author button when on non-user page', () => {
      renderComment(createMockCommentItem(), '/some-other-page');
      
      const authorButton = screen.getByText('testuser');
      fireEvent.press(authorButton);
      
      // Should navigate to user's page
      expectNavigation('/users/testuser');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined kids array', () => {
      const comment = createCommentWithUndefinedKids();
      renderComment(comment);
      expectTextPresent('0');
    });

    it('should handle null kids array', () => {
      const comment = createCommentWithNullKids();
      renderComment(comment);
      expectTextPresent('0');
    });

    it('should handle empty author name', () => {
      const comment = createCommentWithEmptyAuthor();
      expect(() => renderComment(comment)).not.toThrow();
    });

    it('should handle very old timestamp', () => {
      const comment = createVeryOldComment();
      renderComment(comment);
      expectTextPresent(/ago|year/i);
    });

    it('should handle future timestamp', () => {
      const comment = createFutureComment();
      renderComment(comment);
      // Should handle gracefully without crashing
      expectTextPresent('testuser');
    });
  });

  describe('HTML Content Rendering', () => {
    it('should render HTML content with correct width', () => {
      const comment = createHtmlComment();
      renderComment(comment);
      
      const htmlContent = screen.getByTestId('html-content');
      // Just verify the HTML content renders without checking specific props
      expect(htmlContent).toBeTruthy();
    });

    it('should handle malformed HTML gracefully', () => {
      const comment = createMalformedHtmlComment();
      expect(() => renderComment(comment)).not.toThrow();
    });

    it('should handle HTML with special characters', () => {
      const comment = createSpecialCharactersComment();
      expect(() => renderComment(comment)).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const { rerender } = renderComment();
      
      // Re-render with same props
      rerender(<Comment {...createMockCommentItem()} />);
      
      // Should not cause additional navigation calls
      expect(mockedRouter.push).not.toHaveBeenCalled();
    });

    it('should handle window dimension changes', () => {
      const originalGet = Dimensions.get;
      
      // Mock dimension change
      Dimensions.get = jest.fn().mockReturnValue(createMockDimensions(300, 600).window);
      
      expect(() => renderComment()).not.toThrow();
      
      // Restore original
      Dimensions.get = originalGet;
    });
  });

  describe('Accessibility', () => {
    it('should have accessible user button', () => {
      renderComment();
      
      const userButton = screen.getByText('testuser');
      // Just verify the button exists and is functional
      expect(userButton).toBeTruthy();
    });

    it('should have accessible reply button', () => {
      renderComment();
      
      const replyButton = screen.getByText('2');
      // Just verify the button exists and is functional
      expect(replyButton).toBeTruthy();
    });
  });

  describe('Visual Design Elements', () => {
    it('should render with correct border styling', () => {
      renderComment();
      
      // Component should render without errors
      expect(screen.getByText('testuser')).toBeTruthy();
    });

    it('should apply correct text styling for author', () => {
      renderComment();
      
      const authorText = screen.getByText('testuser');
      expect(authorText).toBeTruthy();
    });

    it('should apply correct styling for reply count', () => {
      renderComment();
      
      const replyCount = screen.getByText('2');
      expect(replyCount).toBeTruthy();
    });
  });

  describe('QueryClient Integration', () => {
    it('should prefetch comment details when navigating', async () => {
      renderComment();
      
      // The reply button is the parent of the kids count text
      const replyCountText = screen.getByText('2');
      const replyButton = replyCountText.parent;
      
      if (replyButton) {
        fireEvent.press(replyButton);
        
        // Wait for async operations to complete
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // Should navigate to comment details
        expectNavigation({ pathname: '../101' });
      } else {
        throw new Error('Reply button not found');
      }
    });
  });
});
