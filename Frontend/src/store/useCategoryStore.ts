import { create } from 'zustand';
import { apiClient } from '@api/client';

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  parent?: string | null;
  children?: Category[];
  created_at?: string;
  updated_at?: string;
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (data: { name: string; description?: string; parent_id?: string | null }) => Promise<Category>;
  updateCategory: (id: string, data: { name: string; description?: string; parent_id?: string | null }) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/library/categories/');
      set({ categories: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch categories', loading: false });
    }
  },

  createCategory: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/library/categories/', data);
      const newCategory = response.data;
      set((state) => ({
        categories: [...state.categories, newCategory],
        loading: false,
      }));
      return newCategory;
    } catch (error: any) {
      set({ error: error.message || 'Failed to create category', loading: false });
      throw error;
    }
  },

  updateCategory: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.put(`/library/categories/${id}/`, data);
      const updatedCategory = response.data;
      set((state) => ({
        categories: state.categories.map((c) =>
          c.id === id ? updatedCategory : c
        ),
        loading: false,
      }));
      return updatedCategory;
    } catch (error: any) {
      set({ error: error.message || 'Failed to update category', loading: false });
      throw error;
    }
  },

  deleteCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/library/categories/${id}/`);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete category', loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
