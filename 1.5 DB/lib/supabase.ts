import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Initialize the Supabase client
const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export type Tables = {
  users: {
    id: string;
    email: string;
    role: 'admin' | 'user' | 'delivery';
    created_at: string;
  };
  hotels: {
    id: string;
    name: string;
    owner_name: string;
    phone: string;
    address: string;
    address_link?: string;
    created_at: string;
  };
  orders: {
    id: string;
    hotel_id: string;
    status: 'pending' | 'confirmed' | 'ready' | 'delivering' | 'completed' | 'failed';
    total: number;
    note?: string;
    created_at: string;
    updated_at: string;
  };
  order_items: {
    id: string;
    order_id: string;
    name: string;
    quantity: number;
    price: number;
    unit: string;
    created_at: string;
  };
};

// Helper functions for common operations
export const auth = {
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};

export const hotels = {
  create: async (hotel: Omit<Tables['hotels'], 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('hotels')
      .insert(hotel)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  getAll: async () => {
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
};

export const orders = {
  create: async (order: Omit<Tables['orders'], 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Partial<Tables['orders']>) => {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  getAll: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        hotels (
          name,
          owner_name,
          phone,
          address
        ),
        order_items (*)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getByHotelId: async (hotelId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('hotel_id', hotelId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  subscribeToUpdates: (callback: (payload: any) => void) => {
    return supabase
      .channel('orders_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        callback
      )
      .subscribe();
  },
};