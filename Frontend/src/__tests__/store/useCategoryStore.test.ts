import { useCategoryStore } from '@store/useCategoryStore';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('useCategoryStore', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    // Reset store state between tests
    useCategoryStore.setState({
      categories: [],
      loading: false,
      error: null,
    });
  });

  const mockCategories = [
    { id: '1', name: 'Sciences', description: 'Livres scientifiques' },
    { id: '2', name: 'Romans', description: 'Romans et fictions' },
  ];

  describe('fetchCategories', () => {
    it('should fetch categories successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategories,
      });

      await useCategoryStore.getState().fetchCategories();

      expect(mockFetch).toHaveBeenCalledWith('/api/library/categories/');
      expect(useCategoryStore.getState().categories).toEqual(mockCategories);
      expect(useCategoryStore.getState().loading).toBe(false);
      expect(useCategoryStore.getState().error).toBe(null);
    });

    it('should handle fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await useCategoryStore.getState().fetchCategories();

      expect(useCategoryStore.getState().categories).toEqual([]);
      expect(useCategoryStore.getState().loading).toBe(false);
      expect(useCategoryStore.getState().error).toBe('Network error');
    });

    it('should handle non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await useCategoryStore.getState().fetchCategories();

      expect(useCategoryStore.getState().error).toBe('Failed to fetch categories');
      expect(useCategoryStore.getState().loading).toBe(false);
    });
  });

  describe('createCategory', () => {
    const newCategory = { id: '3', name: 'Nouvelle Catégorie' };

    it('should create category successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => newCategory,
      });

      const result = await useCategoryStore.getState().createCategory({
        name: 'Nouvelle Catégorie',
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/library/categories/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Nouvelle Catégorie' }),
      });
      expect(result).toEqual(newCategory);
      expect(useCategoryStore.getState().categories).toContainEqual(newCategory);
      expect(useCategoryStore.getState().loading).toBe(false);
    });

    it('should handle create error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Creation failed'));

      await expect(
        useCategoryStore.getState().createCategory({ name: 'Test' })
      ).rejects.toThrow('Creation failed');

      expect(useCategoryStore.getState().error).toBe('Creation failed');
      expect(useCategoryStore.getState().loading).toBe(false);
    });
  });

  describe('updateCategory', () => {
    const updatedCategory = { id: '1', name: 'Sciences (modifié)' };

    it('should update category successfully', async () => {
      // Pré-remplir le store
      useCategoryStore.setState({ categories: [{ id: '1', name: 'Sciences' }] });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedCategory,
      });

      const result = await useCategoryStore.getState().updateCategory('1', {
        name: 'Sciences (modifié)',
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/library/categories/1/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Sciences (modifié)' }),
      });
      expect(result).toEqual(updatedCategory);
      expect(useCategoryStore.getState().categories[0]).toEqual(updatedCategory);
    });

    it('should handle update error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Update failed'));

      await expect(
        useCategoryStore.getState().updateCategory('1', { name: 'Test' })
      ).rejects.toThrow('Update failed');

      expect(useCategoryStore.getState().error).toBe('Update failed');
    });
  });

  describe('deleteCategory', () => {
    it('should delete category successfully', async () => {
      useCategoryStore.setState({
        categories: [
          { id: '1', name: 'Sciences' },
          { id: '2', name: 'Romans' },
        ],
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await useCategoryStore.getState().deleteCategory('1');

      expect(mockFetch).toHaveBeenCalledWith('/api/library/categories/1/', {
        method: 'DELETE',
      });
      expect(useCategoryStore.getState().categories).toHaveLength(1);
      expect(useCategoryStore.getState().categories[0].id).toBe('2');
    });

    it('should handle delete error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Delete failed'));

      await expect(
        useCategoryStore.getState().deleteCategory('1')
      ).rejects.toThrow('Delete failed');

      expect(useCategoryStore.getState().error).toBe('Delete failed');
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      useCategoryStore.setState({ error: 'Some error' });
      useCategoryStore.getState().clearError();
      expect(useCategoryStore.getState().error).toBe(null);
    });
  });
});
