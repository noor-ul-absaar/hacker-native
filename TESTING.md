# Testing Guide

## Overview

Testing setup for the React Native Hacker News app. Uses Jest and React Native Testing Library to test components and functionality.

**Stack**: React Native + Expo, Jest, React Native Testing Library, TypeScript, TanStack React Query

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific tests
npm test -- --testPathPattern=Posts
npm test -- --testPathPattern=Comments

# Run without watch mode
npm test -- --watchAll=false
```

## Test Structure

```
__tests__/
├── Posts.test.tsx         # Posts list with infinite scroll
├── Post.test.tsx          # Individual post component
├── Comments.test.tsx      # Comments with infinite scroll
└── utils/                 # Test utilities and factories
```

## What's Tested

### Posts Component

- Infinite scroll functionality
- Story type filtering (top, best, new, ask, show)
- Loading states and error handling
- Dead/deleted post filtering
- Real scenario testing with actual useInfiniteQuery execution

### Post Component

- Basic rendering (title, score, comments)
- External vs internal links
- Navigation behavior
- Haptic feedback
- Edge cases (missing data, negative scores)

### Comments Component

- Infinite scroll comment loading
- Basic rendering and props validation
- Real scenario testing for pagination edge cases

## My Testing Approach

Test real user scenarios, not implementation details. Focus on what users actually see and do.

**Key Decisions**:

- Used real scenario testing instead of mocking return values
- Captured actual hook configurations and executed real queryFn/getNextPageParam functions
- This ensures tests exercise genuine component code paths vs artificial mocked responses
- Added comprehensive edge case testing for pagination boundaries

**Coverage Strategy**:

- Achieved 100% statement coverage for Posts.tsx and Comments.tsx
- 92.3% branch coverage for core infinite scroll functionality
- 145 total tests across the project

## Key Mocks

**React Query**: Mock useQuery and useInfiniteQuery hooks for controlled test data
**Expo Modules**: Mock expo-router, expo-linking, expo-haptics
**React Native**: Mock FlatList, TouchableOpacity, ActivityIndicator



## Current Coverage

File                  | % Stmts | % Branch | % Funcs | % Lines |
---------------------|---------|----------|---------|---------|
Posts.tsx            |     100 |     92.3 |     100 |     100 |
Comments.tsx         |     100 |     92.3 |     100 |     100 |
Comment.tsx          |     100 |     100  |     100 |     100 |
Post.tsx             |     100 |      100 |     100 |     100 |


## Time Investment

**Total**: ~6 hours across multiple sessions

- Initial test setup: 1 hour
- Basic component tests: 2 hours
- Real scenario testing implementation: 2 hours
- Coverage improvement and edge cases: 1 hour

## Assumptions Made

- The document stated that I should write testcases for posts, post, postDetail, comments, comment.
- I didn't write testcases for files related to User and userActivities because it was not mentioned.
- I didn't write testcases for Search and feedback for because there is no functionality in the application.

## AI and External Help

- **ChatGPT**: Consulted for React Native Testing Library best practices
- **Jest Documentation**: Referenced for advanced mocking patterns
- **React Query Testing Guides**: Used for testing infinite queries properly
- **Stack Overflow**: Looked up solutions for specific React Native testing challenges

**Future Improvements**:

- Add integration tests for component interactions
- Test API error scenarios more thoroughly
- Consider visual regression testing for UI components

---
