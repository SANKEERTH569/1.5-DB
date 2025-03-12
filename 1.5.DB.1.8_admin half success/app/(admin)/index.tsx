import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Modal,
  Alert,
  StatusBar,
  Platform,
  Image,
  Animated,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useOrders, Order } from '@/context/OrderContext';
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
  Clock,
  X,
  Home,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  TrendingUp
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

type AdminRoute = '' | 'new-registration' | 'user-details' | 'delivery' | 'default-orders' | 'past-orders';

export default function AdminHomeScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const { 
    todayOrders, 
    pendingOrders, 
    updateOrderStatus,
    isLoading,
    error,
    refreshOrders,
    orders
  } = useOrders();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    totalRegistrations: 0,
    todayOrders: 0,
    pendingOrders: 0,
  });
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const sidebarAnim = React.useRef(new Animated.Value(-300)).current;
  const modalAnim = React.useRef(new Animated.Value(0)).current;

  // Debug information
  useEffect(() => {
    console.log('Admin Home Screen - User:', user?.id, 'Role:', user?.role);
    console.log('Today Orders:', todayOrders.length);
    console.log('Pending Orders:', pendingOrders.length);
    console.log('Loading State:', isLoading);
    console.log('Error State:', error);
    
    // Log the first order for debugging
    if (todayOrders.length > 0) {
      console.log('First order sample:', JSON.stringify(todayOrders[0]));
    } else {
      console.log('No orders found for today');
      
      // Log all orders to see if there are any
      if (orders.length > 0) {
        console.log('All orders:', orders.length);
        console.log('First order in all orders:', JSON.stringify(orders[0]));
      } else {
        console.log('No orders found at all');
      }
    }

    // Initial data fetch
    refreshOrders();
  }, [user]);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    // Update metrics in real-time
    setMetrics({
      totalRegistrations: 15, // This would come from your user context
      todayOrders: todayOrders.length,
      pendingOrders: pendingOrders.length,
    });
  }, [todayOrders, pendingOrders]);
  
  useEffect(() => {
    // Animate sidebar
    Animated.timing(sidebarAnim, {
      toValue: isSidebarOpen ? 0 : -300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSidebarOpen]);
  
  useEffect(() => {
    // Animate modal
    if (selectedOrder) {
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedOrder]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleCheckOrder = async (id: number) => {
    try {
      console.log(`Starting order confirmation for order ID: ${id}`);
      setActionLoading(true);
      
      // Ensure id is a number
      const numericId = Number(id);
      if (isNaN(numericId)) {
        throw new Error(`Invalid order ID: ${id}`);
      }
      
      console.log(`Calling updateOrderStatus with ID: ${numericId}`);
      
      // Call the updateOrderStatus method
      const result = await updateOrderStatus(numericId, 'confirmed');
      console.log(`Update result:`, result);
      
      // Close the modal
      setSelectedOrder(null);
      
      // Refresh orders to ensure real-time updates
      console.log('Refreshing orders after status update');
      await refreshOrders();
      
      console.log('Order confirmation completed successfully');
    } catch (error) {
      console.error('Error updating order:', error);
      Alert.alert(
        'Error Updating Order', 
        'Failed to update order status. Please try again.\n\n' + 
        (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReadyOrder = async (id: number) => {
    try {
      console.log(`Starting order ready update for order ID: ${id}`);
      setActionLoading(true);
      
      // Ensure id is a number
      const numericId = Number(id);
      if (isNaN(numericId)) {
        throw new Error(`Invalid order ID: ${id}`);
      }
      
      console.log(`Calling updateOrderStatus with ID: ${numericId}`);
      
      // Call the updateOrderStatus method
      const result = await updateOrderStatus(numericId, 'ready');
      console.log(`Update result:`, result);
      
      // Close the modal
      setSelectedOrder(null);
      
      // Refresh orders to ensure real-time updates
      console.log('Refreshing orders after status update');
      await refreshOrders();
      
      console.log('Order ready update completed successfully');
    } catch (error) {
      console.error('Error updating order:', error);
      Alert.alert(
        'Error Updating Order', 
        'Failed to update order status. Please try again.\n\n' + 
        (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setActionLoading(false);
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

  const navigateToScreen = (screen: AdminRoute) => {
    router.push(`/(admin)/${screen}` as any);
    setIsSidebarOpen(false);
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return COLORS.warning;
      case 'confirmed': return COLORS.info;
      case 'ready': return COLORS.success;
      default: return COLORS.darkGray;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <AlertCircle size={16} color={COLORS.warning} />;
      case 'confirmed': return <Check size={16} color={COLORS.info} />;
      case 'ready': return <CheckCircle size={16} color={COLORS.success} />;
      default: return null;
    }
  };
  
  const formatCurrency = (amount: number | string) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(numericAmount) ? '₹0.00' : `₹${numericAmount.toFixed(2)}`;
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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primary + 'DD']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setIsSidebarOpen(true)}
        >
          <Menu size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>THATKart Admin</Text>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={22} color={COLORS.white} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Admin Info */}
      <View style={styles.adminInfoContainer}>
        <View style={styles.adminInfo}>
          <View style={styles.adminAvatar}>
            <Text style={styles.adminInitial}>
              {user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
            </Text>
          </View>
          <View style={styles.adminTextInfo}>
            <Text style={styles.adminName}>Welcome, Admin</Text>
            <Text style={styles.adminEmail}>{user?.email || 'admin@thatkart.com'}</Text>
          </View>
        </View>
      </View>

      <Animated.ScrollView 
        style={[styles.scrollView, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Metrics Cards */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: COLORS.primary + '20' }]}>
              <Users size={22} color={COLORS.primary} />
            </View>
            <View style={styles.metricTextContainer}>
              <Text style={styles.metricValue}>{metrics.totalRegistrations}</Text>
              <Text style={styles.metricLabel}>Total Users</Text>
            </View>
          </View>
          
          <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: COLORS.success + '20' }]}>
              <ShoppingBag size={22} color={COLORS.success} />
            </View>
            <View style={styles.metricTextContainer}>
              <Text style={styles.metricValue}>{metrics.todayOrders}</Text>
              <Text style={styles.metricLabel}>Today's Orders</Text>
            </View>
          </View>
          
          <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: COLORS.warning + '20' }]}>
              <Clock size={22} color={COLORS.warning} />
            </View>
            <View style={styles.metricTextContainer}>
              <Text style={styles.metricValue}>{metrics.pendingOrders}</Text>
              <Text style={styles.metricLabel}>Pending Orders</Text>
            </View>
          </View>
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => navigateToScreen('new-registration')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: COLORS.primary + '20' }]}>
                <UserPlus size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>New Registration</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => navigateToScreen('user-details')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: COLORS.info + '20' }]}>
                <Users size={24} color={COLORS.info} />
              </View>
              <Text style={styles.quickActionText}>User Details</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => navigateToScreen('delivery')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: COLORS.success + '20' }]}>
                <Package size={24} color={COLORS.success} />
              </View>
              <Text style={styles.quickActionText}>Delivery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => navigateToScreen('past-orders')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: COLORS.warning + '20' }]}>
                <ClipboardList size={24} color={COLORS.warning} />
              </View>
              <Text style={styles.quickActionText}>Past Orders</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Orders */}
        <View style={styles.ordersContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Orders ({todayOrders.length})</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={refreshOrders}
                disabled={isLoading}
              >
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => navigateToScreen('past-orders')}
              >
                <Text style={styles.viewAllText}>View All ({orders.length})</Text>
                <ChevronRight size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading orders...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={40} color={COLORS.error} />
              <Text style={styles.errorText}>Error: {error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={refreshOrders}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : todayOrders.length === 0 ? (
            <View style={styles.emptyOrdersContainer}>
              <Package size={40} color={COLORS.lightGray} />
              <Text style={styles.emptyOrdersText}>No orders for today yet</Text>
              {orders.length > 0 && (
                <TouchableOpacity 
                  style={styles.viewAllOrdersButton}
                  onPress={() => navigateToScreen('past-orders')}
                >
                  <Text style={styles.viewAllOrdersText}>View All Orders ({orders.length})</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <ScrollView style={styles.ordersList}>
              {todayOrders.map(order => (
                <TouchableOpacity 
                  key={order.id} 
                  style={styles.orderCard}
                  onPress={() => setSelectedOrder(order)}
                  activeOpacity={0.7}
                >
                  <View style={styles.orderCardHeader}>
                    <View style={styles.orderCardLeft}>
                      <Text style={styles.hotelId}>#{order.id}</Text>
                      <Text style={styles.hotelName}>
                        {order.owner_name || `Hotel ID: ${order.hotel_id}`}
                      </Text>
                    </View>
                    
                    <View style={[
                      styles.statusBadge, 
                      { backgroundColor: getStatusColor(order.status) + '20' }
                    ]}>
                      {getStatusIcon(order.status)}
                      <Text style={[
                        styles.statusText,
                        { color: getStatusColor(order.status) }
                      ]}>
                        {order.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.orderCardBody}>
                    <View style={styles.orderItemsPreview}>
                      <Text style={styles.orderItemsCount}>
                        {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                      </Text>
                      <Text style={styles.orderTotal}>
                        {formatCurrency(order.total)}
                      </Text>
                    </View>
                    
                    <View style={styles.orderCardActions}>
                      <TouchableOpacity 
                        style={styles.viewDetailsButton}
                        onPress={() => setSelectedOrder(order)}
                      >
                        <Text style={styles.viewDetailsText}>View Details</Text>
                      </TouchableOpacity>
                      
                      {order.status === 'pending' && (
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.confirmButton]}
                          onPress={() => handleCheckOrder(order.id)}
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <ActivityIndicator size="small" color={COLORS.white} />
                          ) : (
                            <>
                              <Check size={16} color={COLORS.white} />
                              <Text style={styles.actionButtonText}>Confirm</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )}
                      
                      {order.status === 'confirmed' && (
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.readyButton]}
                          onPress={() => handleReadyOrder(order.id)}
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <ActivityIndicator size="small" color={COLORS.white} />
                          ) : (
                            <>
                              <CheckCircle size={16} color={COLORS.white} />
                              <Text style={styles.actionButtonText}>Mark Ready</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </Animated.ScrollView>

      {/* Notification Button */}
      <View style={styles.notificationContainer}>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={handleSendNotifications}
        >
          <Bell size={20} color={COLORS.white} style={{ marginRight: 8 }} />
          <Text style={styles.notificationButtonText}>Send Order Notifications</Text>
        </TouchableOpacity>
      </View>

      {/* Sidebar Menu */}
      <Modal
        visible={isSidebarOpen}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsSidebarOpen(false)}
      >
        <View style={styles.sidebarOverlay}>
          <Animated.View 
            style={[
              styles.sidebar,
              { transform: [{ translateX: sidebarAnim }] }
            ]}
          >
            <View style={styles.sidebarHeader}>
              <View style={styles.sidebarLogo}>
                <Text style={styles.sidebarLogoText}>TK</Text>
              </View>
              <Text style={styles.sidebarTitle}>THATKart</Text>
              <TouchableOpacity 
                style={styles.closeSidebarButton}
                onPress={() => setIsSidebarOpen(false)}
              >
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.sidebarContent}>
              <TouchableOpacity 
                style={styles.sidebarItem}
                onPress={() => navigateToScreen('')}
              >
                <Home size={20} color={COLORS.text} style={styles.sidebarIcon} />
                <Text style={styles.sidebarItemText}>Dashboard</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.sidebarItem}
                onPress={() => navigateToScreen('new-registration')}
              >
                <UserPlus size={20} color={COLORS.text} style={styles.sidebarIcon} />
                <Text style={styles.sidebarItemText}>New Registration</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.sidebarItem}
                onPress={() => navigateToScreen('user-details')}
              >
                <Users size={20} color={COLORS.text} style={styles.sidebarIcon} />
                <Text style={styles.sidebarItemText}>User Details</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.sidebarItem}
                onPress={() => navigateToScreen('delivery')}
              >
                <Package size={20} color={COLORS.text} style={styles.sidebarIcon} />
                <Text style={styles.sidebarItemText}>Delivery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.sidebarItem}
                onPress={() => navigateToScreen('default-orders')}
              >
                <ClipboardList size={20} color={COLORS.text} style={styles.sidebarIcon} />
                <Text style={styles.sidebarItemText}>Default Orders</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.sidebarItem}
                onPress={() => navigateToScreen('past-orders')}
              >
                <Clock size={20} color={COLORS.text} style={styles.sidebarIcon} />
                <Text style={styles.sidebarItemText}>Past Orders</Text>
              </TouchableOpacity>
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.sidebarLogoutButton}
              onPress={handleLogout}
            >
              <LogOut size={20} color={COLORS.error} style={styles.sidebarIcon} />
              <Text style={styles.sidebarLogoutText}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
          
          <TouchableOpacity 
            style={styles.sidebarOverlayBackground}
            onPress={() => setIsSidebarOpen(false)}
            activeOpacity={1}
          />
        </View>
      </Modal>

      {/* Order Details Modal */}
      <Modal
        visible={!!selectedOrder}
        transparent={true}
        animationType="none"
        onRequestClose={() => setSelectedOrder(null)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              {
                opacity: modalAnim,
                transform: [
                  {
                    translateY: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <TouchableOpacity 
                style={styles.closeModalButton}
                onPress={() => setSelectedOrder(null)}
              >
                <X size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            {selectedOrder && (
              <ScrollView 
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.orderDetailHeader}>
                  <View style={[
                    styles.orderStatusIndicator,
                    { backgroundColor: getStatusColor(selectedOrder.status) }
                  ]}>
                    {getStatusIcon(selectedOrder.status)}
                  </View>
                  
                  <View style={styles.orderDetailHeaderText}>
                    <Text style={styles.orderDetailHotelName}>
                      {selectedOrder.owner_name}
                    </Text>
                    <Text style={styles.orderDetailHotelId}>
                      ID: {selectedOrder.hotel_id}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.orderDetailSection}>
                  <Text style={styles.orderDetailSectionTitle}>Order Items</Text>
                  
                  {selectedOrder.items.map((item: any, index: number) => (
                    <View key={index} style={styles.orderDetailItem}>
                      <View style={styles.orderDetailItemInfo}>
                        <Text style={styles.orderDetailItemName}>{item.name}</Text>
                        <Text style={styles.orderDetailItemPrice}>
                          ₹{item.price}/{item.unit}
                        </Text>
                      </View>
                      
                      <View style={styles.orderDetailItemQuantity}>
                        <Text style={styles.orderDetailItemQuantityText}>
                          {item.quantity} {item.unit}
                        </Text>
                      </View>
                      
                      <View style={styles.orderDetailItemTotal}>
                        <Text style={styles.orderDetailItemTotalText}>
                          ₹{item.price * item.quantity}
                        </Text>
                      </View>
                    </View>
                  ))}
                  
                  <View style={styles.orderDetailTotalContainer}>
                    <Text style={styles.orderDetailTotalLabel}>Total Amount</Text>
                    <Text style={styles.orderDetailTotalValue}>
                      ₹{selectedOrder.total}
                    </Text>
                  </View>
                </View>
                
                {selectedOrder.note && (
                  <View style={styles.orderDetailSection}>
                    <Text style={styles.orderDetailSectionTitle}>Customer Note</Text>
                    <View style={styles.orderDetailNoteContainer}>
                      <Text style={styles.orderDetailNoteText}>{selectedOrder.note}</Text>
                    </View>
                  </View>
                )}
                
                <View style={styles.orderDetailActions}>
                  {selectedOrder.status === 'pending' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.confirmButton]}
                      onPress={() => handleCheckOrder(selectedOrder.id)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                      ) : (
                        <>
                          <Check size={20} color={COLORS.white} style={{ marginRight: 8 }} />
                          <Text style={styles.actionButtonText}>Confirm Order</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                  
                  {selectedOrder.status === 'confirmed' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.readyButton]}
                      onPress={() => handleReadyOrder(selectedOrder.id)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                      ) : (
                        <>
                          <CheckCircle size={20} color={COLORS.white} style={{ marginRight: 8 }} />
                          <Text style={styles.actionButtonText}>Mark as Ready</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                  
                  {selectedOrder.status === 'ready' && (
                    <View style={styles.orderReadyMessage}>
                      <CheckCircle size={20} color={COLORS.success} style={{ marginRight: 8 }} />
                      <Text style={styles.orderReadyText}>
                        This order is ready for delivery
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.text,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
  },
  menuButton: {
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
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminInfoContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminInitial: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  adminTextInfo: {
    marginLeft: 12,
  },
  adminName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  adminEmail: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  metricCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  metricIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  metricTextContainer: {
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  quickActionsContainer: {
    padding: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quickActionItem: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
  },
  ordersContainer: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  emptyOrdersContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyOrdersText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 12,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  orderCardLeft: {
    flex: 1,
  },
  hotelId: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  orderCardBody: {
    padding: 16,
  },
  orderItemsPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderItemsCount: {
    fontSize: 14,
    color: COLORS.text,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  orderCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewDetailsButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background,
    borderRadius: 6,
    marginRight: 8,
    alignItems: 'center',
  },
  viewDetailsText: {
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
    marginLeft: 8,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  readyButton: {
    backgroundColor: COLORS.success,
  },
  actionButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.white,
    marginLeft: 4,
  },
  notificationContainer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  notificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  notificationButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.white,
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
  sidebarLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarLogoText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: COLORS.white,
  },
  sidebarTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: COLORS.text,
  },
  closeSidebarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  sidebarLogoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  sidebarLogoutText: {
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
  orderDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderStatusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  orderDetailHeaderText: {
    flex: 1,
  },
  orderDetailHotelName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: COLORS.text,
  },
  orderDetailHotelId: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  orderDetailSection: {
    marginBottom: 12,
  },
  orderDetailSectionTitle: {
    fontFamily: 'Poppins-SemiBold',
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
  orderDetailItemInfo: {
    flex: 2,
  },
  orderDetailItemName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.text,
  },
  orderDetailItemPrice: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.darkGray,
  },
  orderDetailItemQuantity: {
    flex: 1,
    textAlign: 'center',
  },
  orderDetailItemQuantityText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.text,
  },
  orderDetailItemTotal: {
    flex: 1,
    textAlign: 'right',
  },
  orderDetailItemTotalText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: COLORS.text,
  },
  orderDetailTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    marginTop: 8,
  },
  orderDetailTotalLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: COLORS.text,
  },
  orderDetailTotalValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: COLORS.primary,
  },
  orderDetailNoteContainer: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  orderDetailNoteText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.text,
  },
  orderDetailActions: {
    marginTop: 24,
  },
  orderReadyMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.success + '20',
    borderRadius: 8,
  },
  orderReadyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.white,
  },
  closeModalButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarOverlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    marginRight: 8,
  },
  refreshButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.text,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.error,
    marginTop: 10,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  retryButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.white,
  },
  ordersList: {
    flex: 1,
    width: '100%',
  },
  viewAllOrdersButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  viewAllOrdersText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.white,
  },
});