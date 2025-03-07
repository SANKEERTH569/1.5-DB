import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Modal,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { ArrowLeft, Calendar, Search, ChevronDown } from 'lucide-react-native';
import Input from '@/components/common/Input';

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

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function PastOrdersScreen() {
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [availableDates] = useState(() => {
    const dates = new Set<string>();
    PAST_ORDERS.forEach(order => dates.add(order.date));
    return Array.from(dates).sort();
  });

  const handleBack = () => {
    router.back();
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

  const renderOrderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[
        styles.orderCard,
        item.status === 'Failed' && styles.failedOrderCard
      ]}
      onPress={() => setSelectedOrder(item)}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderDate}>{formatDate(item.date)}</Text>
          <View style={styles.hotelInfo}>
            <Text style={styles.hotelId}>{item.hotelId}</Text>
            <Text style={styles.hotelName}>{item.hotelName}</Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          item.status === 'Delivered' ? styles.deliveredBadge : styles.failedBadge
        ]}>
          <Text style={[
            styles.statusText,
            item.status === 'Delivered' ? styles.deliveredText : styles.failedText
          ]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.orderSummary}>
        <Text style={styles.itemCount}>
          {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
        </Text>
        <Text style={styles.orderTotal}>₹{item.total}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Past Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.darkGray} style={styles.searchIcon} />
          <Input
            placeholder="Search by hotel ID or name"
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInputContainer}
            inputStyle={styles.searchInput}
          />
        </View>
        
        <View style={styles.dateFilterContainer}>
          <TouchableOpacity 
            style={styles.dateFilterButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={20} color={COLORS.darkGray} style={styles.dateIcon} />
            <Text style={styles.dateFilterText}>
              {dateFilter ? formatDate(dateFilter) : 'Filter by date'}
            </Text>
            <ChevronDown size={16} color={COLORS.darkGray} />
          </TouchableOpacity>
          
          {(searchQuery || dateFilter) && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={handleClearFilters}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        }
      />

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.closeText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.dateList}>
              {availableDates.map(date => (
                <TouchableOpacity
                  key={date}
                  style={[
                    styles.dateItem,
                    dateFilter === date && styles.selectedDateItem
                  ]}
                  onPress={() => {
                    setDateFilter(date);
                    setShowDatePicker(false);
                  }}
                >
                  <Text style={[
                    styles.dateItemText,
                    dateFilter === date && styles.selectedDateText
                  ]}>
                    {formatDate(date)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Order Details Modal */}
      <Modal
        visible={!!selectedOrder}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedOrder(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
            
            {selectedOrder && (
              <ScrollView style={styles.orderDetails}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedOrder.date)}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Hotel ID</Text>
                  <Text style={styles.detailValue}>{selectedOrder.hotelId}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Hotel Name</Text>
                  <Text style={styles.detailValue}>{selectedOrder.hotelName}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View style={[
                    styles.statusBadge,
                    selectedOrder.status === 'Delivered' ? styles.deliveredBadge : styles.failedBadge,
                    { alignSelf: 'flex-start' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      selectedOrder.status === 'Delivered' ? styles.deliveredText : styles.failedText
                    ]}>
                      {selectedOrder.status}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.itemsTitle}>Items</Text>
                {selectedOrder.items.map((item: any, index: number) => (
                  <View key={index} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemPrice}>₹{item.price}/{item.unit}</Text>
                    </View>
                    <Text style={styles.itemQuantity}>{item.quantity} {item.unit}</Text>
                    <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text>
                  </View>
                ))}
                
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>₹{selectedOrder.total}</Text>
                </View>
              </ScrollView>
            )}
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
  filtersContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInputContainer: {
    flex: 1,
    marginBottom: 0,
  },
  searchInput: {
    height: 40,
  },
  dateFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateFilterText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
    flex: 1,
  },
  clearButton: {
    marginLeft: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.primary,
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
  failedOrderCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderDate: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  hotelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hotelId: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
    marginRight: 8,
  },
  hotelName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deliveredBadge: {
    backgroundColor: COLORS.success + '20', // 20% opacity
  },
  failedBadge: {
    backgroundColor: COLORS.error + '20', // 20% opacity
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
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  orderTotal: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
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
  orderDetails: {
    padding: 16,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  detailValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.text,
  },
  itemsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  itemInfo: {
    flex: 2,
  },
  itemName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.text,
  },
  itemPrice: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.darkGray,
  },
  itemQuantity: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  itemTotal: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    marginTop: 8,
  },
  totalLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: COLORS.text,
  },
  totalValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: COLORS.primary,
  },
});