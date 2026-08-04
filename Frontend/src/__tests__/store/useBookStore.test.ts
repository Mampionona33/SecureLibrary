jest.mock('@api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

import { useBookStore } from '@store/useBookStore';
import { apiClient } from '@api/client';

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

const mockBooks = [
  {
    id: '1',
    title: 'Le Seigneur des Anneaux',
    author: 'J.R.R. Tolkien',
    status: 'active' as const,
  },
  {
    id: '2',
    title: 'Harry Potter',
    author: 'J.K. Rowling',
    status: 'active' as const,
  },
];

describe('useBookStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useBookStore.setState({
      books: [],
      loading: false,
      error: null,
    });
  });

  describe('fetchBooks', () => {
    it('should fetch books successfully', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockBooks });

      await useBookStore.getState().fetchBooks();

      expect(mockApiClient.get).toHaveBeenCalledWith('/library/books/');
      expect(useBookStore.getState().books).toEqual(mockBooks);
      expect(useBookStore.getState().loading).toBe(false);
      expect(useBookStore.getState().error).toBe(null);
    });

    it('should handle fetch error', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      await useBookStore.getState().fetchBooks();

      expect(useBookStore.getState().books).toEqual([]);
      expect(useBookStore.getState().loading).toBe(false);
      expect(useBookStore.getState().error).toBe('Network error');
    });
  });

  describe('createBook', () => {
    const newBook = {
      id: '3',
      title: 'Le Hobbit',
      author: 'J.R.R. Tolkien',
      status: 'active',
    };

    it('should create a book successfully', async () => {
      mockApiClient.post.mockResolvedValueOnce({ data: newBook });

      await useBookStore.getState().createBook({
        title: 'Le Hobbit',
        author: 'J.R.R. Tolkien',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/library/books/',
        {
          title: 'Le Hobbit',
          author: 'J.R.R. Tolkien',
        },
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
          timeout: 120000,
        }),
      );
      expect(useBookStore.getState().books).toContainEqual(newBook);
      expect(useBookStore.getState().loading).toBe(false);
      expect(useBookStore.getState().error).toBe(null);
    });

    it('should handle create error', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Creation failed'));

      try {
        await useBookStore.getState().createBook({ title: 'Test' });
      } catch (error) {
        // Expected
      }

      expect(useBookStore.getState().error).toBe('Creation failed');
      expect(useBookStore.getState().loading).toBe(false);
    });
  });

  describe('updateBook', () => {
    const updatedBook = {
      id: '1',
      title: 'Le Seigneur des Anneaux (Édition spéciale)',
      author: 'J.R.R. Tolkien',
      status: 'active',
    };

    it('should update a book successfully', async () => {
      useBookStore.setState({ books: [mockBooks[0]] });
      mockApiClient.put.mockResolvedValueOnce({ data: updatedBook });

      await useBookStore.getState().updateBook('1', {
        title: 'Le Seigneur des Anneaux (Édition spéciale)',
      });

      expect(mockApiClient.put).toHaveBeenCalledWith(
        '/library/books/1/',
        {
          title: 'Le Seigneur des Anneaux (Édition spéciale)',
        },
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
          timeout: 120000,
        }),
      );
      expect(useBookStore.getState().books[0]).toEqual(updatedBook);
      expect(useBookStore.getState().loading).toBe(false);
      expect(useBookStore.getState().error).toBe(null);
    });

    it('should handle update error', async () => {
      mockApiClient.put.mockRejectedValueOnce(new Error('Update failed'));

      try {
        await useBookStore.getState().updateBook('1', { title: 'Test' });
      } catch (error) {
        // Expected
      }

      expect(useBookStore.getState().error).toBe('Update failed');
      expect(useBookStore.getState().loading).toBe(false);
    });
  });

  describe('deleteBook', () => {
    it('should delete a book successfully', async () => {
      useBookStore.setState({ books: mockBooks });
      mockApiClient.delete.mockResolvedValueOnce({});

      await useBookStore.getState().deleteBook('1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/library/books/1/');
      expect(useBookStore.getState().books).toHaveLength(1);
      expect(useBookStore.getState().books[0].id).toBe('2');
      expect(useBookStore.getState().loading).toBe(false);
      expect(useBookStore.getState().error).toBe(null);
    });

    it('should handle delete error', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Delete failed'));

      try {
        await useBookStore.getState().deleteBook('1');
      } catch (error) {
        // Expected
      }

      expect(useBookStore.getState().error).toBe('Delete failed');
      expect(useBookStore.getState().loading).toBe(false);
    });
  });

  describe('archiveBook', () => {
    it('should archive a book successfully', async () => {
      const archivedBook = { ...mockBooks[0], status: 'archived' as const };
      useBookStore.setState({ books: [mockBooks[0]] });
      mockApiClient.patch.mockResolvedValueOnce({ data: archivedBook });

      await useBookStore.getState().archiveBook('1', 'archived');

      expect(mockApiClient.patch).toHaveBeenCalledWith('/library/books/1/', {
        status: 'archived',
      });
      expect(useBookStore.getState().books[0].status).toBe('archived');
      expect(useBookStore.getState().loading).toBe(false);
      expect(useBookStore.getState().error).toBe(null);
    });

    it('should handle archive error', async () => {
      mockApiClient.patch.mockRejectedValueOnce(new Error('Archive failed'));

      try {
        await useBookStore.getState().archiveBook('1', 'archived');
      } catch (error) {
        // Expected
      }

      expect(useBookStore.getState().error).toBe('Archive failed');
      expect(useBookStore.getState().loading).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      useBookStore.setState({ error: 'Some error' });
      useBookStore.getState().clearError();
      expect(useBookStore.getState().error).toBe(null);
    });
  });
});
