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
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { useOrders, Order, OrderStatus } from '@/context/OrderContext';
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

const { width, height } = Dimensions.get('window');

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original string if invalid date
    }
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

export default function PastOrdersScreen() {
  const router = useRouter();
  const { 
    orders, 
    refreshOrders, 
    isLoading, 
    error 
  } = useOrders();
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const datePickerAnim = useRef(new Animated.Value(height)).current;
  const orderDetailsAnim = useRef(new Animated.Value(height)).current;
  const datePickerFadeAnim = useRef(new Animated.Value(0)).current;
  const orderDetailsFadeAnim = useRef(new Animated.Value(0)).current;

  // Extract available dates from orders
  useEffect(() => {
    const dates = new Set<string>();
    orders.forEach(order => {
      if (order.date) {
        dates.add(order.date);
      }
    });
    setAvailableDates(Array.from(dates).sort());
  }, [orders]);

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
    refreshOrders().finally(() => {
      setRefreshing(false);
    });
  };

  // Filter orders based on search query and date filter
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.hotel_id?.toString().toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (order.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    
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
    switch (status.toLowerCase()) {
      case 'completed':
      case 'ready':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'confirmed':
        return COLORS.primary;
      case 'failed':
        return COLORS.error;
      default:
        return COLORS.lightGray;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'ready':
        return <CheckCircle size={16} color={COLORS.success} />;
      case 'pending':
        return <Clock size={16} color={COLORS.warning} />;
      case 'confirmed':
        return <CheckCircle size={16} color={COLORS.primary} />;
      case 'failed':
        return <AlertCircle size={16} color={COLORS.error} />;
      default:
        return <Clock size={16} color={COLORS.lightGray} />;
    }
  };
  
  const formatCurrency = (amount: number | string) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(numericAmount) ? '₹0.00' : `₹${numericAmount.toFixed(2)}`;
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
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
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.hotelInfoContainer}>
        <Text style={styles.hotelName}>
          {item.owner_name || `Hotel ID: ${item.hotel_id}`}
        </Text>
        <Text style={styles.hotelId}>ID: {item.hotel_id}</Text>
      </View>
      
      <View style={styles.orderItemsPreview}>
        {item.items && item.items.slice(0, 2).map((orderItem, index) => (
          <View key={index} style={styles.orderItemRow}>
            <Text style={styles.orderItemName} numberOfLines={1}>
              {orderItem.name}
            </Text>
            <Text style={styles.orderItemDetails}>
              {orderItem.quantity} {orderItem.unit} × {formatCurrency(orderItem.price)}
            </Text>
          </View>
        ))}
        
        {item.items && item.items.length > 2 && (
          <Text style={styles.moreItems}>
            +{item.items.length - 2} more items
          </Text>
        )}
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>
          Total: {formatCurrency(item.total)}
        </Text>
        <TouchableOpacity 
          style={styles.viewDetailsButton}
          onPress={() => setSelectedOrder(item)}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
          <ChevronRight size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Past Orders</Text>
      </View>
      
      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={COLORS.darkGray} style={styles.searchIcon} />
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by hotel ID or name"
            style={styles.searchInput}
            placeholderTextColor={COLORS.darkGray}
          />
          {searchQuery ? (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <X size={16} color={COLORS.darkGray} />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <View style={styles.filterContainer}>
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
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <AlertCircle size={60} color={COLORS.error} />
            <Text style={styles.errorTitle}>Error</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={handleRefresh}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            renderItem={renderOrderItem}
            keyExtractor={item => item.id.toString()}
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
        )}
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
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={closeDatePicker}
          />
          
          <Animated.View 
            style={[
              styles.datePickerContainer,
              { transform: [{ translateY: datePickerAnim }] }
            ]}
          >
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Select Date</Text>
              <TouchableOpacity 
                style={styles.closeDatePickerButton}
                onPress={closeDatePicker}
              >
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.datesList}>
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
                  !dateFilter && styles.selectedDateItemText
                ]}>
                  All Dates
                </Text>
              </TouchableOpacity>
              
              {availableDates.map(date => (
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
                  <Text style={[
                    styles.dateItemText,
                    dateFilter === date && styles.selectedDateItemText
                  ]}>
                    {formatDate(date)}
                  </Text>
                </TouchableOpacity>
              ))}
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
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={closeOrderDetails}
          />
          
          <Animated.View 
            style={[
              styles.orderDetailsContainer,
              { transform: [{ translateY: orderDetailsAnim }] }
            ]}
          >
            {selectedOrder && (
              <>
                <View style={styles.orderDetailsHeader}>
                  <TouchableOpacity 
                    style={styles.closeOrderDetailsButton}
                    onPress={closeOrderDetails}
                  >
                    <X size={24} color={COLORS.text} />
                  </TouchableOpacity>
                  
                  <Text style={styles.orderDetailsTitle}>Order Details</Text>
                  
                  <View style={[
                    styles.orderDetailsStatus,
                    { backgroundColor: getStatusColor(selectedOrder.status) + '20' }
                  ]}>
                    {getStatusIcon(selectedOrder.status)}
                    <Text style={[
                      styles.orderDetailsStatusText,
                      { color: getStatusColor(selectedOrder.status) }
                    ]}>
                      {selectedOrder.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <ScrollView style={styles.orderDetailsContent}>
                  <View style={styles.orderDetailsSection}>
                    <Text style={styles.orderDetailsSectionTitle}>Hotel Information</Text>
                    <View style={styles.orderDetailsInfo}>
                      <Text style={styles.orderDetailsLabel}>Name:</Text>
                      <Text style={styles.orderDetailsValue}>
                        {selectedOrder.owner_name || `Hotel ID: ${selectedOrder.hotel_id}`}
                      </Text>
                    </View>
                    <View style={styles.orderDetailsInfo}>
                      <Text style={styles.orderDetailsLabel}>ID:</Text>
                      <Text style={styles.orderDetailsValue}>{selectedOrder.hotel_id}</Text>
                    </View>
                    <View style={styles.orderDetailsInfo}>
                      <Text style={styles.orderDetailsLabel}>Phone:</Text>
                      <Text style={styles.orderDetailsValue}>{selectedOrder.phone_number || 'N/A'}</Text>
                    </View>
                    <View style={styles.orderDetailsInfo}>
                      <Text style={styles.orderDetailsLabel}>Location:</Text>
                      <Text style={styles.orderDetailsValue}>{selectedOrder.location || 'N/A'}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.orderDetailsSection}>
                    <Text style={styles.orderDetailsSectionTitle}>Order Information</Text>
                    <View style={styles.orderDetailsInfo}>
                      <Text style={styles.orderDetailsLabel}>Order ID:</Text>
                      <Text style={styles.orderDetailsValue}>#{selectedOrder.id}</Text>
                    </View>
                    <View style={styles.orderDetailsInfo}>
                      <Text style={styles.orderDetailsLabel}>Date:</Text>
                      <Text style={styles.orderDetailsValue}>{formatDate(selectedOrder.date)}</Text>
                    </View>
                    <View style={styles.orderDetailsInfo}>
                      <Text style={styles.orderDetailsLabel}>Status:</Text>
                      <View style={[
                        styles.orderDetailsStatusBadge,
                        { backgroundColor: getStatusColor(selectedOrder.status) + '20' }
                      ]}>
                        <Text style={[
                          styles.orderDetailsStatusBadgeText,
                          { color: getStatusColor(selectedOrder.status) }
                        ]}>
                          {selectedOrder.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    {selectedOrder.note && (
                      <View style={styles.orderDetailsInfo}>
                        <Text style={styles.orderDetailsLabel}>Note:</Text>
                        <Text style={styles.orderDetailsValue}>{selectedOrder.note}</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.orderDetailsSection}>
                    <Text style={styles.orderDetailsSectionTitle}>Items</Text>
                    {selectedOrder.items && selectedOrder.items.map((item, index) => (
                      <View key={index} style={styles.orderDetailsItem}>
                        <View style={styles.orderDetailsItemHeader}>
                          <Text style={styles.orderDetailsItemName}>{item.name}</Text>
                          <Text style={styles.orderDetailsItemPrice}>
                            {formatCurrency(item.price)}
                          </Text>
                        </View>
                        <View style={styles.orderDetailsItemDetails}>
                          <Text style={styles.orderDetailsItemQuantity}>
                            {item.quantity} {item.unit}
                          </Text>
                          <Text style={styles.orderDetailsItemTotal}>
                            {formatCurrency(item.price * item.quantity)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                  
                  <View style={styles.orderDetailsTotalSection}>
                    <Text style={styles.orderDetailsTotalLabel}>Total Amount:</Text>
                    <Text style={styles.orderDetailsTotalValue}>
                      {formatCurrency(selectedOrder.total)}
                    </Text>
                  </View>
                </ScrollView>
              </>
            )}
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
  searchContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchInputContainer: {
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
  searchInput: {
    flex: 1,
    height: 40,
  },
  clearButton: {
    padding: 6,
  },
  filterContainer: {
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
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  datePickerContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  datePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeDatePickerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datesList: {
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
  selectedDateItemText: {
    color: COLORS.primary,
  },
  orderDetailsContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
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
  orderDetailsContent: {
    padding: 16,
  },
  orderDetailsSection: {
    marginBottom: 16,
  },
  orderDetailsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  orderDetailsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderDetailsLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  orderDetailsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  orderDetailsStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
  },
  orderDetailsStatusText: {
    fontSize: 14,
    color: COLORS.text,
  },
  orderDetailsStatusBadge: {
    padding: 4,
    borderRadius: 4,
  },
  orderDetailsStatusBadgeText: {
    fontSize: 14,
    color: COLORS.text,
  },
  orderDetailsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderDetailsItemHeader: {
    flex: 1,
  },
  orderDetailsItemName: {
    fontSize: 14,
    color: COLORS.text,
  },
  orderDetailsItemPrice: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  orderDetailsItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDetailsItemQuantity: {
    fontSize: 14,
    color: COLORS.text,
  },
  orderDetailsItemTotal: {
    fontSize: 14,
    color: COLORS.text,
  },
  orderDetailsTotalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  orderDetailsTotalLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  orderDetailsTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.text,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: COLORS.error,
    marginTop: 12,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.text,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.white,
  },
});