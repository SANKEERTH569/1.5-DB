import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, doc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { useAuth } from './AuthContext';

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
  const db = getFirestore();

  useEffect(() => {
    if (!user) return;

    let ordersQuery;
    const ordersRef = collection(db, 'orders');

    if (userRole === 'admin') {
      // Admin sees all orders, sorted by creation date
      ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'));
    } else if (userRole === 'delivery') {
      // Delivery sees ready and delivering orders
      ordersQuery = query(
        ordersRef,
        where('status', 'in', ['ready', 'delivering']),
        orderBy('createdAt', 'desc')
      );
    } else {
      // Users see their own orders
      ordersQuery = query(
        ordersRef,
        where('hotelId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const newOrders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        })) as Order[];
        setOrders(newOrders);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching orders:', err);
        setError('Failed to fetch orders');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
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
      const newOrder = {
        ...orderData,
        status: 'pending' as OrderStatus,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'orders'), newOrder);
    } catch (err) {
      console.error('Error placing order:', err);
      throw new Error('Failed to place order');
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: Timestamp.now(),
      });
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