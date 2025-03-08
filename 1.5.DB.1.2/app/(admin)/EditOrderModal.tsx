import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import Button from '@/components/common/Button';
import { COLORS } from '@/constants/Colors';
import OrderItemList from './OrderItemList';
import { DefaultOrderItem } from './types';

interface EditOrderModalProps {
  isEditMode: boolean;
  selectedOrder: any;
  editedItems: DefaultOrderItem[];
  setIsEditMode: (isEditMode: boolean) => void;
  setSelectedOrder: (order: any) => void;
  setEditedItems: (items: DefaultOrderItem[]) => void;
  handleUpdateQuantity: (itemId: string, change: number) => void;
  handleRemoveItem: (itemId: string) => void;
  handleSaveChanges: () => void;
  setShowAddItemModal: (show: boolean) => void;
}

const EditOrderModal: React.FC<EditOrderModalProps> = ({
  isEditMode,
  selectedOrder,
  editedItems,
  setIsEditMode,
  setSelectedOrder,
  setEditedItems,
  handleUpdateQuantity,
  handleRemoveItem,
  handleSaveChanges,
  setShowAddItemModal,
}) => {
  return (
    <Modal
      visible={isEditMode}
      transparent={true}
      animationType="slide"
      onRequestClose={() => {
        setIsEditMode(false);
        setSelectedOrder(null);
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Default Order</Text>
            <TouchableOpacity
              onPress={() => {
                setIsEditMode(false);
                setSelectedOrder(null);
              }}
            >
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {selectedOrder && (
            <View style={styles.modalBody}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderInfoLabel}>Hotel ID:</Text>
                <Text style={styles.orderInfoValue}>{selectedOrder?.hotelId}</Text>
              </View>

              <View style={styles.orderInfo}>
                <Text style={styles.orderInfoLabel}>Shop Name:</Text>
                <Text style={styles.orderInfoValue}>{selectedOrder?.hotelName}</Text>
              </View>

              <View style={styles.orderInfo}>
                <Text style={styles.orderInfoLabel}>Hotel:</Text>
                <Text
                  style={styles.orderInfoValue}
                >{`${selectedOrder?.hotelName} (${selectedOrder?.hotelId})`}</Text>
              </View>

              <View style={styles.itemsHeader}>
                <Text style={styles.itemsTitle}>Items</Text>
                <TouchableOpacity
                  style={styles.addItemButton}
                  onPress={() => setShowAddItemModal(true)}
                >
                  <Plus size={16} color={COLORS.white} />
                  <Text style={styles.addItemText}>Add Item</Text>
                </TouchableOpacity>
              </View>

              <OrderItemList
                items={editedItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
              />

              <Button
                title="Save Changes"
                onPress={handleSaveChanges}
                variant="primary"
                size="large"
                style={styles.saveButton}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  modalBody: {
    padding: 16,
    flex: 1,
  },
  orderInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  orderInfoLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
    marginRight: 8,
  },
  orderInfoValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.text,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addItemText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: COLORS.white,
    marginLeft: 4,
  },
  saveButton: {
    marginTop: 16,
  },
});

export default EditOrderModal;