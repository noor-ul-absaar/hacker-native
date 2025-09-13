import 'react-native-gesture-handler/jestSetup';

// Mock React Native modules to prevent TurboModule errors
jest.mock('react-native/Libraries/Settings/Settings', () => ({
  get: jest.fn(),
  set: jest.fn(),
  watchKeys: jest.fn(),
  clearWatch: jest.fn(),
}));

// Mock React Query
const mockQueryClient = {
  prefetchQuery: jest.fn().mockResolvedValue(undefined),
  getQueryData: jest.fn(),
  setQueryData: jest.fn(),
  invalidateQueries: jest.fn(),
};

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
  })),
  useInfiniteQuery: jest.fn(() => ({
    data: {
      pages: [],
      pageParams: [],
    },
    isLoading: false,
    isError: false,
    error: null,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: jest.fn(),
    refetch: jest.fn(),
  })),
  useQueryClient: jest.fn(() => mockQueryClient),
  QueryClient: jest.fn(() => mockQueryClient),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({ itemId: '1' })),
  usePathname: jest.fn(() => '/'),
  Stack: {
    Screen: ({ children }: any) => children,
  },
  Link: ({ children }: any) => children,
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock react-native useWindowDimensions and Linking
const mockOpenURL = jest.fn().mockResolvedValue(undefined);
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    useWindowDimensions: jest.fn(() => ({ width: 375, height: 812 })),
    Linking: {
      openURL: mockOpenURL,
    },
  };
});

// Make mockOpenURL available globally for tests
(global as any).mockOpenURL = mockOpenURL;

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({
    top: 44,
    bottom: 34,
    left: 0,
    right: 0,
  })),
  SafeAreaProvider: ({ children }: any) => children,
}));

// Mock react-native-render-html
jest.mock('react-native-render-html', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return function RenderHTML({ source }: any) {
    return React.createElement(Text, { testID: 'html-content' }, source?.html || '');
  };
});

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  MessageSquareText: ({ testID, ...props }: any) => 
    require('react').createElement(require('react-native').Text, { testID: testID || 'message-square-icon', ...props }, '💬'),
  Link2: ({ testID, ...props }: any) => 
    require('react').createElement(require('react-native').Text, { testID: testID || 'link-icon', ...props }, '🔗'),
  ArrowRightIcon: ({ testID, ...props }: any) => 
    require('react').createElement(require('react-native').Text, { testID: testID || 'arrow-right-icon', ...props }, '→'),
  Loader: ({ testID, ...props }: any) => 
    require('react').createElement(require('react-native').Text, { testID: testID || 'loader-icon', ...props }, '⏳'),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNowStrict: jest.fn(() => '2 hours ago'),
}));

// Mock constants files
jest.mock('@/constants/item', () => ({
  getItemDetailsQueryKey: jest.fn((id: number) => ['item', id]),
  getItemQueryFn: jest.fn().mockResolvedValue({}),
}));

// Setup global test utilities
global.fetch = jest.fn();

// Silence warnings
console.warn = jest.fn();
console.error = jest.fn();
