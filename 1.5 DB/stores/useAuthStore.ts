import { create } from 'zustand';
import { supabase, auth as supabaseAuth } from '@/lib/supabase';

interface AuthState {
  user: any | null;
  role: 'admin' | 'user' | 'delivery' | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isLoading: true,
  error: null,

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const { user } = await supabaseAuth.signIn(email, password);
      
      // Get user role from the users table
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user?.id)
        .single();

      set({ 
        user, 
        role: userData?.role || 'user',
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message, 
        isLoading: false 
      });
      throw error;
    }
  },

  signUp: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const { user } = await supabaseAuth.signUp(email, password);
      
      // Create user record with default role
      await supabase
        .from('users')
        .insert({
          id: user?.id,
          email: user?.email,
          role: 'user'
        });

      set({ 
        user, 
        role: 'user',
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message, 
        isLoading: false 
      });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      await supabaseAuth.signOut();
      set({ 
        user: null, 
        role: null,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message, 
        isLoading: false 
      });
      throw error;
    }
  },

  checkUser: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Get user role
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        set({ 
          user, 
          role: userData?.role || 'user',
          isLoading: false 
        });
      } else {
        set({ 
          user: null, 
          role: null,
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.message, 
        isLoading: false 
      });
    }
  },
}));