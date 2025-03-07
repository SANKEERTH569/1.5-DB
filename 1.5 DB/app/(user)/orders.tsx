import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Modal
} from 'react-native';
import { COLORS } from '@/constants/Colors';
import { Calendar } from 'react-native-calendars';
import { ChevronDown, ChevronRight } from 'lucide-react-native';

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

export default function OrdersScreen() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredOrders, setFilteredOrders] = useState(PAST_ORDERS);

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
    setIsCalendarVisible(false);
    
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

  const renderOrderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[
        styles.orderCard,
        item.status === 'Failed' && styles.failedOrderCard
      ]}
      onPress={() => setSelectedOrder(item)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderDate}>{formatDate(item.date)}</Text>
        <View style={[
          styles.statusBadge,
          item.status === 'Delivered' ? styles.deliveredBadge : styles.failedBadge
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.orderSummary}>
        <Text style={styles.itemCount}>
          {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
        </Text>
        <Text style={styles.orderTotal}>₹{item.total}</Text>
      </View>
      
      <View style={styles.viewDetailsContainer}>
        <Text style={styles.viewDetailsText}>View Details</Text>
        <ChevronRight size={16} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Past Orders</Text>
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={styles.dateFilterButton}
          onPress={() => setIsCalendarVisible(true)}
        >
          <Text style={styles.filterButtonText}>
            {selectedDate ? formatDate(selectedDate) : 'Filter by Date'}
          </Text>
          <ChevronDown size={16} color={COLORS.darkGray} />
        </TouchableOpacity>
        
        {selectedDate ? (
          <TouchableOpacity 
            style={styles.clearFilterButton}
            onPress={clearDateFilter}
          >
            <Text style={styles.clearFilterText}>Clear</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      
      {filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.ordersList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No orders found for this date</Text>
        </View>
      )}
      
      {/* Calendar Modal */}
      <Modal
        visible={isCalendarVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            <Text style={styles.modalTitle}>Select Date</Text>
            <Calendar
              markedDates={markedDates}
              onDayPress={handleDateSelect}
              theme={{
                todayTextColor: COLORS.primary,
                arrowColor: COLORS.primary,
                dotColor: COLORS.primary,
                selectedDayBackgroundColor: COLORS.primary,
              }}
            />
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setIsCalendarVisible(false)}
            >
              <Text style={styles.closeModalText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Order Details Modal */}
      <Modal
        visible={!!selectedOrder}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.orderDetailsModal}>
            <Text style={styles.modalTitle}>Order Details</Text>
            
            <View style={styles.orderDetailHeader}>
              <Text style={styles.orderDetailDate}>
                {selectedOrder ? formatDate(selectedOrder.date) : ''}
              </Text>
              <View style={[
                styles.statusBadge,
                selectedOrder?.status === 'Delivered' ? styles.deliveredBadge : styles.failedBadge
              ]}>
                <Text style={styles.statusText}>{selectedOrder?.status}</Text>
              </View>
            </View>
            
            <View style={styles.itemsContainer}>
              <Text style={styles.itemsTitle}>Items</Text>
              {selectedOrder?.items.map((item: any, index: number) => (
                <View key={index} style={styles.orderDetailItem}>
                  <View style={styles.itemDetail}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQuantity}>
                      {item.quantity} {item.unit} × ₹{item.price}/{item.unit}
                    </Text>
                  </View>
                  <Text style={styles.itemTotal}>
                    ₹{item.quantity * item.price}
                  </Text>
                </View>
              ))}
            </View>
            
            <View style={styles.orderTotalContainer}>
              <Text style={styles.orderTotalLabel}>Total</Text>
              <Text style={styles.orderTotalAmount}>
                ₹{selectedOrder?.total}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setSelectedOrder(null)}
            >
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
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
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: COLORS.text,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  dateFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  filterButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
    marginRight: 4,
  },
  clearFilterButton: {
    marginLeft: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearFilterText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.primary,
  },
  ordersList: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  orderDate: {
    fontFamily: 'Inter-Medium',
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
    color: COLORS.text,
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  viewDetailsText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.primary,
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  calendarModal: {
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  closeModalButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  closeModalText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.primary,
  },
  orderDetailsModal: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
  },
  orderDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderDetailDate: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.text,
  },
  itemsContainer: {
    marginBottom: 16,
  },
  itemsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
  },
  orderDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  itemDetail: {
    flex: 1,
  },
  itemName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.text,
  },
  itemQuantity: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  itemTotal: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: COLORS.text,
  },
  orderTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    marginBottom: 16,
  },
  orderTotalLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: COLORS.text,
  },
  orderTotalAmount: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: COLORS.primary,
  },
});