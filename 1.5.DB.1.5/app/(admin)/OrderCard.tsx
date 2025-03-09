import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { Edit } from 'lucide-react-native';

// Import the types from a shared location or redefine to match exactly
interface DefaultOrderItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  registration_item_id?: string;
}

interface DefaultOrder {
  id: string;
  hotelId: string;
  hotelName: string;
  items: DefaultOrderItem[];
}

interface OrderCardProps {
  order: DefaultOrder;
  onEditOrder: (order: DefaultOrder) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onEditOrder }) => {
  return (
    <TouchableOpacity style={styles.orderCard} onPress={() => onEditOrder(order)}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.hotelId}>{order.hotelId}</Text>
          <Text style={styles.hotelName}>{order.hotelName}</Text>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={() => onEditOrder(order)}>
          <Edit size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.itemsContainer}>
        <Text style={styles.itemsLabel}>Default Items:</Text>
        {order.items.map((orderItem: DefaultOrderItem, index: number) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemName}>{orderItem.name}</Text>
            <Text style={styles.itemQuantity}>
              {orderItem.quantity} {orderItem.unit}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  hotelId: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  hotelName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: COLORS.text,
  },
  editButton: {
    padding: 4,
  },
  itemsContainer: {
    marginTop: 4,
  },
  itemsLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  itemName: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.text,
  },
  itemQuantity: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.text,
  },
});

export default OrderCard;