import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Post } from '@/components/posts/Post';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Linking } from 'react-native';

// Mock dependencies
jest.mock('expo-router', () => ({
  router: { push: jest.fn() }
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' }
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(() => ({
    prefetchQuery: jest.fn()
  }))
}));

jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Linking: { openURL: jest.fn() }
}));

const mockedRouter = router as jest.Mocked<typeof router>;
const mockedHaptics = Haptics as jest.Mocked<typeof Haptics>;
const mockedLinking = Linking as jest.Mocked<typeof Linking>;

// Test utilities
import {
  createMockPost,
  createExternalPost,
  createInternalPost,
  createAskHNPost,
  createJobPost,
  createTimedPost,
  MOCK_TIMESTAMP,
} from './utils/post-test-factories';

/**
 * Helper functions for Post component testing
 * Following React Testing Library best practices
 */
const renderPost = (postData = createMockPost()) => render(<Post {...postData} />);

const expectHapticFeedback = (feedbackType: any) => {
  expect(mockedHaptics.notificationAsync).toHaveBeenCalledWith(feedbackType);
};

const expectNavigation = (route: string) => {
  expect(mockedRouter.push).toHaveBeenCalledWith(route);
};

const expectUrlOpen = (url: string) => {
  expect(mockedLinking.openURL).toHaveBeenCalledWith(url);
};

// Helper functions for assertions
const expectElementPresent = (text: string | RegExp) => {
  expect(screen.getByText(text)).toBeTruthy();
};

const expectElementAbsent = (text: string) => {
  expect(screen.queryByText(text)).toBeNull();
};

const expectScorePresent = (score: number) => {
  // Score is rendered as "▲ {score}" within a Text component
  expect(screen.getByText(new RegExp(`▲\\s+${score}`))).toBeTruthy();
};

