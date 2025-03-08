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

  const handleAddItem = (item: any) => {
    if (!selectedOrder) {
      Alert.alert('Error', 'No order selected.');
      return;
    }

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

    try {
      // Prepare updates and creates
      await Promise.all(
        editedItems.map(async (item) => {
          if (item.quantity <= 0) {
            // Delete item if quantity is 0
            if (item.registration_item_id) {
              await axios.delete(
                `http://localhost:3000/registrations/items/${item.registration_item_id}`
              );
            }
          } else {
            // Update or create item
            if (item.registration_item_id) {
              // Update existing item
              await axios.put(
                `http://localhost:3000/registrations/items/${item.registration_item_id}`,
                {
                  quantity: item.quantity,
                  price: item.price,
                  unit: item.unit,
                }
              );
            } else {
              // Create new item
              await axios.post(
                `http://localhost:3000/registrations/${selectedOrder.hotelId}/items`,
                {
                  registration_id: selectedOrder.hotelId,
                  item_id: item.id,
                  name: item.name,
                  price: item.price,
                  unit: item.unit,
                  quantity: item.quantity,
                }
              );
            }
          }
        })
      );

      // Refresh items after saving
      const itemsResponse = await axios.get(
        `http://localhost:3000/registrations/${selectedOrder.hotelId}/items`
      );

      const updatedItems = itemsResponse.data.map((dbItem: any) => ({
        id: dbItem.item_id,
        name: dbItem.name,
        price: dbItem.price,
        unit: dbItem.unit,
        quantity: dbItem.quantity,
        registration_item_id: dbItem.id,
      }));

      setDefaultOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrder.id ? { ...order, items: updatedItems } : order
        )
      );

      setIsEditMode(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error saving changes:', error);
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  const filteredItems = AVAILABLE_ITEMS.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderOrderItem = ({ item }: { item: DefaultOrder }) => (
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

