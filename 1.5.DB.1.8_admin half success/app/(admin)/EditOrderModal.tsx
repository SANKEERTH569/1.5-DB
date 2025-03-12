import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import { 
  Plus, 
  X, 
  ShoppingBag, 
  Building, 
  Tag, 
  Save,
  AlertCircle
} from 'lucide-react-native';
import Button from '@/components/common/Button';
import { COLORS } from '@/constants/Colors';
import OrderItemList from './OrderItemList';
import { DefaultOrderItem } from './types';
import { LinearGradient } from 'expo-linear-gradient';

interface EditOrderModalProps {
  isEditMode: boolean;
  selectedOrder: any;
  editedItems: DefaultOrderItem[];
  setIsEditMode: (isEditMode: boolean) => void;
  setSelectedOrder: (order: any) => void;
  setEditedItems: (items: DefaultOrderItem[]) => void;
  handleUpdateQuantity: (itemId: string, change: number) => void;
  handleRemoveItem: (itemId: string) => void;
  handleUpdatePrice: (itemId: string, newPrice: number) => void;
  handleSaveChanges: () => void;
  setShowAddItemModal: (show: boolean) => void;
}

const { height } = Dimensions.get('window');

const EditOrderModal: React.FC<EditOrderModalProps> = ({
  isEditMode,
  selectedOrder,
  editedItems,
  setIsEditMode,
  setSelectedOrder,
  setEditedItems,
  handleUpdateQuantity,
  handleRemoveItem,
  handleUpdatePrice,
  handleSaveChanges,
  setShowAddItemModal,
}) => {
  // Animation values
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Calculate total order value
  const totalOrderValue = editedItems.reduce(
    (sum, item) => sum + (item.price * item.quantity), 
    0
  );

  useEffect(() => {
    if (isEditMode) {
      // Animate modal in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Reset animation values when modal is closed
      slideAnim.setValue(height);
      fadeAnim.setValue(0);
    }
  }, [isEditMode]);

  const closeModal = () => {
    // Animate modal out
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setIsEditMode(false);
      setSelectedOrder(null);
    });
  };

  return (
    <Modal
      visible={isEditMode}
      transparent={true}
      animationType="none"
      onRequestClose={closeModal}
    >
      <Animated.View 
        style={[
          styles.modalOverlay,
          { opacity: fadeAnim }
        ]}
      >
        <TouchableOpacity 
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={closeModal}
        />
        
        <Animated.View 
          style={[
            styles.modalContent,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <LinearGradient
            colors={[COLORS.primary + '20', COLORS.white]}
            style={styles.modalGradient}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <ShoppingBag size={22} color={COLORS.primary} style={styles.modalHeaderIcon} />
                <Text style={styles.modalTitle}>Edit Default Order</Text>
              </View>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeModal}
              >
                <X size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <>
                <View style={styles.hotelInfoCard}>
                  <View style={styles.hotelInfoHeader}>
                    <View style={styles.hotelInitialContainer}>
                      <Text style={styles.hotelInitial}>
                        {selectedOrder?.hotelName ? selectedOrder.hotelName.charAt(0).toUpperCase() : 'H'}
                      </Text>
                    </View>
                    
                    <View style={styles.hotelInfoContent}>
                      <Text style={styles.hotelName}>{selectedOrder?.hotelName || 'Unknown Hotel'}</Text>
                      <View style={styles.hotelIdContainer}>
                        <Tag size={14} color={COLORS.darkGray} style={styles.hotelIdIcon} />
                        <Text style={styles.hotelId}>{selectedOrder?.hotelId || 'No ID'}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                
                <View style={styles.orderSummary}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Items</Text>
                    <Text style={styles.summaryValue}>{editedItems.length}</Text>
                  </View>
                  
                  <View style={styles.summaryDivider} />
                  
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total Value</Text>
                    <Text style={styles.summaryValue}>₹{totalOrderValue.toFixed(2)}</Text>
                  </View>
                </View>
                
                <View style={styles.itemsSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Order Items</Text>
                    <TouchableOpacity
                      style={styles.addItemButton}
                      onPress={() => setShowAddItemModal(true)}
                    >
                      <Plus size={16} color={COLORS.white} />
                      <Text style={styles.addItemText}>Add Item</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {editedItems.length === 0 ? (
                    <View style={styles.emptyItemsContainer}>
                      <AlertCircle size={40} color={COLORS.lightGray} />
                      <Text style={styles.emptyItemsText}>No items in this order</Text>
                      <Text style={styles.emptyItemsSubtext}>
                        Tap "Add Item" to add items to this default order
                      </Text>
                    </View>
                  ) : (
                    <ScrollView 
                      style={styles.itemsContainer}
                      showsVerticalScrollIndicator={false}
                    >
                      <OrderItemList
                        items={editedItems}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemoveItem={handleRemoveItem}
                        onUpdatePrice={handleUpdatePrice}
                      />
                    </ScrollView>
                  )}
                </View>
                
                <View style={styles.actionsContainer}>
                  <Button
                    title="Save Changes"
                    onPress={handleSaveChanges}
                    variant="primary"
                    size="large"
                    style={styles.saveButton}
                    icon={<Save size={18} color="white" style={{ marginRight: 8 }} />}
                  />
                  
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={closeModal}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalGradient: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
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
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalHeaderIcon: {
    marginRight: 10,
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
  hotelInfoCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  hotelInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hotelInitialContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hotelInitial: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  hotelInfoContent: {
    flex: 1,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  hotelIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hotelIdIcon: {
    marginRight: 4,
  },
  hotelId: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  orderSummary: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  summaryDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 10,
  },
  itemsSection: {
    marginHorizontal: 20,
    marginTop: 16,
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.white,
    marginLeft: 6,
  },
  emptyItemsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyItemsText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyItemsSubtext: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  itemsContainer: {
    maxHeight: 300,
  },
  actionsContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  saveButton: {
    marginBottom: 12,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.darkGray,
  }
});

export default EditOrderModal;