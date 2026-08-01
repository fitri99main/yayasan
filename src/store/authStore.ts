import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  permissions?: string[];
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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      
      // Fetch user profile from app_users
      const { data: profile } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profile) {
        set({ user: profile as User });
      } else {
        set({ user: { id: data.user.id, email: data.user.email!, name: email.split('@')[0], role: 'admin', permissions: [] } });
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  },
  
  signUp: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: error.message };
      
      if (data.user) {
        // Wait a bit for the trigger to insert into app_users
        await new Promise(resolve => setTimeout(resolve, 500));
        const { data: profile } = await supabase
          .from('app_users')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profile) {
          set({ user: profile as User });
        }
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  },
  
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
  
  init: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from('app_users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              set({ user: data as User, loading: false });
            } else {
              set({ user: { id: session.user.id, email: session.user.email!, name: session.user.email!.split('@')[0], role: 'admin', permissions: [] }, loading: false });
            }
          });
      } else {
        set({ loading: false });
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from('app_users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              set({ user: data as User });
            }
          });
      } else {
        set({ user: null });
      }
    });
  },
}));
