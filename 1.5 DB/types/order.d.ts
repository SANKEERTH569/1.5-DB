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

export type NewOrder = Omit<Order, 'id' | 'status' | 'createdAt' | 'updatedAt'>;