import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

/**
 * Mock builders following the Builder pattern
 * Inspired by testing patterns from Stripe, Airbnb, etc.
 */

export const mockedUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
export const mockedUseInfiniteQuery = useInfiniteQuery as jest.MockedFunction<typeof useInfiniteQuery>;

// Query state builders - Builder pattern
export class QueryStateBuilder {
  private state: any = {
    data: undefined,
    isLoading: false,
    error: null,
    isError: false,
  };

  loading() {
    this.state.isLoading = true;
    this.state.data = undefined;
    return this;
  }

  success(data: any) {
    this.state.data = data;
    this.state.isLoading = false;
    this.state.error = null;
    this.state.isError = false;
    return this;
  }

  error(error: Error) {
    this.state.error = error;
    this.state.isError = true;
    this.state.isLoading = false;
    this.state.data = undefined;
    return this;
  }

  build() {
    return this.state;
  }
}

export class InfiniteQueryStateBuilder {
  private state: any = {
    data: undefined,
    hasNextPage: false,
    fetchNextPage: jest.fn(),
    isLoading: false,
    isFetchingNextPage: false,
    error: null,
    isError: false,
  };

  loading() {
    this.state.isLoading = true;
    return this;
  }

  fetchingNextPage() {
    this.state.isFetchingNextPage = true;
    this.state.isLoading = true;
    return this;
  }

  success(pages: any[]) {
    this.state.data = { pages };
    this.state.isLoading = false;
    this.state.error = null;
    this.state.isError = false;
    return this;
  }

  hasMore(hasNextPage = true) {
    this.state.hasNextPage = hasNextPage;
    return this;
  }

  withFetchFunction(fn = jest.fn()) {
    this.state.fetchNextPage = fn;
    return this;
  }

  error(error: Error) {
    this.state.error = error;
    this.state.isError = true;
    this.state.isLoading = false;
    return this;
  }

  build() {
    return this.state;
  }
}

// Convenience functions
export const mockQueryLoading = () => new QueryStateBuilder().loading().build();
export const mockQuerySuccess = (data: any) => new QueryStateBuilder().success(data).build();
export const mockQueryError = (error: Error) => new QueryStateBuilder().error(error).build();

export const mockInfiniteQueryLoading = () => new InfiniteQueryStateBuilder().loading().build();
export const mockInfiniteQuerySuccess = (pages: any[]) => new InfiniteQueryStateBuilder().success(pages).build();
export const mockInfiniteQueryWithMore = (pages: any[]) => 
  new InfiniteQueryStateBuilder().success(pages).hasMore().build();
export const mockInfiniteQueryFetching = (pages: any[]) => 
  new InfiniteQueryStateBuilder().success(pages).hasMore().fetchingNextPage().build();
