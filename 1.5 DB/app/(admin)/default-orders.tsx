import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { ArrowLeft, Edit, Trash2, Plus, Minus } from 'lucide-react-native';

// Mock data for default orders
const DEFAULT_ORDERS = [
  {
    id: '1',
    hotelId: 'KIR001',
    hotelName: 'Hotel Sunshine',
    items: [
      { id: '1', name: 'Rice', quantity: 5, price: 50, unit: 'kg' },
      { id: '2', name: 'Wheat Flour', quantity: 2, price: 40, unit: 'kg' },
      { id: '3', name: 'Cooking Oil', quantity: 3, price: 120, unit: 'liter' },
    ],
  },
  {
    id: '2',
    hotelId: 'KIR002',
    hotelName: 'Grand Restaurant',
    items: [
      { id: '1', name: 'Milk', quantity: 10, price: 60, unit: 'liter' },
      { id: '2', name: 'Tomatoes', quantity: 3, price: 30, unit: 'kg' },
      { id: '3', name: 'Onions', quantity: 4, price: 25, unit: 'kg' },
    ],
  },
  {
    id: '3',
    hotelId: 'KIR003',
    hotelName: 'Spice Garden',
    items: [
      { id: '1', name: 'Potatoes', quantity: 5, price: 20, unit: 'kg' },
      { id: '2', name: 'Lentils', quantity: 2, price: 90, unit: 'kg' },
      { id: '3', name: 'Salt', quantity: 1, price: 15, unit: 'kg' },
    ],
  },
];

// Available grocery items for adding
const AVAILABLE_ITEMS = [
  { id: '1', name: 'Rice', price: 50, unit: 'kg' },
  { id: '2', name: 'Wheat Flour', price: 40, unit: 'kg' },
  { id: '3', name: 'Sugar', price: 45, unit: 'kg' },
  { id: '4', name: 'Cooking Oil', price: 120, unit: 'liter' },
  { id: '5', name: 'Milk', price: 60, unit: 'liter' },
  { id: '6', name: 'Tomatoes', price: 30, unit: 'kg' },
  { id: '7', name: 'Onions', price: 25, unit: 'kg' },
  { id: '8', name: 'Potatoes', price: 20, unit: 'kg' },
  { id: '9', name: 'Lentils', price: 90, unit: 'kg' },
  { id: '10', name: 'Salt', price: 15, unit: 'kg' },
];

export default function DefaultOrdersScreen() {
  const router = useRouter();
  const [defaultOrders, setDefaultOrders] = useState(DEFAULT_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedItems, setEditedItems] = useState<any[]>([]);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = () => {
    router.back();
  };

  const handleEditOrder = (order: any) => {
    setSelectedOrder(order);
    setEditedItems([...order.items]);
    setIsEditMode(true);
  };

  const handleUpdateQuantity = (itemId: string, change: number) => {
    setEditedItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setEditedItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const handleAddItem = (item: any) => {
    // Check if item already exists
    const existingItem = editedItems.find(i => i.id === item.id);
    
    if (existingItem) {
      // Update quantity if item exists
      setEditedItems(prevItems => 
        prevItems.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      // Add new item with quantity 1
      setEditedItems(prevItems => [
        ...prevItems, 
        { ...item, quantity: 1 }
      ]);
    }
    
    setShowAddItemModal(false);
  };

  const handleSaveChanges = () => {
    // Filter out items with quantity 0
    const validItems = editedItems.filter(item => item.quantity > 0);
    
    if (validItems.length === 0) {
      Alert.alert('Error', 'Order must have at least one item');
      return;
    }
    
    setDefaultOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, items: validItems }
          : order
      )
    );
    
    setIsEditMode(false);
    setSelectedOrder(null);
  };

  const filteredItems = AVAILABLE_ITEMS.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderOrderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => handleEditOrder(item)}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.hotelId}>{item.hotelId}</Text>
          <Text style={styles.hotelName}>{item.hotelName}</Text>
        </View>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => handleEditOrder(item)}
        >
          <Edit size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.itemsContainer}>
        <Text style={styles.itemsLabel}>Default Items:</Text>
        {item.items.map((orderItem: any, index: number) => (
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Default Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={defaultOrders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No default orders found</Text>
          </View>
        }
      />

      {/* Edit Order Modal */}
      <Modal
        visible={isEditMode}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setIsEditMode(false);
          setSelectedOrder(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Default Order</Text>
              <TouchableOpacity onPress={() => {
                setIsEditMode(false);
                setSelectedOrder(null);
              }}>
                <Text style={styles.closeText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            
            {selectedOrder && (
              <View style={styles.modalBody}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderInfoLabel}>Hotel:</Text>
                  <Text style={styles.orderInfoValue}>
                    {selectedOrder.hotelName} ({selectedOrder.hotelId})
                  </Text>
                </View>
                
                <View style={styles.itemsHeader}>
                  <Text style={styles.itemsTitle}>Items</Text>
                  <TouchableOpacity 
                    style={styles.addItemButton}
                    onPress={() => setShowAddItemModal(true)}
                  >
                    <Plus size={16} color={COLORS.white} />
                    <Text style={styles.addItemText}>Add Item</Text>
                  </TouchableOpacity>
                </View>
                
                <FlatList
                  data={editedItems}
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
                          onPress={() => handleUpdateQuantity(item.id, -1)}
                        >
                          <Minus size={16} color={COLORS.darkGray} />
                        </TouchableOpacity>
                        
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => handleUpdateQuantity(item.id, 1)}
                        >
                          <Plus size={16} color={COLORS.darkGray} />
                        </TouchableOpacity>
                      </View>
                      
                      <TouchableOpacity
                        style={styles.removeItemButton}
                        onPress={() => handleRemoveItem(item.id)}
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
                
                <Button
                  title="Save Changes"
                  onPress={handleSaveChanges}
                  variant="primary"
                  size="large"
                  style={styles.saveButton}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Add Item Modal */}
      <Modal
        visible={showAddItemModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddItemModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Item</Text>
              <TouchableOpacity onPress={() => setShowAddItemModal(false)}>
                <Text style={styles.closeText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                containerStyle={styles.searchContainer}
              />
              
              <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.addItemRow}
                    onPress={() => handleAddItem(item)}
                  >
                    <View>
                      <Text style={styles.addItemName}>{item.name}</Text>
                      <Text style={styles.addItemPrice}>
                        ₹{item.price}/{item.unit}
                      </Text>
                    </View>
                    <Plus size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                )}
                style={styles.addItemsList}
                ListEmptyComponent={
                  <View style={styles.emptyItemsContainer}>
                    <Text style={styles.emptyItemsText}>
                      No items found matching your search.
                    </Text>
                  </View>
                }
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: COLORS.text,
  },
  listContainer: {
    padding: 16,
  },
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
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.text,
  },
  closeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.primary,
  },
  modalBody: {
    padding: 16,
    flex: 1,
  },
  orderInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  orderInfoLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
    marginRight: 8,
  },
  orderInfoValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.text,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addItemText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: COLORS.white,
    marginLeft: 4,
  },
  editItemsList: {
    maxHeight: 300,
  },
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
  saveButton: {
    marginTop: 16,
  },
  searchContainer: {
    marginBottom: 12,
  },
  addItemsList: {
    maxHeight: 300,
  },
  addItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  addItemName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.text,
  },
  addItemPrice: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 2,
  },
});