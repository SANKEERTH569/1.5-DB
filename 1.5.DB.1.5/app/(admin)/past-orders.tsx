import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  StatusBar,
  Platform,
  Dimensions,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { 
  ArrowLeft, 
  Calendar, 
  Search, 
  ChevronDown, 
  X, 
  Package, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Filter,
  ShoppingBag,
  ChevronRight
} from 'lucide-react-native';
import Input from '@/components/common/Input';
import { LinearGradient } from 'expo-linear-gradient';

// Mock data for past orders
const PAST_ORDERS = [
  {
    id: '1',
    date: '2025-01-05',
    hotelId: 'KIR001',
    hotelName: 'Hotel Sunshine',
    items: [
      { name: 'Rice', quantity: 5, price: 50, unit: 'kg' },
      { name: 'Wheat Flour', quantity: 2, price: 40, unit: 'kg' },
      { name: 'Cooking Oil', quantity: 3, price: 120, unit: 'liter' },
    ],
    total: 610,
    status: 'Delivered',
  },
  {
    id: '2',
    date: '2025-01-10',
    hotelId: 'KIR002',
    hotelName: 'Grand Restaurant',
    items: [
      { name: 'Milk', quantity: 10, price: 60, unit: 'liter' },
      { name: 'Tomatoes', quantity: 3, price: 30, unit: 'kg' },
      { name: 'Onions', quantity: 4, price: 25, unit: 'kg' },
    ],
    total: 790,
    status: 'Delivered',
  },
  {
    id: '3',
    date: '2025-01-15',
    hotelId: 'KIR003',
    hotelName: 'Spice Garden',
    items: [
      { name: 'Potatoes', quantity: 5, price: 20, unit: 'kg' },
      { name: 'Lentils', quantity: 2, price: 90, unit: 'kg' },
      { name: 'Salt', quantity: 1, price: 15, unit: 'kg' },
    ],
    total: 295,
    status: 'Failed',
  },
  {
    id: '4',
    date: '2025-01-20',
    hotelId: 'KIR001',
    hotelName: 'Hotel Sunshine',
    items: [
      { name: 'Rice', quantity: 10, price: 50, unit: 'kg' },
      { name: 'Sugar', quantity: 3, price: 45, unit: 'kg' },
      { name: 'Cooking Oil', quantity: 2, price: 120, unit: 'liter' },
    ],
    total: 765,
    status: 'Delivered',
  },
];

const { height } = Dimensions.get('window');

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
};

