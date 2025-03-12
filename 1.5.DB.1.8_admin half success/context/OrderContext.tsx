import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Alert } from 'react-native';
import axios from 'axios';

// API base URL - adjust this to match your backend
const API_BASE_URL = 'http://localhost:3000';

// More frequent polling interval for real-time updates (5 seconds)
const POLLING_INTERVAL = 5000;

export type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'delivering' | 'completed' | 'failed';

export type OrderItem = {
  id: number;
  name: string;
  quantity: number;
  grams: number | null;
  price: number;
  unit: string;
};

export type Order = {
  id: number;
  hotel_id: number | string; // Allow both number and string since API might return either
  owner_name: string;
  phone_number: string;
  location: string;
  items: OrderItem[];
  total: number | string; // Allow both number and string since API might return either
  note?: string;
  date?: string;
  delivery_date?: string; // Add delivery_date field
  status: OrderStatus;
  created_at: Date;
};

type OrderContextType = {
  orders: Order[];
  pendingOrders: Order[];
  readyOrders: Order[];
  completedOrders: Order[];
  todayOrders: Order[];
  placeOrder: (orderData: Partial<Order>) => Promise<void>;
  updateOrderStatus: (orderId: number, status: OrderStatus) => Promise<void>;
  getOrdersByHotelId: (hotelId: number | string) => Order[];
  isLoading: boolean;
  error: string | null;
  refreshOrders: () => Promise<void>;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { user, userRole } = useAuth();

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching orders...', new Date().toISOString());
      
      // Use the regular API endpoint that we confirmed is working
      const url = `${API_BASE_URL}/api/orders`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch orders: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Raw API response length:', data.length);
      
      if (!Array.isArray(data)) {
        console.error('API did not return an array:', typeof data);
        throw new Error('API did not return an array of orders');
      }
      
      // Process the orders with careful error handling
      const processedOrders = data.map((order: any) => {
        try {
          // Handle different date field names
          const dateField = order.delivery_date || order.date;
          const createdAtField = order.created_at;
          
          // Ensure items is an array
          const items = Array.isArray(order.items) 
            ? order.items.map((item: any) => ({
                id: Number(item.id || 0),
                name: String(item.name || ''),
                quantity: Number(item.quantity || 0),
                grams: item.grams ? Number(item.grams) : null,
                price: Number(item.price || 0),
                unit: String(item.unit || 'unit')
              }))
            : [];
            
          return {
            id: Number(order.id || 0),
            hotel_id: order.hotel_id,
            owner_name: String(order.owner_name || ''),
            phone_number: String(order.phone_number || ''),
            location: String(order.location || ''),
            items: items,
            total: order.total,
            note: String(order.note || ''),
            date: order.date,
            delivery_date: order.delivery_date,
            status: (order.status as OrderStatus) || 'pending',
            created_at: createdAtField ? new Date(createdAtField) : new Date()
          };
        } catch (err) {
          console.error('Error processing order:', err, order);
          return null;
        }
      }).filter(Boolean) as Order[];
      
      console.log('Processed orders:', processedOrders.length);
      
      setOrders(processedOrders);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders: ' + (err instanceof Error ? err.message : String(err)));
      // Show an alert for debugging
      Alert.alert('Error Fetching Orders', String(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    fetchOrders();
  }, []);

  // Set up polling for real-time updates
  useEffect(() => {
    const intervalId = setInterval(fetchOrders, POLLING_INTERVAL);
    return () => clearInterval(intervalId);
  }, []);

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const readyOrders = orders.filter(order => order.status === 'ready');
  const completedOrders = orders.filter(order => order.status === 'completed');
  
  const todayOrders = orders.filter(order => {
    try {
      const today = new Date();
      // Try both delivery_date and date fields
      const dateField = order.delivery_date || order.date;
      const orderDate = new Date(dateField);
      
      // Check if the date is valid
      if (isNaN(orderDate.getTime())) {
        console.error('Invalid date:', dateField, 'for order:', order.id);
        return false;
      }
      
      // Compare year, month, and day
      return (
        orderDate.getDate() === today.getDate() &&
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getFullYear() === today.getFullYear()
      );
    } catch (err) {
      console.error('Error filtering today orders:', err, order);
      return false;
    }
  });

  // Log the filtered orders for debugging
  useEffect(() => {
    console.log('All orders:', orders.length);
    console.log('Today orders:', todayOrders.length);
    console.log('Pending orders:', pendingOrders.length);
    console.log('Ready orders:', readyOrders.length);
    console.log('Last updated:', lastUpdated.toISOString());
  }, [orders, todayOrders, pendingOrders, readyOrders, lastUpdated]);

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
        const errorText = await response.text();
        throw new Error(`Failed to place order: ${response.status} ${errorText}`);
      }

      // Refresh orders after placing a new one
      await fetchOrders();
    } catch (err) {
      console.error('Error placing order:', err);
      Alert.alert('Error', 'Failed to place order: ' + (err instanceof Error ? err.message : String(err)));
      throw new Error('Failed to place order');
    }
  };

  const updateOrderStatus = async (orderId: number, status: OrderStatus) => {
    try {
      console.log(`Updating order ${orderId} status to ${status}`);
      
      // Convert orderId to number to ensure consistency
      const numericOrderId = Number(orderId);
      
      // Use a single, reliable endpoint
      const url = `${API_BASE_URL}/api/orders/${numericOrderId}/status`;
      console.log(`Sending request to: ${url}`);
      
      // Use axios instead of fetch for better error handling
      const response = await axios.patch(url, { status });
      
      console.log(`Response status: ${response.status}`);
      console.log(`Response data:`, response.data);
      
      // Update the order status locally immediately for better UX
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === numericOrderId 
            ? { ...order, status } 
            : order
        )
      );

      // Then refresh from server to ensure consistency
      setTimeout(fetchOrders, 500);

      // Show success message
      Alert.alert('Success', `Order #${numericOrderId} has been updated to ${status.toUpperCase()}`);
      
      return true;
    } catch (err) {
      console.error('Error updating order status:', err);
      Alert.alert('Error', 'Failed to update order status: ' + (err instanceof Error ? err.message : String(err)));
      throw new Error('Failed to update order status');
    }
  };

  const getOrdersByHotelId = (hotelId: number | string) => {
    return orders.filter(order => order.hotel_id === hotelId);
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
        refreshOrders: fetchOrders,
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