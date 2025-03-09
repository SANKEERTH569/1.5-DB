import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Modal,
  Animated,
  StatusBar,
  Platform,
  ScrollView,
  Dimensions
} from 'react-native';
import { COLORS } from '@/constants/Colors';
import { Calendar } from 'react-native-calendars';
import { 
  ChevronDown, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Package, 
  X, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Filter,
  Clock
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Mock data for past orders
const PAST_ORDERS = [
  {
    id: '1',
    date: '2025-01-05',
    items: [
      { name: 'Rice', quantity: 5, price: 50, unit: 'kg' },
      { name: 'Wheat Flour', quantity: 2, price: 40, unit: 'kg' },
      { name: 'Cooking Oil', quantity: 3, price: 120, unit: 'liter' },
    ],
    total: 610,
    status: 'Delivered',
    deliveryTime: '10:30 AM'
  },
  {
    id: '2',
    date: '2025-01-10',
    items: [
      { name: 'Milk', quantity: 10, price: 60, unit: 'liter' },
      { name: 'Tomatoes', quantity: 3, price: 30, unit: 'kg' },
      { name: 'Onions', quantity: 4, price: 25, unit: 'kg' },
    ],
    total: 790,
    status: 'Delivered',
    deliveryTime: '11:45 AM'
  },
  {
    id: '3',
    date: '2025-01-15',
    items: [
      { name: 'Potatoes', quantity: 5, price: 20, unit: 'kg' },
      { name: 'Lentils', quantity: 2, price: 90, unit: 'kg' },
      { name: 'Salt', quantity: 1, price: 15, unit: 'kg' },
    ],
    total: 295,
    status: 'Failed',
    deliveryTime: '09:15 AM'
  },
  {
    id: '4',
    date: '2025-01-20',
    items: [
      { name: 'Rice', quantity: 10, price: 50, unit: 'kg' },
      { name: 'Sugar', quantity: 3, price: 45, unit: 'kg' },
      { name: 'Cooking Oil', quantity: 2, price: 120, unit: 'liter' },
    ],
    total: 765,
    status: 'Delivered',
    deliveryTime: '02:30 PM'
  },
];

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export default function OrdersScreen() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredOrders, setFilteredOrders] = useState(PAST_ORDERS);
  
  // Animation values
  const modalAnimation = useRef(new Animated.Value(0)).current;
  const filterAnimation = useRef(new Animated.Value(0)).current;
  
  // Create marked dates for calendar
  const markedDates = PAST_ORDERS.reduce((acc, order) => {
    const color = order.status === 'Delivered' ? COLORS.success : COLORS.error;
    return {
      ...acc,
      [order.date]: { marked: true, dotColor: color },
    };
  }, {});

  const handleDateSelect = (day: any) => {
    setSelectedDate(day.dateString);
    
    // Animate filter closing
    Animated.timing(filterAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsCalendarVisible(false);
    });
    
    // Filter orders by selected date
    if (day.dateString) {
      const filtered = PAST_ORDERS.filter(order => order.date === day.dateString);
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(PAST_ORDERS);
    }
  };

  const clearDateFilter = () => {
    setSelectedDate('');
    setFilteredOrders(PAST_ORDERS);
  };
  
  const openCalendarModal = () => {
    setIsCalendarVisible(true);
    Animated.timing(filterAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  
  const closeCalendarModal = () => {
    Animated.timing(filterAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsCalendarVisible(false);
    });
  };
  
  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  
  const closeOrderDetails = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSelectedOrder(null);
    });
  };

  const renderOrderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => openOrderDetails(item)}
      activeOpacity={0.7}
    >
      <View style={[
        styles.statusIndicator,
        item.status === 'Delivered' ? styles.deliveredIndicator : styles.failedIndicator
      ]} />
      
      <View style={styles.orderContent}>
        <View style={styles.orderHeader}>
          <View style={styles.orderDateContainer}>
            <CalendarIcon size={14} color={COLORS.darkGray} style={styles.dateIcon} />
            <Text style={styles.orderDate}>{formatDate(item.date)}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            item.status === 'Delivered' ? styles.deliveredBadge : styles.failedBadge
          ]}>
            {item.status === 'Delivered' ? (
              <CheckCircle size={12} color={COLORS.success} style={styles.statusIcon} />
            ) : (
              <AlertCircle size={12} color={COLORS.error} style={styles.statusIcon} />
            )}
            <Text style={[
              styles.statusText,
              item.status === 'Delivered' ? styles.deliveredText : styles.failedText
            ]}>
              {item.status}
            </Text>
          </View>
        </View>
        
        <View style={styles.orderItems}>
          {item.items.slice(0, 2).map((orderItem: any, index: number) => (
            <Text key={index} style={styles.orderItemText} numberOfLines={1}>
              • {orderItem.quantity} {orderItem.unit} {orderItem.name}
            </Text>
          ))}
          {item.items.length > 2 && (
            <Text style={styles.moreItemsText}>
              +{item.items.length - 2} more items
            </Text>
          )}
        </View>
        
        <View style={styles.orderFooter}>
          <View style={styles.orderSummary}>
            <Text style={styles.itemCount}>
              {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
            </Text>
            <Text style={styles.orderTotal}>₹{item.total.toFixed(2)}</Text>
          </View>
          
          <View style={styles.viewDetailsContainer}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <ChevronRight size={14} color={COLORS.primary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order History</Text>
        
        <View style={styles.filterSection}>
          <TouchableOpacity 
            style={styles.dateFilterButton}
            onPress={openCalendarModal}
            activeOpacity={0.7}
          >
            <Filter size={14} color={COLORS.darkGray} style={styles.filterIcon} />
            <Text style={styles.filterButtonText}>
              {selectedDate ? formatDate(selectedDate) : 'All Orders'}
            </Text>
            <ChevronDown size={14} color={COLORS.darkGray} />
          </TouchableOpacity>
          
          {selectedDate ? (
            <TouchableOpacity 
              style={styles.clearFilterButton}
              onPress={clearDateFilter}
              activeOpacity={0.7}
            >
              <X size={14} color={COLORS.primary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      
      {filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Package size={60} color={COLORS.lightGray} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>No orders found</Text>
          <Text style={styles.emptyText}>
            {selectedDate 
              ? `You don't have any orders on ${formatDate(selectedDate)}`
              : "You haven't placed any orders yet"}
          </Text>
          
          {selectedDate && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={clearDateFilter}
            >
              <Text style={styles.viewAllText}>View All Orders</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {/* Calendar Modal */}
      <Modal
        visible={isCalendarVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeCalendarModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.calendarModal,
              {
                transform: [
                  {
                    translateY: filterAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [500, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeCalendarModal}
              >
                <X size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <Calendar
              markedDates={{
                ...markedDates,
                [selectedDate]: { selected: true, selectedColor: COLORS.primary }
              }}
              onDayPress={handleDateSelect}
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
                <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
                <Text style={styles.legendText}>Successful Delivery</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.error }]} />
                <Text style={styles.legendText}>Failed Delivery</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.applyFilterButton}
              onPress={closeCalendarModal}
            >
              <Text style={styles.applyFilterText}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
      
      {/* Order Details Modal */}
      <Modal
        visible={!!selectedOrder}
        transparent={true}
        animationType="none"
        onRequestClose={closeOrderDetails}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.orderDetailsModal,
              {
                transform: [
                  {
                    translateY: modalAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <View style={styles.orderDetailHeader}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={closeOrderDetails}
              >
                <ArrowLeft size={20} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.orderDetailTitle}>Order Details</Text>
              <View style={{ width: 20 }} />
            </View>
            
            <ScrollView 
              style={styles.orderDetailContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.statusCard}>
                <View style={[
                  styles.statusIconContainer,
                  { backgroundColor: selectedOrder?.status === 'Delivered' ? COLORS.success : COLORS.error }
                ]}>
                  {selectedOrder?.status === 'Delivered' ? (
                    <CheckCircle size={24} color={COLORS.white} />
                  ) : (
                    <AlertCircle size={24} color={COLORS.white} />
                  )}
                </View>
                
                <View style={styles.statusTextContainer}>
                  <Text style={styles.statusTitle}>
                    {selectedOrder?.status === 'Delivered' 
                      ? 'Order Delivered Successfully' 
                      : 'Delivery Failed'}
                  </Text>
                  <Text style={styles.statusDescription}>
                    {selectedOrder?.status === 'Delivered' 
                      ? `Your order was delivered on ${formatDate(selectedOrder?.date)} at ${selectedOrder?.deliveryTime}.` 
                      : `We couldn't deliver your order on ${formatDate(selectedOrder?.date)}. Please contact support for assistance.`}
                  </Text>
                </View>
              </View>
              
              <View style={styles.orderInfoCard}>
                <View style={styles.orderInfoRow}>
                  <Text style={styles.orderInfoLabel}>Order Date</Text>
                  <Text style={styles.orderInfoValue}>
                    {selectedOrder ? formatDate(selectedOrder.date) : ''}
                  </Text>
                </View>
                
                <View style={styles.orderInfoRow}>
                  <Text style={styles.orderInfoLabel}>Delivery Time</Text>
                  <Text style={styles.orderInfoValue}>
                    {selectedOrder?.deliveryTime}
                  </Text>
                </View>
                
                <View style={styles.orderInfoRow}>
                  <Text style={styles.orderInfoLabel}>Status</Text>
                  <View style={[
                    styles.statusBadge,
                    selectedOrder?.status === 'Delivered' ? styles.deliveredBadge : styles.failedBadge,
                    { marginTop: 0 }
                  ]}>
                    {selectedOrder?.status === 'Delivered' ? (
                      <CheckCircle size={12} color={COLORS.success} style={styles.statusIcon} />
                    ) : (
                      <AlertCircle size={12} color={COLORS.error} style={styles.statusIcon} />
                    )}
                    <Text style={[
                      styles.statusText,
                      selectedOrder?.status === 'Delivered' ? styles.deliveredText : styles.failedText
                    ]}>
                      {selectedOrder?.status}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.itemsContainer}>
                <Text style={styles.itemsTitle}>Order Items</Text>
                {selectedOrder?.items.map((item: any, index: number) => (
                  <View key={index} style={styles.orderDetailItem}>
                    <View style={styles.itemDetail}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemQuantity}>
                        {item.quantity} {item.unit} × ₹{item.price}/{item.unit}
                      </Text>
                    </View>
                    <Text style={styles.itemTotal}>
                      ₹{(item.quantity * item.price).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.priceSummaryContainer}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Subtotal</Text>
                  <Text style={styles.priceValue}>₹{selectedOrder?.total.toFixed(2)}</Text>
                </View>
                
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Delivery Fee</Text>
                  <Text style={styles.priceValue}>₹0.00</Text>
                </View>
                
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>₹{selectedOrder?.total.toFixed(2)}</Text>
                </View>
              </View>
              
              <View style={styles.deliveryInfoContainer}>
                <Text style={styles.deliveryInfoTitle}>Delivery Information</Text>
                
                <View style={styles.deliveryInfoRow}>
                  <View style={styles.deliveryInfoIconContainer}>
                    <Package size={16} color={COLORS.primary} />
                  </View>
                  <View style={styles.deliveryInfoContent}>
                    <Text style={styles.deliveryInfoLabel}>Delivery Method</Text>
                    <Text style={styles.deliveryInfoValue}>Standard Delivery</Text>
                  </View>
                </View>
                
                <View style={styles.deliveryInfoRow}>
                  <View style={styles.deliveryInfoIconContainer}>
                    <Clock size={16} color={COLORS.primary} />
                  </View>
                  <View style={styles.deliveryInfoContent}>
                    <Text style={styles.deliveryInfoLabel}>Delivery Time</Text>
                    <Text style={styles.deliveryInfoValue}>{selectedOrder?.deliveryTime}</Text>
                  </View>
                </View>
                
                {selectedOrder?.status === 'Failed' && (
                  <View style={styles.deliveryFailureContainer}>
                    <AlertCircle size={16} color={COLORS.error} style={styles.deliveryFailureIcon} />
                    <Text style={styles.deliveryFailureText}>
                      Delivery failed. Please contact customer support for assistance.
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.reorderButton}
                onPress={closeOrderDetails}
              >
                <Text style={styles.reorderButtonText}>Reorder</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#F8F9FA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: COLORS.text,
    marginBottom: 16,
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray + '40',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.text,
    marginRight: 6,
  },
  clearFilterButton: {
    marginLeft: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ordersList: {
    padding: 16,
    paddingBottom: 30,
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  statusIndicator: {
    width: 4,
    height: '100%',
  },
  deliveredIndicator: {
    backgroundColor: COLORS.success,
  },
  failedIndicator: {
    backgroundColor: COLORS.error,
  },
  orderContent: {
    flex: 1,
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 6,
  },
  orderDate: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusIcon: {
    marginRight: 4,
  },
  deliveredBadge: {
    backgroundColor: COLORS.success + '15',
  },
  failedBadge: {
    backgroundColor: COLORS.error + '15',
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  deliveredText: {
    color: COLORS.success,
  },
  failedText: {
    color: COLORS.error,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItemText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  moreItemsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray + '50',
  },
  orderSummary: {
    flexDirection: 'column',
  },
  itemCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  orderTotal: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.text,
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewDetailsText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: COLORS.primary,
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 24,
  },
  viewAllButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  viewAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  calendarModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.lightGray + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginTop: 8,
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
  applyFilterButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  applyFilterText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.white,
  },
  orderDetailsModal: {
    height: height * 0.85,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  orderDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray + '50',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.lightGray + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderDetailTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.text,
  },
  orderDetailContent: {
    flex: 1,
    padding: 16,
  },
  orderInfoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.lightGray + '50',
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfoLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  orderInfoValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.text,
  },
  itemsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.lightGray + '50',
  },
  itemsTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
  },
  orderDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray + '50',
  },
  itemDetail: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  itemQuantity: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.darkGray,
  },
  itemTotal: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: COLORS.text,
  },
  priceSummaryContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.lightGray + '50',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  priceValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray + '50',
  },
  totalLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  totalValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.text,
  },
  modalFooter: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray + '50',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  reorderButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  reorderButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.white,
  },
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.lightGray + '50',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  statusDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.darkGray,
    lineHeight: 18,
  },
  deliveryInfoContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.lightGray + '50',
  },
  deliveryInfoTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
  },
  deliveryInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deliveryInfoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deliveryInfoContent: {
    flex: 1,
  },
  deliveryInfoLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  deliveryInfoValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.text,
  },
  deliveryFailureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '10',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  deliveryFailureIcon: {
    marginRight: 8,
  },
  deliveryFailureText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.error,
    flex: 1,
  },
});