export default function PastOrdersScreen() {
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [availableDates] = useState(() => {
    const dates = new Set<string>();
    PAST_ORDERS.forEach(order => dates.add(order.date));
    return Array.from(dates).sort();
  });
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const datePickerAnim = useRef(new Animated.Value(height)).current;
  const orderDetailsAnim = useRef(new Animated.Value(height)).current;
  const datePickerFadeAnim = useRef(new Animated.Value(0)).current;
  const orderDetailsFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showDatePicker) {
      // Animate date picker in
      Animated.parallel([
        Animated.timing(datePickerAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(datePickerFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Animate date picker out
      Animated.parallel([
        Animated.timing(datePickerAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(datePickerFadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [showDatePicker]);
  
  useEffect(() => {
    if (selectedOrder) {
      // Animate order details in
      Animated.parallel([
        Animated.timing(orderDetailsAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(orderDetailsFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Animate order details out
      Animated.parallel([
        Animated.timing(orderDetailsAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(orderDetailsFadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [selectedOrder]);

  const handleBack = () => {
    router.back();
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Filter orders based on search query and date filter
  const filteredOrders = PAST_ORDERS.filter(order => {
    const matchesSearch = 
      order.hotelId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.hotelName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDate = !dateFilter || order.date === dateFilter;
    
    return matchesSearch && matchesDate;
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setDateFilter('');
  };
  
  const closeDatePicker = () => {
    setShowDatePicker(false);
  };
  
  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };
  
  const getStatusColor = (status: string) => {
    return status === 'Delivered' ? COLORS.success : COLORS.error;
  };
  
  const getStatusIcon = (status: string) => {
    return status === 'Delivered' ? (
      <CheckCircle size={16} color={COLORS.success} />
    ) : (
      <AlertCircle size={16} color={COLORS.error} />
    );
  };
  
  const formatCurrency = (amount: number) => {
    return '₹' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  const renderOrderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => setSelectedOrder(item)}
      activeOpacity={0.7}
    >
      <View style={styles.orderCardHeader}>
        <View style={[
          styles.statusIndicator, 
          { backgroundColor: getStatusColor(item.status) }
        ]} />
        
        <View style={styles.orderDateContainer}>
          <Calendar size={14} color={COLORS.darkGray} style={styles.orderDateIcon} />
          <Text style={styles.orderDate}>{formatDate(item.date)}</Text>
        </View>
        
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) + '20' }
        ]}>
          {getStatusIcon(item.status)}
          <Text style={[
            styles.statusText,
            { color: getStatusColor(item.status) }
          ]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.hotelInfoContainer}>
        <Text style={styles.hotelName}>{item.hotelName}</Text>
        <Text style={styles.hotelId}>ID: {item.hotelId}</Text>
      </View>
      
      <View style={styles.orderItemsPreview}>
        {item.items.slice(0, 2).map((orderItem: any, index: number) => (
          <View key={index} style={styles.orderItemRow}>
            <Text style={styles.orderItemName} numberOfLines={1}>
              {orderItem.name}
            </Text>
            <Text style={styles.orderItemDetails}>
              {orderItem.quantity} {orderItem.unit} × ₹{orderItem.price}
            </Text>
          </View>
        ))}
        
        {item.items.length > 2 && (
          <Text style={styles.moreItems}>
            +{item.items.length - 2} more items
          </Text>
        )}
      </View>
      
      <View style={styles.orderCardFooter}>
        <Text style={styles.orderTotalLabel}>Total Amount:</Text>
        <Text style={styles.orderTotal}>{formatCurrency(item.total)}</Text>
      </View>
      
      <View style={styles.viewDetailsContainer}>
        <Text style={styles.viewDetailsText}>View Details</Text>
        <ChevronRight size={14} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.filtersContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={18} color={COLORS.darkGray} style={styles.searchIcon} />
          <Input
            placeholder="Search by hotel ID or name"
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInputContainer}
            inputStyle={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearSearchButton}
              onPress={() => setSearchQuery('')}
            >
              <X size={16} color={COLORS.darkGray} />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.filterActionsContainer}>
          <TouchableOpacity 
            style={styles.dateFilterButton}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Calendar size={18} color={COLORS.primary} style={styles.dateIcon} />
            <Text style={[
              styles.dateFilterText,
              dateFilter && styles.activeFilterText
            ]}>
              {dateFilter ? formatDate(dateFilter) : 'All Dates'}
            </Text>
          </TouchableOpacity>
          
          {(searchQuery || dateFilter) && (
            <TouchableOpacity 
              style={styles.clearFiltersButton}
              onPress={handleClearFilters}
            >
              <Filter size={16} color={COLORS.primary} />
              <Text style={styles.clearFiltersText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id}
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
              <Text style={styles.emptyTitle}>No Orders Found</Text>
              <Text style={styles.emptyText}>
                {searchQuery || dateFilter 
                  ? 'Try changing your search criteria' 
                  : 'No past orders available'}
              </Text>
            </View>
          }
        />
      </Animated.View>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="none"
        onRequestClose={closeDatePicker}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            { opacity: datePickerFadeAnim }
          ]}
        >
          <TouchableOpacity 
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={closeDatePicker}
          />
          
          <Animated.View 
            style={[
              styles.datePickerContent,
              { transform: [{ translateY: datePickerAnim }] }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeDatePicker}
              >
                <X size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.calendarLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
                <Text style={styles.legendText}>Successful Delivery</Text>
              </View>
              
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.error }]} />
                <Text style={styles.legendText}>Failed Delivery</Text>
              </View>
            </View>
            
            <ScrollView 
              style={styles.dateList}
              showsVerticalScrollIndicator={false}
            >
              <TouchableOpacity
                style={[
                  styles.dateItem,
                  !dateFilter && styles.selectedDateItem
                ]}
                onPress={() => {
                  setDateFilter('');
                  closeDatePicker();
                }}
              >
                <Text style={[
                  styles.dateItemText,
                  !dateFilter && styles.selectedDateText
                ]}>
                  All Dates
                </Text>
              </TouchableOpacity>
              
              {availableDates.map(date => {
                // Find if there are any failed orders on this date
                const hasFailedOrders = PAST_ORDERS.some(
                  order => order.date === date && order.status === 'Failed'
                );
                
                return (
                  <TouchableOpacity
                    key={date}
                    style={[
                      styles.dateItem,
                      dateFilter === date && styles.selectedDateItem
                    ]}
                    onPress={() => {
                      setDateFilter(date);
                      closeDatePicker();
                    }}
                  >
                    <View style={styles.dateItemContent}>
                      <Text style={[
                        styles.dateItemText,
                        dateFilter === date && styles.selectedDateText
                      ]}>
                        {formatDate(date)}
                      </Text>
                      
                      <View style={[
                        styles.dateDot,
                        { 
                          backgroundColor: hasFailedOrders 
                            ? COLORS.error 
                            : COLORS.success 
                        }
                      ]} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Order Details Modal */}
      <Modal
        visible={!!selectedOrder}
        transparent={true}
        animationType="none"
        onRequestClose={closeOrderDetails}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            { opacity: orderDetailsFadeAnim }
          ]}
        >
          <TouchableOpacity 
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={closeOrderDetails}
          />
          
          <Animated.View 
            style={[
              styles.orderDetailsContent,
              { transform: [{ translateY: orderDetailsAnim }] }
            ]}
          >
            <LinearGradient
              colors={[COLORS.primary + '20', COLORS.white]}
              style={styles.orderDetailsGradient}
            >
              <View style={styles.orderDetailsHeader}>
                <TouchableOpacity 
                  style={styles.closeOrderDetailsButton}
                  onPress={closeOrderDetails}
                >
                  <ArrowLeft size={22} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.orderDetailsTitle}>Order Details</Text>
                <View style={{ width: 22 }} />
              </View>
              
              {selectedOrder && (
                <ScrollView 
                  style={styles.orderDetailsBody}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.orderStatusCard}>
                    <View style={[
                      styles.orderStatusIndicator,
                      { backgroundColor: getStatusColor(selectedOrder.status) }
                    ]}>
                      {selectedOrder.status === 'Delivered' ? (
                        <CheckCircle size={24} color={COLORS.white} />
                      ) : (
                        <AlertCircle size={24} color={COLORS.white} />
                      )}
                    </View>
                    
                    <View style={styles.orderStatusInfo}>
                      <Text style={styles.orderStatusText}>
                        {selectedOrder.status === 'Delivered' 
                          ? 'Order Delivered Successfully' 
                          : 'Delivery Failed'}
                      </Text>
                      <Text style={styles.orderStatusDate}>
                        {formatDate(selectedOrder.date)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailsCard}>
                    <Text style={styles.detailsCardTitle}>Hotel Information</Text>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Hotel Name</Text>
                      <Text style={styles.detailValue}>{selectedOrder.hotelName}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Hotel ID</Text>
                      <Text style={styles.detailValue}>{selectedOrder.hotelId}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailsCard}>
                    <Text style={styles.detailsCardTitle}>Order Items</Text>
                    
                    {selectedOrder.items.map((item: any, index: number) => (
                      <View key={index} style={styles.orderItemDetail}>
                        <View style={styles.orderItemDetailHeader}>
                          <Text style={styles.orderItemDetailName}>{item.name}</Text>
                          <Text style={styles.orderItemDetailPrice}>
                            ₹{item.price}/{item.unit}
                          </Text>
                        </View>
                        
                        <View style={styles.orderItemDetailFooter}>
                          <Text style={styles.orderItemDetailQuantity}>
                            Quantity: {item.quantity} {item.unit}
                          </Text>
                          <Text style={styles.orderItemDetailTotal}>
                            {formatCurrency(item.price * item.quantity)}
                          </Text>
                        </View>
                        
                        {index < selectedOrder.items.length - 1 && (
                          <View style={styles.itemDivider} />
                        )}
                      </View>
                    ))}
                    
                    <View style={styles.orderTotalContainer}>
                      <Text style={styles.orderTotalDetailLabel}>Total Amount</Text>
                      <Text style={styles.orderTotalDetailValue}>
                        {formatCurrency(selectedOrder.total)}
                      </Text>
                    </View>
                  </View>
                </ScrollView>
              )}
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      </Modal>
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
  filtersContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
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
  clearSearchButton: {
    padding: 6,
  },
  filterActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateFilterText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  activeFilterText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearFiltersText: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 4,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statusIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: 8,
  },
  orderDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderDateIcon: {
    marginRight: 6,
  },
  orderDate: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  hotelInfoContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
  orderItemsPreview: {
    padding: 12,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderItemName: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  orderItemDetails: {
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
  orderCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  orderTotalLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  viewDetailsText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  datePickerContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  dateList: {
    padding: 16,
  },
  dateItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  selectedDateItem: {
    backgroundColor: COLORS.primary + '10', // 10% opacity
  },
  dateItemText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.text,
  },
  selectedDateText: {
    color: COLORS.primary,
  },
  orderDetailsContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  orderDetailsGradient: {
    flex: 1,
  },
  orderDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  closeOrderDetailsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderDetailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  orderDetailsBody: {
    padding: 16,
  },
  orderStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderStatusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  orderStatusInfo: {
    flex: 1,
  },
  orderStatusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  orderStatusDate: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  detailsCard: {
    marginBottom: 16,
  },
  detailsCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  orderItemDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderItemDetailHeader: {
    flex: 1,
  },
  orderItemDetailName: {
    fontSize: 14,
    color: COLORS.text,
  },
  orderItemDetailPrice: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  orderItemDetailFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItemDetailQuantity: {
    fontSize: 14,
    color: COLORS.text,
  },
  orderItemDetailTotal: {
    fontSize: 14,
    color: COLORS.text,
  },
  itemDivider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  orderTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  orderTotalDetailLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  orderTotalDetailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});