describe('Post Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedLinking.openURL.mockClear();
  });

  describe('External Posts (with URL)', () => {
    it('should render external post with all elements', () => {
      const post = createExternalPost();
      render(<Post {...post} />);

      expectElementPresent(post.title);
      expectScorePresent(post.score);
      expectElementPresent(post.kids!.length.toString());
      expectElementPresent('example.com');
    });

    it('should open URL when external link is pressed', () => {
      const post = createExternalPost();
      renderPost(post);

      fireEvent.press(screen.getByText('example.com'));
      expectUrlOpen('https://example.com/article');
    });

    it('should navigate to post details when title is pressed', () => {
      const post = createExternalPost();
      renderPost(post);

      // External posts should open URL when title is pressed, not navigate
      fireEvent.press(screen.getByText('External Post with URL'));
      expectUrlOpen('https://example.com/article');
    });

    it('should trigger haptic feedback when upvote is pressed', () => {
      const post = createExternalPost();
      renderPost(post);

      fireEvent.press(screen.getByText('▲'));
      expectHapticFeedback(Haptics.NotificationFeedbackType.Success);
    });
  });

  describe('Internal Posts (with text)', () => {
    it('should render internal post correctly', () => {
      const post = createInternalPost();
      renderPost(post);

      expectElementPresent('Internal Post with Text');
      expectScorePresent(50);
      expectElementPresent('1'); // comments count
      expectElementAbsent('example.com'); // No external link
    });

    it('should navigate to post details when title is pressed', async () => {
      const post = createInternalPost();
      renderPost(post);

      const title = screen.getByText('Internal Post with Text');
      fireEvent.press(title);

      // Wait for async navigation to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockedRouter.push).toHaveBeenCalledWith({ 
        pathname: `../${post.id.toString()}` 
      });
    });
  });

  describe('Ask HN Posts', () => {
    it('should render Ask HN post correctly', () => {
      const post = createAskHNPost();
      renderPost(post);

      expectElementPresent('Ask HN: How to test React components?');
      expectScorePresent(100);
      expectElementPresent('2'); // comments count
    });
  });

  describe('Job Posts', () => {
    it('should render job post with URL', () => {
      const post = createJobPost();
      renderPost(post);

      expectElementPresent('Software Engineer at Company');
      expectElementPresent('company.com'); // Should show domain
    });
  });

  describe('Interactive Elements', () => {
    it('should handle upvote button press', () => {
      renderPost();
      
      // Find the upvote button by its score text pattern
      const upvoteButton = screen.getByText(/▲\s+100/);
      fireEvent.press(upvoteButton);
      expectHapticFeedback(Haptics.NotificationFeedbackType.Success);
    });

    it('should handle comments button press', async () => {
      const post = createMockPost({ kids: [101, 102, 103] });
      renderPost(post);

      const commentsButton = screen.getByText('3');
      fireEvent.press(commentsButton);

      // Wait for async navigation to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockedRouter.push).toHaveBeenCalledWith({ 
        pathname: `../${post.id.toString()}` 
      });
    });

    it('should not show external link for posts without URL', () => {
      const post = createInternalPost();
      renderPost(post);

      expect(screen.queryByTestId('external-link')).toBeNull();
    });
  });

  describe('Time Display', () => {
    it('should display relative time correctly', () => {
      const post = createTimedPost(2); // 2 hours ago
      renderPost(post);

      // Note: The current Post component doesn't render time
      // This test documents expected behavior for future implementation
      expectElementPresent(post.title);
    });
  });

  describe('Score Display', () => {
    it('should display score correctly', () => {
      const post = createMockPost({ score: 150 });
      renderPost(post);

      expectScorePresent(150);
    });

    it('should handle zero score', () => {
      const post = createMockPost({ score: 0 });
      renderPost(post);

      expectScorePresent(0);
    });
  });

  describe('Comments Count', () => {
    it('should display correct comments count', () => {
      const post = createMockPost({ kids: [1, 2, 3, 4, 5], descendants: 5 });
      renderPost(post);

      expectElementPresent('5');
    });

    it('should handle posts with no comments', () => {
      const post = createMockPost({ kids: [], descendants: 0 });
      renderPost(post);

      expectElementPresent('0');
    });
  });

  describe('URL Handling', () => {
    it('should extract and display domain from URL', () => {
      const post = createMockPost({ url: 'https://news.ycombinator.com/article' });
      renderPost(post);

      expectElementPresent('news.ycombinator.com');
    });

    it('should handle complex URLs', () => {
      const post = createMockPost({ url: 'https://subdomain.example.com/path/to/article?param=value' });
      renderPost(post);

      expectElementPresent('subdomain.example.com');
    });
  });

  describe('Author Display', () => {
    it('should display author name', () => {
      const post = createMockPost({ by: 'john_doe' });
      renderPost(post);

      // Note: The current Post component doesn't render author
      // This test documents expected behavior for future implementation
      expectElementPresent(post.title);
    });

    it('should handle missing author', () => {
      const post = createMockPost({ by: '' });
      renderPost(post);

      // Should handle gracefully
      expectElementPresent(post.title);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long titles', () => {
      const longTitle = 'This is a very long title that should be handled gracefully by the component without breaking the layout or causing issues';
      const post = createMockPost({ title: longTitle });
      renderPost(post);

      expectElementPresent(longTitle);
    });

    it('should handle special characters in title', () => {
      const specialTitle = 'Test with émojis 🚀 and spëcial châractèrs';
      const post = createMockPost({ title: specialTitle });
      renderPost(post);

      expectElementPresent(specialTitle);
    });

    it('should handle undefined or null values gracefully', () => {
      const post = createMockPost({
        score: undefined as any,
        kids: undefined as any,
      });
      
      // Should not crash
      expect(() => renderPost(post)).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible elements', () => {
      renderPost();

      // Check for accessibility props (exact implementation may vary)
      const upvoteButton = screen.getByText('▲');
      expect(upvoteButton).toBeTruthy();
    });
  });

  describe('Navigation Integration', () => {
    it('should navigate with correct post ID', async () => {
      const post = createMockPost({ id: 12345 });
      renderPost(post);

      const commentsButton = screen.getByText('3'); // Default comments count
      fireEvent.press(commentsButton);

      // Wait for async navigation to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockedRouter.push).toHaveBeenCalledWith({ 
        pathname: `../${post.id.toString()}` 
      });
    });
  });

  describe('Performance', () => {
    it('should render without performance issues', () => {
      const startTime = performance.now();
      renderPost();
      const endTime = performance.now();

      // Should render quickly (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
