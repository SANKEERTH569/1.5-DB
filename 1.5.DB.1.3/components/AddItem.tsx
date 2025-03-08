import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { COLORS } from '@/constants/Colors';
import Input from '@/components/common/Input';
import { Plus, Check } from 'lucide-react-native';

interface AddItemProps {
  visible: boolean;
  onClose: () => void;
  onAddItem: (item: any) => void;
  availableItems: any[];
}

export default function AddItem({ visible, onClose, onAddItem, availableItems }: AddItemProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [customPrice, setCustomPrice] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  
  // Manual entry states
  const [manualItemName, setManualItemName] = useState('');
  const [manualItemPrice, setManualItemPrice] = useState('');
  const [manualItemUnit, setManualItemUnit] = useState('');

  const filteredItems = availableItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleItemSelect = (item: any) => {
    setSelectedItem(item);
    setCustomPrice(item.price.toString());
  };

  const handleAddSelectedItem = () => {
    if (selectedItem) {
      // Create a copy of the item with the updated price
      const updatedItem = {
        ...selectedItem,
        price: parseFloat(customPrice) || selectedItem.price
      };
      onAddItem(updatedItem);
      resetForm();
      onClose();
    }
  };

  const handleAddManualItem = () => {
    if (manualItemName && manualItemPrice) {
      const newItem = {
        id: `manual-${Date.now()}`, // Generate a temporary ID
        name: manualItemName,
        price: parseFloat(manualItemPrice) || 0,
        unit: manualItemUnit || 'item',
      };
      onAddItem(newItem);
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setSelectedItem(null);
    setCustomPrice('');
    setManualItemName('');
    setManualItemPrice('');
    setManualItemUnit('');
    setShowManualEntry(false);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {showManualEntry ? 'Add Manual Item' : 'Add Item'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {!showManualEntry ? (
              <>
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  containerStyle={styles.searchContainer}
                />

                {selectedItem ? (
                  <View style={styles.selectedItemContainer}>
                    <Text style={styles.selectedItemTitle}>Selected Item:</Text>
                    <Text style={styles.itemName}>{selectedItem.name}</Text>
                    
                    <View style={styles.priceEditContainer}>
                      <Text style={styles.priceLabel}>Price (₹):</Text>
                      <Input
                        placeholder="Enter price"
                        value={customPrice}
                        onChangeText={setCustomPrice}
                        keyboardType="numeric"
                        containerStyle={styles.priceInput}
                      />
                      <Text style={styles.unitText}>/{selectedItem.unit}</Text>
                    </View>
                    
                    <View style={styles.buttonRow}>
                      <TouchableOpacity 
                        style={styles.actionButton} 
                        onPress={handleAddSelectedItem}
                      >
                        <Check size={16} color={COLORS.white} />
                        <Text style={styles.actionButtonText}>Add Item</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.cancelButton]} 
                        onPress={() => setSelectedItem(null)}
                      >
                        <Text style={styles.actionButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <FlatList
                    data={filteredItems}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.itemRow}
                        onPress={() => handleItemSelect(item)}
                      >
                        <View>
                          <Text style={styles.itemName}>{item.name}</Text>
                          <Text style={styles.itemPrice}>
                            ₹{item.price}/{item.unit}
                          </Text>
                        </View>
                        <Plus size={20} color={COLORS.primary} />
                      </TouchableOpacity>
                    )}
                    style={styles.itemsList}
                    ListEmptyComponent={
                      <Text style={styles.emptyText}>No items found</Text>
                    }
                  />
                )}

                <TouchableOpacity 
                  style={styles.manualEntryButton}
                  onPress={() => setShowManualEntry(true)}
                >
                  <Text style={styles.manualEntryText}>Add Item Manually</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.manualEntryContainer}>
                <Input
                  placeholder="Item Name"
                  value={manualItemName}
                  onChangeText={setManualItemName}
                  containerStyle={styles.inputContainer}
                />
                
                <Input
                  placeholder="Price"
                  value={manualItemPrice}
                  onChangeText={setManualItemPrice}
                  keyboardType="numeric"
                  containerStyle={styles.inputContainer}
                />
                
                <Input
                  placeholder="Unit (e.g., kg, piece, etc.)"
                  value={manualItemUnit}
                  onChangeText={setManualItemUnit}
                  containerStyle={styles.inputContainer}
                />
                
                <View style={styles.buttonRow}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={handleAddManualItem}
                  >
                    <Check size={16} color={COLORS.white} />
                    <Text style={styles.actionButtonText}>Add Item</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => setShowManualEntry(false)}
                  >
                    <Text style={styles.actionButtonText}>Back</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

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
    padding: 16,
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
    maxHeight: 500,
  },
  searchContainer: {
    marginBottom: 12,
  },
  itemsList: {
    maxHeight: 300,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
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
    marginTop: 2,
  },
  selectedItemContainer: {
    padding: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedItemTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
  },
  priceEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  priceLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.text,
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    marginRight: 8,
  },
  unitText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: COLORS.darkGray,
  },
  actionButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.white,
    marginLeft: 4,
  },
  manualEntryButton: {
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 16,
  },
  manualEntryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.primary,
  },
  manualEntryContainer: {
    padding: 12,
  },
  inputContainer: {
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 20,
  },
});