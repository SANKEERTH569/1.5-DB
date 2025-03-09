import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
  RefreshControl,
  Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  ShoppingBag, 
  Package, 
  RefreshCw,
  Filter,
  ChevronRight
} from 'lucide-react-native';
import axios from 'axios';
import AddItem from '@/components/AddItem';
import OrderCard from './OrderCard';
import EditOrderModal from './EditOrderModal';
import Input from '@/components/common/Input';
import { LinearGradient } from 'expo-linear-gradient';

// Define the type for a default order item
interface DefaultOrderItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  registration_item_id?: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation value
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchDefaultOrders();
  }, []);
  
  useEffect(() => {
    // Fade in animation when data is loaded
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [isLoading]);

  const fetchDefaultOrders = async () => {
    setIsLoading(true);
    fadeAnim.setValue(0.5);
    
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
              id: item.item_id || `manual-${item.id}`,
              name: item.name,
              price: item.price,
              unit: item.unit,
              quantity: item.quantity,
              registration_item_id: item.id,
              is_manual: item.is_manual,
            }));
          } catch (error) {
            console.error(`Error fetching items for hotel ${registration.hotelId}:`, error);
          }
        })
      );

      setDefaultOrders(registrations);
      
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error fetching registrations:', error);
      Alert.alert('Error', 'Failed to load registrations');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleBack = () => {
    router.back();
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDefaultOrders();
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
    setEditedItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, price: newPrice } : item
      )
    );
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
              const isManualItem = item.id.startsWith('manual-');
              
              await axios.post(
                `http://localhost:3000/registrations/${selectedOrder.hotelId}/items`,
                {
                  registration_id: selectedOrder.hotelId,
                  item_id: isManualItem ? null : item.id,
                  name: item.name,
                  price: item.price,
                  unit: item.unit,
                  quantity: item.quantity,
                  is_manual: isManualItem,
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
        id: dbItem.item_id || `manual-${dbItem.id}`,
        name: dbItem.name,
        price: dbItem.price,
        unit: dbItem.unit,
        quantity: dbItem.quantity,
        registration_item_id: dbItem.id,
        is_manual: dbItem.is_manual,
      }));

      setDefaultOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrder.id ? { ...order, items: updatedItems } : order
        )
      );

      Alert.alert('Success', 'Changes saved successfully');
      setIsEditMode(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error saving changes:', error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    }
  };

  const filteredOrders = defaultOrders.filter(order => 
    order.hotelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.hotelId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderOrderCard = ({ item }: { item: DefaultOrder }) => {
    const totalItems = item.items.length;
    const totalValue = item.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return (
      <TouchableOpacity 
        style={styles.orderCard}
        onPress={() => handleEditOrder(item)}
        activeOpacity={0.7}
      >
        <View style={styles.orderCardHeader}>
          <View style={styles.hotelInfoContainer}>
            <Text style={styles.hotelName}>{item.hotelName}</Text>
            <Text style={styles.hotelId}>ID: {item.hotelId}</Text>
          </View>
          <View style={styles.itemsCountContainer}>
            <Text style={styles.itemsCount}>{totalItems}</Text>
            <Text style={styles.itemsLabel}>Items</Text>
          </View>
        </View>
        
        <View style={styles.orderCardBody}>
          {item.items.length > 0 ? (
            <>
              <View style={styles.itemsList}>
                {item.items.slice(0, 3).map((item, index) => (
                  <View key={index} style={styles.itemPreview}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemDetails}>
                      {item.quantity} {item.unit} × ₹{item.price}
                    </Text>
                  </View>
                ))}
                {item.items.length > 3 && (
                  <Text style={styles.moreItems}>
                    +{item.items.length - 3} more items
                  </Text>
                )}
              </View>
              
              <View style={styles.totalValueContainer}>
                <Text style={styles.totalValueLabel}>Total Value:</Text>
                <Text style={styles.totalValue}>₹{totalValue.toFixed(2)}</Text>
              </View>
            </>
          ) : (
            <View style={styles.noItemsContainer}>
              <Text style={styles.noItemsText}>No items added yet</Text>
            </View>
          )}
        </View>
        
        <View style={styles.orderCardFooter}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEditOrder(item)}
          >
            <Text style={styles.editButtonText}>Edit Default Order</Text>
            <ChevronRight size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.primary + 'DD']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Default Orders</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          activeOpacity={0.7}
        >
          <RefreshCw size={20} color={COLORS.white} />
        </TouchableOpacity>
      </LinearGradient>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={18} color={COLORS.darkGray} style={styles.searchIcon} />
          <Input
            placeholder="Search by hotel name or ID"
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInputContainer}
            inputStyle={styles.searchInput}
          />
        </View>
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading default orders...</Text>
        </View>
      ) : (
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          <FlatList
            data={filteredOrders}
            renderItem={renderOrderCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Package size={60} color={COLORS.lightGray} />
                <Text style={styles.emptyTitle}>No Default Orders</Text>
                <Text style={styles.emptyText}>
                  {searchQuery 
                    ? 'No orders match your search criteria' 
                    : 'No default orders have been set up yet'}
                </Text>
              </View>
            }
          />
        </Animated.View>
      )}

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
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInputContainer: {
    flex: 1,
    marginBottom: 0,
    borderWidth: 0,
  },
  searchInput: {
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  contentContainer: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  hotelInfoContainer: {
    flex: 1,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  hotelId: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  itemsCountContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemsCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  itemsLabel: {
    fontSize: 12,
    color: COLORS.primary,
  },
  orderCardBody: {
    padding: 16,
  },
  itemsList: {
    marginBottom: 12,
  },
  itemPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  itemDetails: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginLeft: 8,
  },
  moreItems: {
    fontSize: 14,
    color: COLORS.primary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  totalValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalValueLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.darkGray,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  noItemsContainer: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  noItemsText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontStyle: 'italic',
  },
  orderCardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    padding: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
    marginRight: 4,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
});

