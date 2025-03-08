import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { ArrowLeft } from 'lucide-react-native';
import axios from 'axios';
import AddItem from '@/components/AddItem';
import OrderCard from './OrderCard';
import EditOrderModal from './EditOrderModal';

// Define the type for a default order item
interface DefaultOrderItem {
  id: string; // This is the item_id from AVAILABLE_ITEMS
  name: string;
  price: number;
  unit: string;
  quantity: number;
  registration_item_id?: string; // Optional ID from registration_items table
}

// Define the type for a default order
interface DefaultOrder {
  id: string;
  hotelId: string;
  hotelName: string;
  items: DefaultOrderItem[];
}

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
  const [defaultOrders, setDefaultOrders] = useState<DefaultOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<DefaultOrder | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedItems, setEditedItems] = useState<DefaultOrderItem[]>([]);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const response = await axios.get('http://localhost:3000/registrations');
        const registrations: DefaultOrder[] = response.data.map(
          (registration: any) => ({
            id: registration.id,
            hotelId: registration.hotel_id,
            hotelName: registration.shop_name,
            items: [],
          })
        );

        await Promise.all(
          registrations.map(async (registration) => {
            try {
              const itemsResponse = await axios.get(
                `http://localhost:3000/registrations/${registration.hotelId}/items`
              );
              registration.items = itemsResponse.data.map((item: any) => ({
                id: item.item_id,
                name: item.name,
                price: item.price,
                unit: item.unit,
                quantity: item.quantity,
                registration_item_id: item.id,
              }));
            } catch (error) {
              console.error(`Error fetching items for hotel ${registration.hotelId}:`, error);
              Alert.alert('Error', `Failed to load items for hotel ${registration.hotelId}`);
            }
          })
        );

        setDefaultOrders(registrations);
      } catch (error) {
        console.error('Error fetching registrations:', error);
        Alert.alert('Error', 'Failed to load registrations');
      }
    };

    fetchRegistrations();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleEditOrder = (order: DefaultOrder) => {
    setSelectedOrder(order);
    setEditedItems([...order.items]);
    setIsEditMode(true);
  };

  const handleUpdateQuantity = (itemId: string, change: number) => {
    setEditedItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity + change) } : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setEditedItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const handleUpdatePrice = (itemId: string, newPrice: number) => {
    console.log('handleUpdatePrice called with itemId:', itemId, 'newPrice:', newPrice);
    
    // Log the item before update
    const itemBefore = editedItems.find(item => item.id === itemId);
    console.log('Item before price update:', itemBefore);
    
    setEditedItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, price: newPrice } : item
      )
    );
    
    // Log the updated items after state update
    setTimeout(() => {
      const itemAfter = editedItems.find(item => item.id === itemId);
      console.log('Item after price update (may not reflect changes immediately due to state update timing):', itemAfter);
      console.log('All edited items:', editedItems);
    }, 100);
  };

  const handleAddItem = (item: any) => {
    if (!selectedOrder) {
      Alert.alert('Error', 'No order selected.');
      return;
    }

    console.log('Adding item:', item);

    // Check if the item already exists in the editedItems
    const existingItem = editedItems.find((editedItem) => editedItem.id === item.id);

    if (existingItem) {
      // If the item already exists, update its quantity
      setEditedItems((prevItems) =>
        prevItems.map((editedItem) =>
          editedItem.id === item.id
            ? { ...editedItem, quantity: editedItem.quantity + 1 }
            : editedItem
        )
      );
    } else {
      // If the item does not exist, add it to the editedItems
      setEditedItems((prevItems) => [
        ...prevItems,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          unit: item.unit,
          quantity: 1,
        },
      ]);
    }

    setShowAddItemModal(false);
  };

  const handleSaveChanges = async () => {
    if (!selectedOrder) {
      Alert.alert('Error', 'No order selected.');
      return;
    }

    console.log('Starting save changes with items:', editedItems);

    try {
      // Prepare updates and creates
      await Promise.all(
        editedItems.map(async (item) => {
          console.log('Processing item:', item);
          
          if (item.quantity <= 0) {
            // Delete item if quantity is 0
            console.log('Deleting item with quantity 0:', item.id);
            if (item.registration_item_id) {
              try {
                const response = await axios.delete(
                  `http://localhost:3000/registrations/items/${item.registration_item_id}`
                );
                console.log('Delete response:', response.data);
              } catch (error) {
                console.error('Error deleting item:', error);
                throw error;
              }
            }
          } else {
            // Update or create item
            if (item.registration_item_id) {
              // Update existing item
              console.log('Updating existing item:', item.id, item.registration_item_id, 'Price:', item.price);
              try {
                const response = await axios.put(
                  `http://localhost:3000/registrations/items/${item.registration_item_id}`,
                  {
                    quantity: item.quantity,
                    price: item.price,
                    unit: item.unit,
                  }
                );
                console.log('Update response:', response.data);
              } catch (error) {
                console.error('Error updating item:', error);
                throw error;
              }
            } else {
              // Create new item
              // Check if it's a manually added item (ID starts with 'manual-')
              const isManualItem = item.id.startsWith('manual-');
              console.log('Creating new item:', item.id, 'Manual:', isManualItem, 'Price:', item.price);
              
              try {
                const response = await axios.post(
                  `http://localhost:3000/registrations/${selectedOrder.hotelId}/items`,
                  {
                    registration_id: selectedOrder.hotelId,
                    item_id: isManualItem ? null : item.id, // Use null for manual items
                    name: item.name,
                    price: item.price,
                    unit: item.unit,
                    quantity: item.quantity,
                    is_manual: isManualItem, // Flag to indicate this is a manually added item
                  }
                );
                console.log('Create response:', response.data);
              } catch (error) {
                console.error('Error creating item:', error);
                throw error;
              }
            }
          }
        })
      );

      console.log('All items processed, fetching updated items');

      // Refresh items after saving
      try {
        const itemsResponse = await axios.get(
          `http://localhost:3000/registrations/${selectedOrder.hotelId}/items`
        );
        console.log('Fetched updated items:', itemsResponse.data);

        const updatedItems = itemsResponse.data.map((dbItem: any) => ({
          id: dbItem.item_id || `manual-${dbItem.id}`, // Use manual-id for manual items
          name: dbItem.name,
          price: dbItem.price,
          unit: dbItem.unit,
          quantity: dbItem.quantity,
          registration_item_id: dbItem.id,
          is_manual: dbItem.is_manual,
        }));

        console.log('Mapped updated items:', updatedItems);

        setDefaultOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === selectedOrder.id ? { ...order, items: updatedItems } : order
          )
        );

        Alert.alert('Success', 'Changes saved successfully');
        setIsEditMode(false);
        setSelectedOrder(null);
      } catch (error) {
        console.error('Error fetching updated items:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    }
  };

  // Add this function to test price updates directly
  const testPriceUpdate = async () => {
    if (!selectedOrder || editedItems.length === 0) {
      console.error('No order or items selected for testing');
      return;
    }
    
    const testItem = editedItems[0];
    const testPrice = 777.77;
    
    console.log('Testing price update for item:', testItem.id, 'Current price:', testItem.price);
    
    // Update the price in local state
    handleUpdatePrice(testItem.id, testPrice);
    
    // Wait for state update
    setTimeout(async () => {
      console.log('Updated item in state:', editedItems.find(item => item.id === testItem.id));
      
      // Save the changes to the database
      await handleSaveChanges();
      
      console.log('Changes saved to database');
    }, 500);
  };

  const filteredItems = AVAILABLE_ITEMS.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderOrderItem = ({ item }: { item: any }) => (
    <OrderCard order={item} onEditOrder={handleEditOrder} />
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
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No default orders found</Text>
          </View>
        }
      />

      <EditOrderModal
        isEditMode={isEditMode}
        selectedOrder={selectedOrder}
        editedItems={editedItems}
        setIsEditMode={setIsEditMode}
        setSelectedOrder={setSelectedOrder}
        setEditedItems={setEditedItems}
        handleUpdateQuantity={handleUpdateQuantity}
        handleRemoveItem={handleRemoveItem}
        handleUpdatePrice={handleUpdatePrice}
        handleSaveChanges={handleSaveChanges}
        setShowAddItemModal={setShowAddItemModal}
      />

      <AddItem
        visible={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        onAddItem={handleAddItem}
        availableItems={AVAILABLE_ITEMS}
      />
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
});

