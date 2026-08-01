import { create } from 'zustand';
import api from '../lib/api';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  signIn: async (email, password) => {
    try {
      const { data } = await api.post('/login', { email, password });
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      set({ user: data.user });
      return { error: null };
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Login gagal';
      return { error: message };
    }
  },
  signUp: async (email, password) => {
    try {
      const { data } = await api.post('/register', { email, password });
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      set({ user: data.user });
      return { error: null };
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Registrasi gagal';
      return { error: message };
    }
  },
  signOut: async () => {
    try {
      await api.post('/logout');
    } catch {
      // ignore
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    set({ user: null });
  },
  init: () => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    if (token && storedUser) {
      set({ user: JSON.parse(storedUser), loading: false });
      // Verify token is still valid
      api.get('/me').then(({ data }) => {
        set({ user: data, loading: false });
        localStorage.setItem('auth_user', JSON.stringify(data));
      }).catch(async (err) => {
        const error = err as any;
        console.error('Failed to verify token:', error);
        
        // Debug the token
        try {
          const debugRes = await api.get('/debug-token');
          console.warn('Debug Token Result:', debugRes.data);
        } catch (debugErr) {
          console.error('Debug Token Route Failed:', debugErr);
        }

        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          set({ user: null, loading: false });
        } else {
          set({ loading: false });
        }
      });
    } else {
      set({ loading: false });
    }
  },
}));
