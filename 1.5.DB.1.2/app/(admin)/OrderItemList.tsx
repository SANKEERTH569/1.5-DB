import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { DefaultOrderItem } from './types';

interface OrderItemListProps {
  items: DefaultOrderItem[];
  onUpdateQuantity: (itemId: string, change: number) => void;
  onRemoveItem: (itemId: string) => void;
}

const OrderItemList: React.FC<OrderItemListProps> = ({ items, onUpdateQuantity, onRemoveItem }) => {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.editItemRow}>
          <View style={styles.itemInfo}>
            <Text style={styles.editItemName}>{item.name}</Text>
            <Text style={styles.editItemPrice}>
              ₹{item.price}/{item.unit}
            </Text>
          </View>

          <View style={styles.quantityControl}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => onUpdateQuantity(item.id, -1)}
            >
              <Minus size={16} color={COLORS.darkGray} />
            </TouchableOpacity>

            <Text style={styles.quantityText}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => onUpdateQuantity(item.id, 1)}
            >
              <Plus size={16} color={COLORS.darkGray} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.removeItemButton}
            onPress={() => onRemoveItem(item.id)}
          >
            <Trash2 size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.emptyItemsContainer}>
          <Text style={styles.emptyItemsText}>
            No items in this order. Add some items.
          </Text>
        </View>
      }
      style={styles.editItemsList}
    />
  );
};

const styles = StyleSheet.create({
  editItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  itemInfo: {
    flex: 1,
  },
  editItemName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.text,
  },
  editItemPrice: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.text,
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  removeItemButton: {
    padding: 4,
  },
  emptyItemsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyItemsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  editItemsList: {
    maxHeight: 300,
  },
});

export default OrderItemList;