import { create } from 'zustand';
import { supabase, orders as supabaseOrders, Tables } from '@/lib/supabase';

interface OrderState {
  orders: any[];
  isLoading: boolean;
  error: string | null;
  createOrder: (order: Omit<Tables['orders'], 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateOrderStatus: (id: string, status: Tables['orders']['status']) => Promise<void>;
  fetchOrders: () => Promise<void>;
  subscribeToOrders: () => void;
  unsubscribeFromOrders: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  isLoading: false,
  error: null,

  createOrder: async (order) => {
    try {
      set({ isLoading: true, error: null });
      await supabaseOrders.create(order);
      await get().fetchOrders();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      set({ isLoading: true, error: null });
      await supabaseOrders.update(id, { status });
      await get().fetchOrders();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchOrders: async () => {
    try {
      set({ isLoading: true, error: null });
      const orders = await supabaseOrders.getAll();
      set({ orders });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  subscribeToOrders: () => {
    const subscription = supabaseOrders.subscribeToUpdates(
      (payload) => {
        get().fetchOrders();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  },

  unsubscribeFromOrders: () => {
    supabase.removeAllChannels();
  },
}));