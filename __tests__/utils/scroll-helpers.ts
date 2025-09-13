/**
 * Test utilities for scroll and event simulation
 * Following patterns from React Testing Library and Jest community
 */

export const createScrollEvent = (yOffset: number, contentHeight = 1000, layoutHeight = 800) => ({
  nativeEvent: {
    contentOffset: { y: yOffset },
    contentSize: { height: contentHeight },
    layoutMeasurement: { height: layoutHeight },
  },
});

export const createEndReachedEvent = (distanceFromEnd = 0) => ({ distanceFromEnd });

// Common scroll positions
export const SCROLL_POSITIONS = {
  TOP: 0,
  MIDDLE: 400,
  NEAR_BOTTOM: 700,
  BOTTOM: 1000,
} as const;

// Event creators with semantic names
export const scrollToTop = () => createScrollEvent(SCROLL_POSITIONS.TOP);
export const scrollToMiddle = () => createScrollEvent(SCROLL_POSITIONS.MIDDLE);
export const scrollNearBottom = () => createScrollEvent(SCROLL_POSITIONS.NEAR_BOTTOM);
export const scrollToBottom = () => createScrollEvent(SCROLL_POSITIONS.BOTTOM);

export const triggerEndReached = (distanceFromEnd = 50) => createEndReachedEvent(distanceFromEnd);
