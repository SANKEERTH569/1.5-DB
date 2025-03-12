import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { COLORS } from '@/constants/Colors';
import Button from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { 
  Mic, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Calendar as CalendarIcon, 
  ChevronDown, 
  Search, 
  X,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

interface DefaultOrderItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  registration_item_id?: string;
}

interface RegistrationItem {
  id: number;
  registration_id: string;
  item_id: number | null;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  is_manual: boolean;
}

interface Order {
  id: number;
  hotel_id: number;
  owner_name: string;
  phone_number: string;
  location: string;
  note: string;
  total: number;
  date: string;
  status: string;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  grams: number | null;
  price: number;
  unit: string;
}

interface OrderDisplay {
  id: number;
  total: number;
  date: string;
  status: string;
  items: {
    name: string;
    quantity: number;
    grams: number;
    price: number;
    unit: string;
  }[];
}

export default function UserHomeScreen() {
  const { user } = useAuth();
  const [defaultItems, setDefaultItems] = useState<DefaultOrderItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [grams, setGrams] = useState<Record<string, number | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [showCalendar, setShowCalendar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [deliveryDates, setDeliveryDates] = useState<Record<string, any>>({});
  const [showCart, setShowCart] = useState(false);
  const [showStreak, setShowStreak] = useState(false);
  const [orderStreak, setOrderStreak] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOrderLoading, setIsOrderLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const calendarHeight = useRef(new Animated.Value(0)).current;
  const searchBarWidth = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  
  // Animation for cart badge
  const cartBadgeScale = useRef(new Animated.Value(0)).current;
  const [cartItemCount, setCartItemCount] = useState(0);

  // Animation for success animation
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchDefaultItems();
    fetchDeliveryDates();
    fetchOrderStreak();
  }, [user]);

  useEffect(() => {
    axios.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }, []);

  const fetchDeliveryDates = async () => {
    if (!user?.id) return;

    try {
      const response = await axios.get(`http://localhost:3000/registrations/${user.id}/delivery-dates`);
      const dates = response.data.reduce((acc: Record<string, any>, date: any) => {
        acc[date.date] = {
          marked: true,
          dotColor: date.status === 'available' ? COLORS.success : COLORS.error
        };
        return acc;
      }, {});
      setDeliveryDates(dates);
    } catch (err) {
      console.error('Error fetching delivery dates:', err);
    }
  };

  const fetchDefaultItems = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log('User object:', user);
      console.log('Attempting to fetch items for hotel ID:', user.id);
      
      // Get items specific to this hotel_id
      const response = await axios.get<RegistrationItem[]>(`http://localhost:3000/registrations/${user.id}/items`);
      console.log('Response from server:', response.data);
      
      if (response.data.length === 0) {
        console.log('No items found for this user');
        setError('No items have been set up for your account yet. Please contact admin.');
        return;
      }

      const items = response.data.map((item: RegistrationItem) => ({
        id: item.id.toString(),
        name: item.name,
        price: item.price,
        unit: item.unit,
        quantity: item.quantity,
        registration_item_id: item.id.toString(),
      }));

      console.log('Processed items:', items);
      setDefaultItems(items);
      
      // Initialize quantities with default values
      const initialQuantities = items.reduce((acc: Record<string, number>, item: DefaultOrderItem) => {
        acc[item.id] = 0;
        return acc;
      }, {});
      setQuantities(initialQuantities);

    } catch (err) {
      console.error('Error fetching default items:', err);
      setError('Failed to load your items. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Count items in cart
    const count = Object.values(quantities).reduce((sum, qty) => sum + qty, 0) +
                 Object.values(grams).filter(g => g !== null).length;
    setCartItemCount(count);
    
    // Animate badge when items are added
    if (count > 0) {
      Animated.sequence([
        Animated.timing(cartBadgeScale, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(cartBadgeScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [quantities, grams]);

  const toggleCalendar = () => {
    Animated.timing(calendarHeight, {
      toValue: showCalendar ? 0 : 350,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setShowCalendar(!showCalendar);
  };

  const toggleSearch = () => {
    const windowWidth = Dimensions.get('window').width;
    Animated.timing(searchBarWidth, {
      toValue: showSearch ? 0 : windowWidth - 32,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setShowSearch(!showSearch);
    if (!showSearch) {
      setSearchQuery('');
    }
  };

  const handleQuantityChange = (id: string, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + change)
    }));

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleGramsChange = (id: string, gram: number) => {
    setGrams(prev => ({
      ...prev,
      [id]: prev[id] === gram ? null : gram
    }));
  };

  const calculateTotal = () => {
    return defaultItems.reduce((total, item) => {
      const quantity = quantities[item.id] || 0;
      const gramAmount = grams[item.id] || 0;
      return total + (item.price * quantity) + (item.price * (gramAmount / 1000));
    }, 0);
  };

  const playSuccessAnimation = () => {
    successScale.setValue(0);
    successOpacity.setValue(0);
    setShowSuccess(true);

    Animated.parallel([
      Animated.sequence([
        Animated.spring(successScale, {
          toValue: 1.2,
          useNativeDriver: true,
          damping: 10,
        }),
        Animated.spring(successScale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 15,
        }),
      ]),
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Hide the success message after 2 seconds
    setTimeout(() => {
      Animated.timing(successOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowSuccess(false));
    }, 2000);
  };

  const handleConfirmOrder = async () => {
    try {
      if (!validateOrder()) {
        return;
      }

      // Prepare order items
      const orderItems = defaultItems
        .filter(item => quantities[item.id] > 0 || grams[item.id] !== null)
        .map(item => ({
          name: item.name,
          quantity: quantities[item.id] || 0,
          grams: grams[item.id] || null,
          price: Number(item.price),
          unit: item.unit
        }));

      const orderData = {
        hotel_id: user?.id,
        items: orderItems,
        note: note || '',
        total: Number(calculateTotal().toFixed(2)),
        date: selectedDate,
        status: 'pending'
      };

      console.log('Sending order data:', JSON.stringify(orderData, null, 2));

      const response = await axios.post(
        'http://localhost:3000/api/orders',
        orderData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        // Clear cart
        setQuantities({});
        setGrams({});
        setNote('');
        setShowCart(false);
        
        // Show success animation
        playSuccessAnimation();
        
        alert('Order placed successfully!');
      }
    } catch (err) {
      console.error('Order error:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to place order. Please try again.');
    }
  };

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    toggleCalendar();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  function getTodayDate() {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  }
  
  const filteredItems = searchQuery 
    ? defaultItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : defaultItems;

  // Header animation based on scroll
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [Platform.OS === 'ios' ? 130 : 120, Platform.OS === 'ios' ? 90 : 80],
    extrapolate: 'clamp',
  });
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });
  
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const getCartItems = () => {
    return defaultItems.filter(item => quantities[item.id] > 0 || grams[item.id] !== null);
  };

  const removeFromCart = (id: string) => {
    setQuantities(prev => ({ ...prev, [id]: 0 }));
    setGrams(prev => ({ ...prev, [id]: null }));
  };

  const fetchOrderStreak = async () => {
    if (!user?.id) return;

    try {
      const response = await axios.get(`http://localhost:3000/registrations/${user.id}/streak`);
      setOrderStreak(response.data.streak || 0);
    } catch (err) {
      console.error('Error fetching order streak:', err);
    }
  };

  // Update the validateOrder function
  const validateOrder = () => {
    if (!user?.id) {
      alert('Please log in to place an order');
      return false;
    }

    if (cartItemCount === 0) {
      alert('Please add items to your cart');
      return false;
    }

    const orderItems = defaultItems.filter(
      item => quantities[item.id] > 0 || grams[item.id] !== null
    );

    if (orderItems.length === 0) {
      alert('Please add at least one item to your order');
      return false;
    }

    if (calculateTotal() <= 0) {
      alert('Order total must be greater than 0');
      return false;
    }

    return true;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <LinearGradient
          colors={[COLORS.white, COLORS.white, COLORS.white + 'F9']}
          style={styles.headerGradient}
        />
        
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Package size={18} color={COLORS.primary} />
              </View>
              <Animated.Text style={[styles.headerTitle, { opacity: headerOpacity }]}>
                THATKart
              </Animated.Text>
            </View>
            
            <Animated.Text style={[styles.scrolledTitle, { opacity: headerTitleOpacity }]}>
              Today's Grocery
            </Animated.Text>
            
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={[styles.iconButton, styles.streakButton]}
                onPress={() => setShowStreak(true)}
                activeOpacity={0.7}
              >
                <View style={styles.streakContainer}>
                  <Clock size={16} color={COLORS.primary} />
                  <Text style={styles.streakCount}>{orderStreak}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.iconButton}
                onPress={toggleSearch}
                activeOpacity={0.7}
              >
                {showSearch ? (
                  <X size={20} color={COLORS.text} />
                ) : (
                  <Search size={20} color={COLORS.text} />
                )}
              </TouchableOpacity>
              
              <View style={styles.cartIconContainer}>
                <TouchableOpacity 
                  style={[styles.cartButton, cartItemCount > 0 && styles.cartButtonActive]}
                  activeOpacity={0.7}
                  onPress={() => setShowCart(true)}
                >
                  <ShoppingBag size={20} color={cartItemCount > 0 ? COLORS.primary : COLORS.text} />
                  {cartItemCount > 0 && (
                    <Animated.View 
                      style={[
                        styles.cartBadge,
                        { transform: [{ scale: cartBadgeScale }] }
                      ]}
                    >
                      <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                    </Animated.View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <View style={styles.userInfoContainer}>
            <View style={styles.hotelInfo}>
              <Text style={styles.hotelName}>{user?.shop_name || 'Hotel Name'}</Text>
              <Text style={styles.ownerName}>Owner: {user?.owner_name || 'Owner Name'}</Text>
            </View>
            <View style={styles.hotelIdContainer}>
              <Text style={styles.hotelIdLabel}>Hotel ID:</Text>
              <Text style={styles.hotelId}>{user?.id}</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Date Selection */}
      <View style={styles.dateContainer}>
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={toggleCalendar}
          activeOpacity={0.7}
        >
          <CalendarIcon size={16} color={COLORS.darkGray} />
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          <ChevronDown size={16} color={COLORS.darkGray} />
        </TouchableOpacity>
      </View>

      {/* Calendar Modal */}
      <Animated.View style={[styles.calendarContainer, { height: calendarHeight }]}>
        <Calendar
          current={selectedDate}
          markedDates={{
            ...deliveryDates,
            [selectedDate]: {
              selected: true,
              selectedColor: COLORS.primary,
            },
          }}
          onDayPress={handleDayPress}
          theme={{
            selectedDayBackgroundColor: COLORS.primary,
            todayTextColor: COLORS.primary,
            arrowColor: COLORS.primary,
          }}
        />
      </Animated.View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your items...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <AlertCircle size={50} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Try Again"
            onPress={fetchDefaultItems}
            variant="primary"
            size="small"
            style={styles.retryButton}
          />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          <View style={styles.content}>
            {filteredItems.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Package size={60} color={COLORS.lightGray} />
                <Text style={styles.emptyTitle}>
                  {searchQuery ? 'No items found' : 'No items available'}
                </Text>
                <Text style={styles.emptyText}>
                  {searchQuery 
                    ? 'Try searching with a different keyword'
                    : 'Your admin has not set up any items yet'}
                </Text>
              </View>
            ) : (
              <>
                {filteredItems.map((item) => (
                  <View key={item.id} style={styles.itemCard}>
                    <View style={styles.itemContent}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemPrice}>₹{item.price}/{item.unit}</Text>
                      </View>
                      
                      <View style={styles.quantityContainer}>
                        <View style={styles.quantityControls}>
                          <TouchableOpacity
                            style={[
                              styles.quantityButton,
                              quantities[item.id] === 0 && styles.quantityButtonDisabled
                            ]}
                            onPress={() => handleQuantityChange(item.id, -1)}
                            disabled={quantities[item.id] === 0}
                          >
                            <Minus size={16} color={quantities[item.id] === 0 ? COLORS.lightGray : COLORS.text} />
                          </TouchableOpacity>

                          <Text style={styles.quantityText}>{quantities[item.id] || 0}</Text>

                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange(item.id, 1)}
                          >
                            <Plus size={16} color={COLORS.text} />
                          </TouchableOpacity>
                        </View>

                        <View style={styles.gramsContainer}>
                          {[100, 250, 500, 750].map((gram) => (
                            <TouchableOpacity
                              key={gram}
                              style={[
                                styles.gramButton,
                                grams[item.id] === gram && styles.gramButtonActive
                              ]}
                              onPress={() => handleGramsChange(item.id, gram as number)}
                            >
                              <Text
                                style={[
                                  styles.gramText,
                                  grams[item.id] === gram && styles.gramTextActive
                                ]}
                              >
                                {gram}g
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>
                ))}

                {/* Order Note */}
                <View style={styles.noteContainer}>
                  <Text style={styles.noteLabel}>Add Note (Optional)</Text>
                  <View style={styles.noteInputContainer}>
                    <TextInput
                      style={styles.noteInput}
                      placeholder="Add any special instructions..."
                      value={note}
                      onChangeText={setNote}
                      multiline
                      numberOfLines={3}
                    />
                    <TouchableOpacity style={styles.micButton}>
                      <Mic size={20} color={COLORS.darkGray} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Total and Confirm Button */}
                <View style={styles.totalContainer}>
                  <View style={styles.totalInfo}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalAmount}>₹{calculateTotal().toFixed(2)}</Text>
                  </View>

                  <Button
                    title="Confirm Order"
                    onPress={() => {
                      if (validateOrder()) {
                        handleConfirmOrder();
                      }
                    }}
                    variant="primary"
                    size="large"
                    style={styles.confirmButton}
                    disabled={cartItemCount === 0}
                  />
                </View>
              </>
            )}
          </View>
        </ScrollView>
      )}

      {/* Cart Modal */}
      {showCart && (
        <View style={styles.modalOverlay}>
          <View style={styles.cartModal}>
            <View style={styles.cartModalHeader}>
              <Text style={styles.cartTitle}>Added Items</Text>
              <TouchableOpacity 
                onPress={() => setShowCart(false)}
                style={styles.closeButton}
              >
                <X size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.cartItemsList}>
              {getCartItems().map(item => (
                <View key={item.id} style={styles.cartItem}>
                  <Text style={styles.cartItemName}>{item.name}</Text>
                  <View style={styles.cartItemQuantityPrice}>
                    <Text style={styles.cartItemQuantity}>
                      {quantities[item.id] > 0 ? `${quantities[item.id]} ${item.unit}` : ''}
                      {grams[item.id] ? `${grams[item.id]}g` : ''}
                    </Text>
                    <Text style={styles.cartItemPrice}>
                      ₹{((quantities[item.id] || 0) * item.price + 
                        ((grams[item.id] || 0) / 1000) * item.price).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.cartFooter}>
              <View style={styles.cartTotal}>
                <Text style={styles.cartTotalLabel}>Total:</Text>
                <Text style={styles.cartTotalAmount}>₹{calculateTotal().toFixed(2)}</Text>
              </View>
              <Button
                title="Place Order"
                onPress={handleConfirmOrder}
                variant="primary"
                size="large"
                style={styles.checkoutButton}
              />
            </View>
          </View>
        </View>
      )}

      {/* Streak Modal */}
      {showStreak && (
        <View style={styles.modalOverlay}>
          <View style={[styles.cartModal, styles.streakModal]}>
            <View style={styles.cartModalHeader}>
              <Text style={styles.cartTitle}>Order Streak</Text>
              <TouchableOpacity 
                onPress={() => setShowStreak(false)}
                style={styles.closeButton}
              >
                <X size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.streakContent}>
              <View style={styles.streakCircle}>
                <Text style={styles.streakNumber}>{orderStreak}</Text>
                <Text style={styles.streakDays}>Days</Text>
              </View>
              <Text style={styles.streakMessage}>
                {orderStreak > 0 
                  ? `Great job! You've ordered consistently for ${orderStreak} days.`
                  : 'Start your streak by placing your first order!'}
              </Text>
              <View style={styles.streakInfo}>
                <Clock size={16} color={COLORS.primary} />
                <Text style={styles.streakInfoText}>
                  Order daily to maintain your streak
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {showSuccess && (
        <View style={styles.successOverlay}>
          <Animated.View 
            style={[
              styles.successModal,
              {
                opacity: successOpacity,
                transform: [{ scale: successScale }]
              }
            ]}
          >
            <View style={styles.successIconContainer}>
              <CheckCircle size={40} color={COLORS.success} />
            </View>
            <Text style={styles.successTitle}>Order Placed!</Text>
            <Text style={styles.successMessage}>Your order has been successfully placed</Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: COLORS.primary,
    marginLeft: 8,
  },
  scrolledTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartIconContainer: {
    marginLeft: 8,
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButtonActive: {
    backgroundColor: COLORS.primary + '15',
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray + '30',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
    marginRight: 8,
  },
  hotelIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  hotelIdLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: COLORS.darkGray,
    marginRight: 6,
  },
  hotelId: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: COLORS.text,
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  scrollView: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 130 : 120,
  },
  content: {
    paddingBottom: 30,
  },
  dateContainer: {
    marginBottom: 24,
  },
  dateLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
  },
  dateList: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  dateCard: {
    marginRight: 12,
    padding: 12,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  selectedDateCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.text,
  },
  selectedDateText: {
    color: COLORS.white,
  },
  listContainer: {
    flex: 1,
    paddingTop: 8,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: COLORS.text,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.lightGray + '50',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  calendarContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
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
    fontFamily: 'Inter-Medium',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    marginTop: 12,
    marginBottom: 24,
    fontSize: 16,
    color: COLORS.error,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  retryButton: {
    width: 120,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.text,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  itemCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.text,
  },
  itemPrice: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  quantityContainer: {
    marginTop: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray + '30',
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.text,
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  gramsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  gramButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray + '30',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  gramButtonActive: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary,
  },
  gramText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.text,
  },
  gramTextActive: {
    color: COLORS.primary,
  },
  noteContainer: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginTop: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 8,
  },
  noteInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  noteInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: 8,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  micButton: {
    padding: 8,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  totalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.text,
  },
  totalAmount: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: COLORS.primary,
  },
  confirmButton: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  cartModal: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    paddingVertical: 16,
  },
  cartModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  cartTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  cartItemsList: {
    maxHeight: '60%',
    paddingTop: 8,
  },
  cartItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray + '20',
  },
  cartItemName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  cartItemQuantityPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartItemQuantity: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  cartItemPrice: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: COLORS.primary,
  },
  cartFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  cartTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cartTotalLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.text,
  },
  cartTotalAmount: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: COLORS.primary,
  },
  checkoutButton: {
    marginTop: 8,
  },
  userInfoContainer: {
    marginBottom: 12,
  },
  hotelInfo: {
    marginBottom: 8,
  },
  hotelName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 2,
  },
  ownerName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  streakButton: {
    backgroundColor: COLORS.primary + '15',
    marginRight: 8,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakCount: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 4,
  },
  streakModal: {
    maxHeight: '40%',
  },
  streakContent: {
    padding: 20,
    alignItems: 'center',
  },
  streakCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  streakNumber: {
    fontFamily: 'Poppins-Bold',
    fontSize: 36,
    color: COLORS.primary,
  },
  streakDays: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.primary,
  },
  streakMessage: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  streakInfoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 8,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  successModal: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '80%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.success + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: COLORS.text,
    marginBottom: 8,
  },
  successMessage: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
});