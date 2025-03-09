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
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { COLORS } from '@/constants/Colors';
import Button from '@/components/common/Button';
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
  CheckCircle
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Mock data for grocery items
const GROCERY_ITEMS = [
  { id: 1, name: 'Rice', price: 50, unit: 'kg' },
  { id: 2, name: 'Wheat Flour', price: 40, unit: 'kg' },
  { id: 3, name: 'Sugar', price: 45, unit: 'kg' },
  { id: 4, name: 'Cooking Oil', price: 120, unit: 'liter' },
  { id: 5, name: 'Milk', price: 60, unit: 'liter' },
  { id: 6, name: 'Tomatoes', price: 30, unit: 'kg' },
  { id: 7, name: 'Onions', price: 25, unit: 'kg' },
  { id: 8, name: 'Potatoes', price: 20, unit: 'kg' },
  { id: 9, name: 'Lentils', price: 90, unit: 'kg' },
  { id: 10, name: 'Salt', price: 15, unit: 'kg' },
];

// Mock data for delivery dates
const DELIVERY_DATES = {
  '2025-01-05': { marked: true, dotColor: COLORS.success },
  '2025-01-10': { marked: true, dotColor: COLORS.success },
  '2025-01-15': { marked: true, dotColor: COLORS.error },
  '2025-01-20': { marked: true, dotColor: COLORS.success },
};

type Grams = 100 | 250 | 500 | 750;

