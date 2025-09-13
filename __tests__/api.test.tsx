import { 
  getTopStories, 
  getBestStories, 
  getAskStories, 
  getShowStories, 
  getItemDetails, 
  getUserDetails 
} from '@/api/endpoints';

// Mock global fetch
global.fetch = jest.fn();

describe('API Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Story Endpoints', () => {
    it('should fetch top stories', async () => {
      const mockStoryIds = [1, 2, 3, 4, 5];
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStoryIds,
      });

      const response = await getTopStories();
      const data = await response.json();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://hacker-news.firebaseio.com/v0/topstories.json',
        { method: 'GET' }
      );
      expect(data).toEqual(mockStoryIds);
    });

    it('should fetch best stories', async () => {
      const mockStoryIds = [10, 11, 12];
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStoryIds,
      });

      const response = await getBestStories();
      const data = await response.json();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://hacker-news.firebaseio.com/v0/beststories.json',
        { method: 'GET' }
      );
      expect(data).toEqual(mockStoryIds);
    });

    it('should fetch ask stories', async () => {
      const mockStoryIds = [20, 21, 22];
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStoryIds,
      });

      const response = await getAskStories();
      const data = await response.json();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://hacker-news.firebaseio.com/v0/askstories.json',
        { method: 'GET' }
      );
      expect(data).toEqual(mockStoryIds);
    });

    it('should fetch show stories', async () => {
      const mockStoryIds = [30, 31, 32];
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStoryIds,
      });

      const response = await getShowStories();
      const data = await response.json();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://hacker-news.firebaseio.com/v0/showstories.json',
        { method: 'GET' }
      );
      expect(data).toEqual(mockStoryIds);
    });

    it('should handle story fetch errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(getTopStories()).rejects.toThrow('Network error');
    });
  });

  describe('getItemDetails', () => {
    it('should fetch item details by ID', async () => {
      const mockItem = {
        id: 123,
        title: 'Test Item',
        url: 'https://example.com',
        score: 100,
        by: 'testuser',
        time: 1640995200,
        type: 'story',
        kids: [],
        dead: false,
        deleted: false,
        text: '',
        parent: 0,
        poll: 0,
        parts: [],
        descendants: 0,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockItem,
      });

      const response = await getItemDetails(123);
      const data = await response.json();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://hacker-news.firebaseio.com/v0/item/123.json',
        { method: 'GET' }
      );
      expect(data).toEqual(mockItem);
    });

    it('should handle string IDs', async () => {
      const mockItem = { id: 456 };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockItem,
      });

      await getItemDetails('456');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://hacker-news.firebaseio.com/v0/item/456.json',
        { method: 'GET' }
      );
    });

    it('should handle invalid item IDs', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      });

      const response = await getItemDetails(999999);
      const data = await response.json();

      expect(data).toBeNull();
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Failed to fetch')
      );

      await expect(getItemDetails(123)).rejects.toThrow('Failed to fetch');
    });
  });

  describe('getUserDetails', () => {
    it('should fetch user details by ID', async () => {
      const mockUser = {
        id: 'testuser',
        created: 1640995200,
        karma: 1000,
        about: 'Test user description',
        submitted: [1, 2, 3],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const response = await getUserDetails('testuser');
      const data = await response.json();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://hacker-news.firebaseio.com/v0/user/testuser.json',
        { method: 'GET' }
      );
      expect(data).toEqual(mockUser);
    });

    it('should handle numeric user IDs', async () => {
      const mockUser = { id: 123 };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      await getUserDetails(123);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://hacker-news.firebaseio.com/v0/user/123.json',
        { method: 'GET' }
      );
    });

    it('should handle non-existent users', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      });

      const response = await getUserDetails('nonexistentuser');
      const data = await response.json();

      expect(data).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP error responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const response = await getTopStories();
      
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it('should handle malformed JSON responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const response = await getItemDetails(123);
      
      await expect(response.json()).rejects.toThrow('Invalid JSON');
    });
  });

  describe('Performance', () => {
    it('should handle concurrent requests', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1 }),
      });

      const promises = [
        getItemDetails(1),
        getItemDetails(2),
        getItemDetails(3),
      ];

      const responses = await Promise.all(promises);
      
      expect(responses).toHaveLength(3);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should not block subsequent requests on error', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('First request failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 2 }),
        });

      await expect(getItemDetails(1)).rejects.toThrow('First request failed');
      
      const response = await getItemDetails(2);
      const data = await response.json();
      
      expect(data).toEqual({ id: 2 });
    });

    it('should make requests with correct HTTP method', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      await getTopStories();
      await getBestStories();
      await getAskStories();
      await getShowStories();
      await getItemDetails(1);
      await getUserDetails('test');

      // All calls should use GET method
      expect(global.fetch).toHaveBeenCalledTimes(6);
      const calls = (global.fetch as jest.Mock).mock.calls;
      
      calls.forEach(call => {
        expect(call[1]).toEqual({ method: 'GET' });
      });
    });
  });
});
