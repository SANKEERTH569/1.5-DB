import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  TextInput
} from 'react-native';
import { COLORS } from '@/constants/Colors';
import Input from '@/components/common/Input';
import { 
  Plus, 
  Check, 
  Search, 
  X, 
  ShoppingBag, 
  Edit, 
  ArrowLeft,
  DollarSign,
  Package,
  Ruler
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AddItemProps {
  visible: boolean;
  onClose: () => void;
  onAddItem: (item: any) => void;
  availableItems: any[];
}

const { height } = Dimensions.get('window');

export default function AddItem({ visible, onClose, onAddItem, availableItems }: AddItemProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [customPrice, setCustomPrice] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  
  // Manual entry states
  const [manualItemName, setManualItemName] = useState('');
  const [manualItemPrice, setManualItemPrice] = useState('');
  const [manualItemUnit, setManualItemUnit] = useState('');
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
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
      
      // Focus search input after animation
      setTimeout(() => {
        if (!showManualEntry && searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 400);
    } else {
      // Reset animation values when modal is closed
      slideAnim.setValue(height);
      fadeAnim.setValue(0);
    }
  }, [visible]);
  
  useEffect(() => {
    // Reset search when switching between modes
    setSearchQuery('');
  }, [showManualEntry]);

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
      closeModal();
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
      closeModal();
    }
  };

  const resetForm = () => {
    setSelectedItem(null);
    setCustomPrice('');
    setManualItemName('');
    setManualItemPrice('');
    setManualItemUnit('');
    setShowManualEntry(false);
    setSearchQuery('');
  };
  
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
      onClose();
      resetForm();
    });
  };

  const renderItemRow = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.itemRow}
      onPress={() => handleItemSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.itemIconContainer}>
        <Package size={18} color={COLORS.primary} />
      </View>
      
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>
          ₹{item.price}/{item.unit}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.addItemIconButton}
        onPress={() => handleItemSelect(item)}
      >
        <Plus size={18} color={COLORS.white} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
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
                {showManualEntry ? (
                  <TouchableOpacity 
                    onPress={() => setShowManualEntry(false)}
                    style={styles.backButton}
                  >
                    <ArrowLeft size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                ) : (
                  <ShoppingBag size={22} color={COLORS.primary} style={styles.modalHeaderIcon} />
                )}
                <Text style={styles.modalTitle}>
                  {showManualEntry ? 'Add Custom Item' : (selectedItem ? 'Item Details' : 'Add Item')}
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeModal}
              >
                <X size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {!showManualEntry ? (
              <>
                {!selectedItem && (
                  <View style={styles.searchContainer}>
                    <View style={styles.searchInputWrapper}>
                      <Search size={18} color={COLORS.darkGray} style={styles.searchIcon} />
                      <Input
                        placeholder="Search items..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        containerStyle={styles.searchInputContainer}
                        inputStyle={styles.searchInput}
                        ref={searchInputRef}
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
                  </View>
                )}

                {selectedItem ? (
                  <View style={styles.selectedItemContainer}>
                    <View style={styles.selectedItemHeader}>
                      <View style={styles.selectedItemIconContainer}>
                        <Package size={24} color={COLORS.primary} />
                      </View>
                      <Text style={styles.selectedItemName}>{selectedItem.name}</Text>
                    </View>
                    
                    <View style={styles.priceContainer}>
                      <View style={styles.priceInputContainer}>
                        <Text style={styles.priceLabel}>Price per {selectedItem.unit}</Text>
                        <View style={styles.priceInputWrapper}>
                          <Text style={styles.currencySymbol}>₹</Text>
                          <TextInput
                            style={styles.priceTextInput}
                            value={customPrice}
                            onChangeText={setCustomPrice}
                            keyboardType="numeric"
                            placeholder="0.00"
                            placeholderTextColor={COLORS.darkGray}
                          />
                        </View>
                      </View>
                      
                      <View style={styles.unitContainer}>
                        <Text style={styles.unitLabel}>Unit</Text>
                        <View style={styles.unitDisplay}>
                          <Ruler size={16} color={COLORS.darkGray} style={styles.unitIcon} />
                          <Text style={styles.unitText}>{selectedItem.unit}</Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.actionButtonsContainer}>
                      <TouchableOpacity 
                        style={styles.cancelItemButton}
                        onPress={() => setSelectedItem(null)}
                      >
                        <Text style={styles.cancelItemText}>Cancel</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.confirmItemButton}
                        onPress={handleAddSelectedItem}
                      >
                        <Check size={18} color={COLORS.white} style={styles.confirmItemIcon} />
                        <Text style={styles.confirmItemText}>Add to Order</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <>
                    <FlatList
                      data={filteredItems}
                      keyExtractor={(item) => item.id}
                      renderItem={renderItemRow}
                      style={styles.itemsList}
                      contentContainerStyle={styles.itemsListContent}
                      showsVerticalScrollIndicator={false}
                      ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                          <Package size={40} color={COLORS.lightGray} />
                          <Text style={styles.emptyTitle}>No Items Found</Text>
                          <Text style={styles.emptyText}>
                            {searchQuery 
                              ? `No items match "${searchQuery}"` 
                              : 'Try searching for items or add a custom item'}
                          </Text>
                        </View>
                      }
                    />
                    
                    <View style={styles.dividerContainer}>
                      <View style={styles.divider} />
                      <Text style={styles.dividerText}>OR</Text>
                      <View style={styles.divider} />
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.manualEntryButton}
                      onPress={() => setShowManualEntry(true)}
                    >
                      <Edit size={18} color={COLORS.white} style={styles.manualEntryIcon} />
                      <Text style={styles.manualEntryText}>Add Custom Item</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            ) : (
              <View style={styles.manualEntryContainer}>
                <Text style={styles.manualEntryDescription}>
                  Create a custom item that's not in the catalog
                </Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Item Name</Text>
                  <Input
                    placeholder="Enter item name"
                    value={manualItemName}
                    onChangeText={setManualItemName}
                    containerStyle={styles.inputContainer}
                  />
                </View>
                
                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>Price</Text>
                    <Input
                      placeholder="0.00"
                      value={manualItemPrice}
                      onChangeText={setManualItemPrice}
                      keyboardType="numeric"
                      containerStyle={styles.inputContainer}
                      leftIcon={<DollarSign size={16} color={COLORS.darkGray} />}
                    />
                  </View>
                  
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>Unit</Text>
                    <Input
                      placeholder="kg, piece, etc."
                      value={manualItemUnit}
                      onChangeText={setManualItemUnit}
                      containerStyle={styles.inputContainer}
                      leftIcon={<Ruler size={16} color={COLORS.darkGray} />}
                    />
                  </View>
                </View>
                
                <View style={styles.manualEntryActions}>
                  <TouchableOpacity 
                    style={styles.cancelManualButton}
                    onPress={() => setShowManualEntry(false)}
                  >
                    <Text style={styles.cancelManualText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.addManualButton,
                      (!manualItemName || !manualItemPrice) && styles.disabledButton
                    ]}
                    onPress={handleAddManualItem}
                    disabled={!manualItemName || !manualItemPrice}
                  >
                    <Check size={18} color={COLORS.white} style={styles.addManualIcon} />
                    <Text style={styles.addManualText}>Add Item</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

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
  backButton: {
    marginRight: 10,
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
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
  itemsList: {
    maxHeight: 300,
  },
  itemsListContent: {
    paddingHorizontal: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  itemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  addItemIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedItemContainer: {
    margin: 20,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedItemIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedItemName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  priceInputContainer: {
    flex: 2,
    marginRight: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  currencySymbol: {
    fontSize: 18,
    color: COLORS.darkGray,
    marginRight: 4,
  },
  priceTextInput: {
    flex: 1,
    fontSize: 18,
    color: COLORS.text,
    height: 48,
  },
  unitContainer: {
    flex: 1,
  },
  unitLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  unitDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  unitIcon: {
    marginRight: 8,
  },
  unitText: {
    fontSize: 16,
    color: COLORS.text,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  cancelItemButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    marginRight: 8,
  },
  cancelItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.darkGray,
  },
  confirmItemButton: {
    flex: 2,
    flexDirection: 'row',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginLeft: 8,
  },
  confirmItemIcon: {
    marginRight: 8,
  },
  confirmItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  dividerText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginHorizontal: 12,
  },
  manualEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
  },
  manualEntryIcon: {
    marginRight: 8,
  },
  manualEntryText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
  },
  manualEntryContainer: {
    padding: 20,
  },
  manualEntryDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 0,
  },
  inputRow: {
    flexDirection: 'row',
  },
  manualEntryActions: {
    flexDirection: 'row',
    marginTop: 24,
  },
  cancelManualButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    marginRight: 8,
  },
  cancelManualText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.darkGray,
  },
  addManualButton: {
    flex: 2,
    flexDirection: 'row',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: COLORS.primary + '80',
  },
  addManualIcon: {
    marginRight: 8,
  },
  addManualText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
});