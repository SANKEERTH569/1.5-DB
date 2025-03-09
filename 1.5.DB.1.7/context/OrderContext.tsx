import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// API base URL - adjust this to match your backend
const API_BASE_URL = 'http://localhost:3000';

export type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'delivering' | 'completed' | 'failed';

export type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  unit: string;
};

export type Order = {
  id: string;
  hotelId: string;
  hotelName: string;
  ownerName: string;
  phone: string;
  address: string;
  addressLink: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
};

type OrderContextType = {
  orders: Order[];
  pendingOrders: Order[];
  readyOrders: Order[];
  completedOrders: Order[];
  todayOrders: Order[];
  placeOrder: (orderData: Partial<Order>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  getOrdersByHotelId: (hotelId: string) => Order[];
  isLoading: boolean;
  error: string | null;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, userRole } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        let url = `${API_BASE_URL}/api/orders`;
        
        // Add query parameters based on user role
        if (userRole === 'user') {
          url += `?hotelId=${user.id}`;
        } else if (userRole === 'delivery') {
          url += '?status=ready,delivering';
        }

        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        const newOrders = data.map((order: any) => ({
          ...order,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt),
        }));

        setOrders(newOrders);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to fetch orders');
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchOrders();

    // Set up polling for updates every 30 seconds
    const intervalId = setInterval(fetchOrders, 30000);

    return () => clearInterval(intervalId);
  }, [user, userRole]);

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const readyOrders = orders.filter(order => order.status === 'ready');
  const completedOrders = orders.filter(order => order.status === 'completed');
  
  const todayOrders = orders.filter(order => {
    const today = new Date();
    return (
      order.createdAt.getDate() === today.getDate() &&
      order.createdAt.getMonth() === today.getMonth() &&
      order.createdAt.getFullYear() === today.getFullYear()
    );
  });

  const placeOrder = async (orderData: Partial<Order>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          status: 'pending',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      // Refresh orders after placing a new one
      const updatedResponse = await fetch(`${API_BASE_URL}/api/orders`);
      const data = await updatedResponse.json();
      const newOrders = data.map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
      }));
      setOrders(newOrders);
    } catch (err) {
      console.error('Error placing order:', err);
      throw new Error('Failed to place order');
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Refresh orders after updating status
      const updatedResponse = await fetch(`${API_BASE_URL}/api/orders`);
      const data = await updatedResponse.json();
      const newOrders = data.map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
      }));
      setOrders(newOrders);
    } catch (err) {
      console.error('Error updating order status:', err);
      throw new Error('Failed to update order status');
    }
  };

  const getOrdersByHotelId = (hotelId: string) => {
    return orders.filter(order => order.hotelId === hotelId);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        pendingOrders,
        readyOrders,
        completedOrders,
        todayOrders,
        placeOrder,
        updateOrderStatus,
        getOrdersByHotelId,
        isLoading,
        error,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};