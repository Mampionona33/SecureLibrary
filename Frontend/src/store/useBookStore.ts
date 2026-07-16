import { create } from 'zustand';
import { apiClient } from '@api/client';

export interface Book {
  id: string;
  title: string;
  author: string;
  category?: string | null;
  year?: number | null;
  description?: string | null;
  isbn?: string | null;
  status: 'active' | 'archived';
  pdf_file?: string | null;
  cover_image?: string | null;
  added_by?: string;
  created_at?: string;
  updated_at?: string;
}

interface BookState {
  books: Book[];
  loading: boolean;
  error: string | null;
  fetchBooks: () => Promise<void>;
  createBook: (data: FormData | Partial<Book>) => Promise<Book>;
  updateBook: (id: string, data: FormData | Partial<Book>) => Promise<Book>;
  deleteBook: (id: string) => Promise<void>;
  archiveBook: (id: string, status: 'active' | 'archived') => Promise<void>;
  clearError: () => void;
}

export const useBookStore = create<BookState>((set, get) => ({
  books: [],
  loading: false,
  error: null,

  fetchBooks: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/library/books/');
      set({ books: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch books', loading: false });
    }
  },

  createBook: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/library/books/', data);
      const newBook = response.data;
      set((state) => ({
        books: [...state.books, newBook],
        loading: false,
      }));
      return newBook;
    } catch (error: any) {
      set({ error: error.message || 'Failed to create book', loading: false });
      throw error;
    }
  },

  updateBook: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.put(`/library/books/${id}/`, data);
      const updatedBook = response.data;
      set((state) => ({
        books: state.books.map((b) => (b.id === id ? updatedBook : b)),
        loading: false,
      }));
      return updatedBook;
    } catch (error: any) {
      set({ error: error.message || 'Failed to update book', loading: false });
      throw error;
    }
  },

  deleteBook: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/library/books/${id}/`);
      set((state) => ({
        books: state.books.filter((b) => b.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete book', loading: false });
      throw error;
    }
  },

  archiveBook: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.patch(`/library/books/${id}/`, { status });
      const updatedBook = response.data;
      set((state) => ({
        books: state.books.map((b) => (b.id === id ? updatedBook : b)),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to archive book', loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
