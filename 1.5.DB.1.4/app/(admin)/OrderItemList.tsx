import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { Minus, Plus, Trash2, Edit, Check } from 'lucide-react-native';
import { DefaultOrderItem } from './types';

interface OrderItemListProps {
  items: DefaultOrderItem[];
  onUpdateQuantity: (itemId: string, change: number) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdatePrice?: (itemId: string, newPrice: number) => void;
}

const OrderItemList: React.FC<OrderItemListProps> = ({ 
  items, 
  onUpdateQuantity, 
  onRemoveItem,
  onUpdatePrice = () => {} // Default empty function if not provided
}) => {
  const [editingPriceItemId, setEditingPriceItemId] = useState<string | null>(null);
  const [editedPrice, setEditedPrice] = useState<string>('');

  const handleStartEditingPrice = (item: DefaultOrderItem) => {
    console.log('Starting to edit price for item:', item.id, 'Current price:', item.price);
    setEditingPriceItemId(item.id);
    setEditedPrice(item.price.toString());
  };

  const handleSavePrice = (itemId: string) => {
    const newPrice = parseFloat(editedPrice);
    console.log('Saving new price for item:', itemId, 'New price:', newPrice);
    if (!isNaN(newPrice) && newPrice > 0) {
      onUpdatePrice(itemId, newPrice);
      setEditingPriceItemId(null);
    } else {
      console.error('Invalid price:', editedPrice);
    }
  };

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.editItemRow}>
          <View style={styles.itemInfo}>
            <Text style={styles.editItemName}>{item.name}</Text>
            
            {editingPriceItemId === item.id ? (
              <View style={styles.priceEditContainer}>
                <TextInput
                  style={styles.priceInput}
                  value={editedPrice}
                  onChangeText={setEditedPrice}
                  keyboardType="numeric"
                  autoFocus
                />
                <Text style={styles.unitText}>/{item.unit}</Text>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => handleSavePrice(item.id)}
                >
                  <Check size={16} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.priceContainer}>
                <Text style={styles.editItemPrice}>
                  ₹{item.price}/{item.unit}
                </Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleStartEditingPrice(item)}
                >
                  <Edit size={14} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  priceEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    width: 60,
    color: COLORS.text,
  },
  unitText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.darkGray,
    marginLeft: 4,
  },
  editButton: {
    marginLeft: 8,
    padding: 2,
  },
  saveButton: {
    marginLeft: 8,
    padding: 2,
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