import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrderContext';
import Button from '@/components/common/Button';
import { 
  Menu, 
  LogOut, 
  Bell, 
  Check, 
  ChevronRight,
  UserPlus,
  Users,
  Package,
  ClipboardList,
  Clock
} from 'lucide-react-native';

export default function AdminHomeScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const { 
    todayOrders, 
    pendingOrders, 
    updateOrderStatus,
    isLoading 
  } = useOrders();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [metrics, setMetrics] = useState({
    totalRegistrations: 0,
    todayOrders: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    // Update metrics in real-time
    setMetrics({
      totalRegistrations: 15, // This would come from your user context
      todayOrders: todayOrders.length,
      pendingOrders: pendingOrders.length,
    });
  }, [todayOrders, pendingOrders]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleCheckOrder = async (id: string) => {
    try {
      await updateOrderStatus(id, 'confirmed');
      setSelectedOrder(null);
      Alert.alert('Success', 'Order has been checked and confirmed!');
    } catch (error) {
      console.error('Error updating order:', error);
      Alert.alert('Error', 'Failed to update order status. Please try again.');
    }
  };

  const handleReadyOrder = async (id: string) => {
    try {
      await updateOrderStatus(id, 'ready');
      Alert.alert('Success', 'Order is marked as ready for delivery!');
    } catch (error) {
      console.error('Error updating order:', error);
      Alert.alert('Error', 'Failed to update order status. Please try again.');
    }
  };

  const handleSendNotifications = async () => {
    try {
      // This would integrate with your notification service
      Alert.alert('Success', 'Notifications sent to all users!');
    } catch (error) {
      console.error('Error sending notifications:', error);
      Alert.alert('Error', 'Failed to send notifications. Please try again.');
    }
  };

  const navigateToScreen = (screen: string) => {
    router.push(`/(admin)/${screen}`);
    setIsSidebarOpen(false);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsSidebarOpen(true)}>
          <Menu size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <LogOut size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Admin Info */}
      <View style={styles.adminInfo}>
        <Text style={styles.adminName}>Welcome, Admin</Text>
        <Text style={styles.adminEmail}>{user?.email}</Text>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total Registrations</Text>
          <Text style={styles.metricValue}>{metrics.totalRegistrations}</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Today's Orders</Text>
          <Text style={styles.metricValue}>{metrics.todayOrders}</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Pending Orders</Text>
          <Text style={styles.metricValue}>{metrics.pendingOrders}</Text>
        </View>
      </View>

      {/* Orders List */}
      <ScrollView style={styles.ordersContainer}>
        <Text style={styles.sectionTitle}>Today's Orders</Text>
        
        {todayOrders.map(order => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.hotelId}>{order.hotelId}</Text>
                <Text style={styles.hotelName}>{order.hotelName}</Text>
              </View>
              <Text style={[
                styles.orderStatus,
                { color: order.status === 'ready' ? COLORS.success : COLORS.primary }
              ]}>
                {order.status.toUpperCase()}
              </Text>
            </View>
            
            <View style={styles.orderActions}>
              <TouchableOpacity 
                style={styles.detailsButton}
                onPress={() => setSelectedOrder(order)}
              >
                <Text style={styles.detailsButtonText}>Order Details</Text>
              </TouchableOpacity>
              
              {!order.ready && (
                <TouchableOpacity 
                  style={[
                    styles.actionButton,
                    order.status === 'confirmed' ? styles.readyButton : styles.disabledButton
                  ]}
                  disabled={order.status !== 'confirmed'}
                  onPress={() => handleReadyOrder(order.id)}
                >
                  <Text style={styles.actionButtonText}>
                    {order.status === 'ready' ? 'Ready' : 'Mark Ready'}
                  </Text>
                  {order.status === 'ready' && (
                    <Check size={16} color={COLORS.white} style={{ marginLeft: 4 }} />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Notification Button */}
      <View style={styles.notificationContainer}>
        <Button
          title="Send Order Notifications"
          onPress={handleSendNotifications}
          variant="primary"
          size="large"
          icon={<Bell size={20} color="white" style={{ marginRight: 8 }} />}
        />
      </View>

      {/* Sidebar Menu */}
      <Modal
        visible={isSidebarOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsSidebarOpen(false)}
      >
        <View style={styles.sidebarOverlay}>
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setIsSidebarOpen(false)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.sidebarContent}>
              <TouchableOpacity 
                style={styles.sidebarItem}
                onPress={() => navigateToScreen('new-registration')}
              >
                <UserPlus size={20} color={COLORS.text} style={styles.sidebarIcon} />
                <Text style={styles.sidebarItemText}>New Registration</Text>
                <ChevronRight size={16} color={COLORS.gray} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.sidebarItem}
                onPress={() => navigateToScreen('user-details')}
              >
                <Users size={20} color={COLORS.text} style={styles.sidebarIcon} />
                <Text style={styles.sidebarItemText}>User Details</Text>
                <ChevronRight size={16} color={COLORS.gray} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.sidebarItem}
                onPress={() => navigateToScreen('delivery')}
              >
                <Package size={20} color={COLORS.text} style={styles.sidebarIcon} />
                <Text style={styles.sidebarItemText}>Delivery</Text>
                <ChevronRight size={16} color={COLORS.gray} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.sidebarItem}
                onPress={() => navigateToScreen('default-orders')}
              >
                <ClipboardList size={20} color={COLORS.text} style={styles.sidebarIcon} />
                <Text style={styles.sidebarItemText}>Default Orders</Text>
                <ChevronRight size={16} color={COLORS.gray} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.sidebarItem}
                onPress={() => navigateToScreen('past-orders')}
              >
                <Clock size={20} color={COLORS.text} style={styles.sidebarIcon} />
                <Text style={styles.sidebarItemText}>Past Orders</Text>
                <ChevronRight size={16} color={COLORS.gray} />
              </TouchableOpacity>
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <LogOut size={20} color={COLORS.error} style={styles.sidebarIcon} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
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
              <ScrollView style={styles.modalBody}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderInfoLabel}>Hotel ID:</Text>
                  <Text style={styles.orderInfoValue}>{selectedOrder.hotelId}</Text>
                </View>
                
                <View style={styles.orderInfo}>
                  <Text style={styles.orderInfoLabel}>Hotel Name:</Text>
                  <Text style={styles.orderInfoValue}>{selectedOrder.hotelName}</Text>
                </View>
                
                <Text style={styles.itemsTitle}>Items:</Text>
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
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>₹{selectedOrder.total}</Text>
                </View>
                
                {selectedOrder.note ? (
                  <View style={styles.noteContainer}>
                    <Text style={styles.noteLabel}>Note:</Text>
                    <Text style={styles.noteText}>{selectedOrder.note}</Text>
                  </View>
                ) : null}
                
                {selectedOrder.status === 'pending' && (
                  <Button
                    title="Check Order"
                    onPress={() => handleCheckOrder(selectedOrder.id)}
                    variant="primary"
                    size="large"
                    style={styles.checkButton}
                    icon={<Check size={20} color="white" style={{ marginRight: 8 }} />}
                  />
                )}
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.darkGray,
  },
  adminInfo: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  adminName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: COLORS.text,
  },
  adminEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
    marginTop: 4,
  },
  orderStatus: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
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
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: COLORS.primary,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  metricLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 4,
  },
  metricValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: COLORS.primary,
  },
  ordersContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 12,
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  hotelId: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  hotelName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: COLORS.text,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background,
    borderRadius: 6,
    marginRight: 8,
    alignItems: 'center',
  },
  detailsButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.text,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
  },
  readyButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.white,
  },
  notificationContainer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  sidebarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    width: '80%',
    height: '100%',
    backgroundColor: COLORS.white,
    paddingTop: 50,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  sidebarTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: COLORS.text,
  },
  closeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.primary,
  },
  sidebarContent: {
    flex: 1,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  sidebarIcon: {
    marginRight: 12,
  },
  sidebarItemText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  logoutText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.error,
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
  modalBody: {
    padding: 16,
  },
  orderInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  orderInfoLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
    width: 100,
  },
  orderInfoValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  itemsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 8,
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
  noteContainer: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  noteLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  noteText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.text,
  },
  checkButton: {
    marginTop: 24,
  },
});