export default function UserHomeScreen() {
  const [quantities, setQuantities] = useState<Record<number, number>>(
    GROCERY_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {})
  );
  const [grams, setGrams] = useState<Record<number, Grams | null>>(
    GROCERY_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: null }), {})
  );
  const [note, setNote] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [showCalendar, setShowCalendar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const hotelId = 'KIR001'; // Mock hotel ID
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const calendarHeight = useRef(new Animated.Value(0)).current;
  const searchBarWidth = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  
  // Animation for cart badge
  const cartBadgeScale = useRef(new Animated.Value(0)).current;
  const [cartItemCount, setCartItemCount] = useState(0);
  
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
    } else {
      cartBadgeScale.setValue(0);
    }
  }, [quantities, grams]);

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
    Animated.timing(calendarHeight, {
      toValue: showCalendar ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  
  const toggleSearch = () => {
    setShowSearch(!showSearch);
    Animated.timing(searchBarWidth, {
      toValue: showSearch ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    if (!showSearch) {
      setSearchQuery('');
    }
  };

  const handleQuantityChange = (id: number, change: number) => {
    setQuantities((prev) => {
      const newQuantity = Math.max(0, (prev[id] || 0) + change);
      return { ...prev, [id]: newQuantity };
    });
    
    // Animate button press
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleGramsChange = (id: number, gram: Grams) => {
    setGrams((prev) => {
      if (prev[id] === gram) {
        return { ...prev, [id]: null };
      } else {
        return { ...prev, [id]: gram };
      }
    });
  };

  const calculateTotal = () => {
    return GROCERY_ITEMS.reduce((total, item) => {
      const itemQuantity = quantities[item.id] || 0;
      const itemGrams = grams[item.id] || 0;
      const price = itemQuantity * item.price + (itemGrams / 1000) * item.price;
      return total + price;
    }, 0);
  };

  const handleConfirmOrder = () => {
    // In a real app, this would send the order to Firebase
    console.log('Order confirmed:', {
      items: GROCERY_ITEMS.filter(
        (item) => quantities[item.id] > 0 || grams[item.id] !== null
      ).map((item) => ({
        ...item,
        quantity: quantities[item.id],
        grams: grams[item.id],
      })),
      note,
      total: calculateTotal(),
      date: selectedDate,
    });

    // Reset form
    setQuantities(
      GROCERY_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {})
    );
    setGrams(
      GROCERY_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: null }), {})
    );
    setNote('');

    // Show success message (in a real app, this would be a proper notification)
    alert('Order confirmed successfully!');
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
    ? GROCERY_ITEMS.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : GROCERY_ITEMS;

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
                  style={styles.iconButton}
                  activeOpacity={0.7}
                >
                  <ShoppingBag size={20} color={COLORS.text} />
                </TouchableOpacity>
                
                {cartItemCount > 0 && (
                  <Animated.View 
                    style={[
                      styles.cartBadge,
                      { transform: [{ scale: cartBadgeScale }] }
                    ]}
                  >
                    <Text style={styles.cartBadgeText}>
                      {cartItemCount}
                    </Text>
                  </Animated.View>
                )}
              </View>
            </View>
          </View>
          
          <Animated.View 
            style={[
              styles.searchContainer, 
              { 
                width: searchBarWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                }),
                opacity: searchBarWidth
              }
            ]}
          >
            <Search size={16} color={COLORS.darkGray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search groceries..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={showSearch}
            />
          </Animated.View>
          
          <Animated.View style={[styles.hotelIdContainer, { opacity: headerOpacity }]}>
            <Text style={styles.hotelIdLabel}>Hotel ID:</Text>
            <Text style={styles.hotelId}>{hotelId}</Text>
          </Animated.View>
        </View>
      </Animated.View>

      <Animated.ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.deliveryDateContainer}>
          <View style={styles.sectionTitleRow}>
            <CalendarIcon size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Delivery Date</Text>
          </View>
          
          <TouchableOpacity 
            onPress={toggleCalendar} 
            style={styles.dateSelector}
            activeOpacity={0.7}
          >
            <View style={styles.dateSelectorContent}>
              <Clock size={16} color={COLORS.darkGray} style={styles.dateIcon} />
              <Text style={styles.dateText}>
                {formatDate(selectedDate)}
              </Text>
            </View>
            <ChevronDown size={18} color={COLORS.darkGray} />
          </TouchableOpacity>

          <Animated.View 
            style={[
              styles.calendarWrapper,
              {
                height: calendarHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 350]
                }),
                opacity: calendarHeight,
                marginTop: calendarHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 16]
                })
              }
            ]}
          >
            {showCalendar && (
              <View style={styles.calendarContainer}>
                <Calendar
                  markedDates={{
                    ...DELIVERY_DATES,
                    [selectedDate]: { selected: true, selectedColor: COLORS.primary }
                  }}
                  onDayPress={handleDayPress}
                  theme={{
                    todayTextColor: COLORS.primary,
                    arrowColor: COLORS.primary,
                    dotColor: COLORS.primary,
                    selectedDayBackgroundColor: COLORS.primary,
                    textDayFontFamily: 'Inter-Regular',
                    textMonthFontFamily: 'Poppins-SemiBold',
                    textDayHeaderFontFamily: 'Inter-Medium',
                  }}
                />

                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, { backgroundColor: COLORS.success }]}
                    />
                    <Text style={styles.legendText}>Successful Delivery</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: COLORS.error }]} />
                    <Text style={styles.legendText}>Missed Delivery</Text>
                  </View>
                </View>
              </View>
            )}
          </Animated.View>
        </View>

        <View style={styles.groceryListContainer}>
          <View style={styles.sectionTitleRow}>
            <ShoppingBag size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Today's Grocery List</Text>
          </View>

          {filteredItems.map((item) => (
            <View key={item.id} style={styles.groceryItem}>
              <View style={styles.itemColorIndicator} />
              
              <View style={styles.itemDetails}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>
                    ₹{item.price}/{item.unit}
                  </Text>
                </View>

                <View style={styles.quantityContainer}>
                  <View style={styles.quantityControl}>
                    <TouchableOpacity
                      style={[
                        styles.quantityButton,
                        quantities[item.id] === 0 && styles.quantityButtonDisabled
                      ]}
                      onPress={() => handleQuantityChange(item.id, -1)}
                      disabled={quantities[item.id] === 0}
                      activeOpacity={0.7}
                    >
                      <Minus size={16} color={quantities[item.id] === 0 ? COLORS.gray : COLORS.text} />
                    </TouchableOpacity>

                    <Text style={styles.quantityText}>{quantities[item.id] || 0}</Text>

                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleQuantityChange(item.id, 1)}
                      activeOpacity={0.7}
                    >
                      <Plus size={16} color={COLORS.text} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.additionalQuantities}>
                    {[100, 250, 500, 750].map((quantity) => (
                      <TouchableOpacity
                        key={quantity}
                        style={[
                          styles.additionalQuantityButton,
                          grams[item.id] === quantity && styles.additionalQuantityButtonActive,
                        ]}
                        onPress={() =>
                          handleGramsChange(item.id, quantity as Grams)
                        }
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.additionalQuantityText,
                            grams[item.id] === quantity && styles.additionalQuantityTextActive,
                          ]}
                        >
                          {quantity}g
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          ))}

          <View style={styles.totalContainer}>
            <View style={styles.totalLabelContainer}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalItems}>
                {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
              </Text>
            </View>
            <Text style={styles.totalAmount}>₹{calculateTotal().toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.noteContainer}>
          <View style={styles.sectionTitleRow}>
            <Mic size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Additional Notes</Text>
          </View>
          
          <View style={styles.noteInputContainer}>
            <TextInput
              style={styles.noteInput}
              placeholder="Add any special requests here..."
              value={note}
              onChangeText={setNote}
              multiline
            />
            <TouchableOpacity 
              style={styles.micButton}
              activeOpacity={0.7}
            >
              <Mic size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <Animated.View 
          style={[
            styles.buttonContainer,
            { transform: [{ scale: buttonScale }] }
          ]}
        >
          <Button
            title={`Confirm Order • ₹${calculateTotal().toFixed(2)}`}
            onPress={handleConfirmOrder}
            variant="primary"
            size="large"
            style={[
              styles.confirmButton,
              calculateTotal() === 0 && styles.disabledButton
            ]}
            disabled={calculateTotal() === 0}
          />
          
          {calculateTotal() > 0 && (
            <View style={styles.deliveryInfoContainer}>
              <CheckCircle size={14} color={COLORS.success} />
              <Text style={styles.deliveryInfoText}>
                Estimated delivery on {formatDate(selectedDate)}
              </Text>
            </View>
          )}
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#F8F9FA',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    backgroundColor: COLORS.lightGray + '50',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  cartIconContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
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
    backgroundColor: COLORS.lightGray + '50',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
    paddingVertical: 4,
  },
  hotelIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  hotelIdLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.darkGray,
    marginRight: 4,
  },
  hotelId: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: COLORS.text,
    backgroundColor: COLORS.lightGray + '70',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 130 : 120,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  deliveryDateContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.text,
    marginLeft: 8,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.lightGray + '50',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  dateSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: COLORS.text,
  },
  calendarWrapper: {
    overflow: 'hidden',
  },
  calendarContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray + '50',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.darkGray,
  },
  groceryListContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  groceryItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray + '50',
  },
  itemColorIndicator: {
    width: 4,
    height: '80%',
    alignSelf: 'center',
    backgroundColor: COLORS.primary + '40',
    borderRadius: 2,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray + '80',
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
  additionalQuantities: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  additionalQuantityButton: {
    backgroundColor: COLORS.lightGray + '50',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray + '80',
  },
  additionalQuantityButtonActive: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary + '30',
  },
  additionalQuantityText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.text,
  },
  additionalQuantityTextActive: {
    fontFamily: 'Inter-SemiBold',
    color: COLORS.primary,
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
  totalLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.text,
  },
  totalItems: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
    marginLeft: 8,
  },
  totalAmount: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
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
  confirmButton: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
  disabledButton: {
    opacity: 0.5,
  },
  deliveryInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  deliveryInfoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
    marginLeft: 8,
  },
  buttonContainer: {
    alignItems: 'center',
  },
});