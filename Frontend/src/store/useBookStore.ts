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
  status: 'active' | 'archived' | 'draft';
  pdf_file?: string | null;
  cover_image?: string | null;
  added_by?: string;
  created_at?: string;
  updated_at?: string;
  views_count?: number;
  downloads_count?: number;
}

interface BookState {
  books: Book[];
  loading: boolean;
  error: string | null;
  fetchBooks: (force?: boolean) => Promise<void>;
  fetchActiveBooks: () => Promise<void>;
  fetchBooksByStatus: (status: 'active' | 'archived' | 'draft') => Promise<void>;
  createBook: (data: FormData | Record<string, any>) => Promise<Book>;
  updateBook: (id: string, data: FormData | Record<string, any>) => Promise<Book>;
  deleteBook: (id: string) => Promise<void>;
  archiveBook: (id: string, status: 'active' | 'archived') => Promise<void>;
  clearError: () => void;
  resetBooks: () => void;
}

export const useBookStore = create<BookState>((set, get) => ({
  books: [],
  loading: false,
  error: null,

  resetBooks: () => {
    set({ books: [], loading: false, error: null });
  },

  fetchBooks: async (force = false) => {
    if (get().books.length > 0 && !force) {
      return;
    }
    
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/library/books/');
      set({ books: response.data, loading: false });
    } catch (error: any) {
      console.error('❌ fetchBooks error:', error);
      set({ 
        error: error.response?.data?.detail || error.message || 'Failed to fetch books', 
        loading: false 
      });
    }
  },

  // ✅ Récupérer uniquement les livres actifs
  fetchActiveBooks: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/library/books/?status=active');
      set({ books: response.data, loading: false });
    } catch (error: any) {
      console.error('❌ fetchActiveBooks error:', error);
      set({ 
        error: error.response?.data?.detail || error.message || 'Failed to fetch active books', 
        loading: false 
      });
    }
  },

  // ✅ Récupérer les livres par statut
  fetchBooksByStatus: async (status: 'active' | 'archived' | 'draft') => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get(`/library/books/?status=${status}`);
      set({ books: response.data, loading: false });
    } catch (error: any) {
      console.error('❌ fetchBooksByStatus error:', error);
      set({ 
        error: error.response?.data?.detail || error.message || `Failed to fetch ${status} books`, 
        loading: false 
      });
    }
  },

  createBook: async (data) => {
    set({ loading: true, error: null });
    try {
      let payload = data;
      
      if (data instanceof FormData) {
        payload = {};
        for (const [key, value] of data.entries()) {
          if (typeof value === 'string') {
            payload[key] = value;
          }
        }
      }
      
      console.log('📚 createBook - envoi en JSON');
      console.log('📤 Payload keys:', Object.keys(payload));
      
      const response = await apiClient.post('/library/books/', payload, {
        timeout: 120000,
        headers: {
          'Content-Type': 'application/json',
        },
        maxContentLength: 100 * 1024 * 1024,
        maxBodyLength: 100 * 1024 * 1024,
      });
      
      const newBook = response.data;
      
      console.log('✅ Livre créé avec succès:', newBook.id);
      
      set((state) => ({
        books: [newBook, ...state.books],
        loading: false,
        error: null,
      }));
      return newBook;
      
    } catch (error: any) {
      console.error('❌ createBook error:', error);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      
      const errorMessage = 
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.pdf_file_encrypted?.[0] ||
        error.response?.data?.cover_image_base64?.[0] ||
        error.response?.data?.cover_image?.[0] ||
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message || 
        'Failed to create book';
      
      set({ 
        error: errorMessage, 
        loading: false 
      });
      throw error;
    }
  },

  updateBook: async (id, data) => {
    set({ loading: true, error: null });
    try {
      let payload = data;
      
      if (data instanceof FormData) {
        payload = {};
        for (const [key, value] of data.entries()) {
          if (typeof value === 'string') {
            payload[key] = value;
          }
        }
      }
      
      const response = await apiClient.put(`/library/books/${id}/`, payload, {
        timeout: 120000,
        headers: {
          'Content-Type': 'application/json',
        },
        maxContentLength: 100 * 1024 * 1024,
        maxBodyLength: 100 * 1024 * 1024,
      });
      
      const updatedBook = response.data;
      
      set((state) => ({
        books: state.books.map((b) => (b.id === id ? updatedBook : b)),
        loading: false,
        error: null,
      }));
      return updatedBook;
      
    } catch (error: any) {
      console.error('❌ updateBook error:', error);
      
      const errorMessage = 
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.pdf_file_encrypted?.[0] ||
        error.response?.data?.cover_image_base64?.[0] ||
        error.response?.data?.cover_image?.[0] ||
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message || 
        'Failed to update book';
      
      set({ 
        error: errorMessage, 
        loading: false 
      });
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
        error: null,
      }));
    } catch (error: any) {
      console.error('❌ deleteBook error:', error);
      set({ 
        error: error.response?.data?.detail || error.message || 'Failed to delete book', 
        loading: false 
      });
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
        error: null,
      }));
    } catch (error: any) {
      console.error('❌ archiveBook error:', error);
      set({ 
        error: error.response?.data?.detail || error.message || 'Failed to archive book', 
        loading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
