import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Linking,
  StatusBar,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import Button from '@/components/common/Button';
import { 
  ArrowLeft, 
  Trash2, 
  Phone, 
  MapPin, 
  Search, 
  X, 
  User, 
  Calendar
} from 'lucide-react-native';
import Input from '@/components/common/Input';
import axios from 'axios';

export default function UserDetailsScreen() {
  const router = useRouter();
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [newUsers, setNewUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showNewUsers, setShowNewUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRegisteredUsers();
    
    // Mock data for new users
    setNewUsers([
      { id: 'new1', phone: '+91 9876543210', timestamp: new Date().toISOString() },
      { id: 'new2', phone: '+91 8765432109', timestamp: new Date().toISOString() }
    ]);
  }, []);
  
  const fetchRegisteredUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/registrations');
      setRegisteredUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch registered users:', error.message);
      Alert.alert('Error', 'Failed to fetch user data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleRemoveUser = (id) => {
    Alert.alert(
      'Remove User',
      'Are you sure you want to remove this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`http://localhost:3000/registrations/${id}`);
              setRegisteredUsers(prevUsers => prevUsers.filter(user => user.id !== id));
              setSelectedUser(null);
              Alert.alert('Success', 'User removed successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove user');
            }
          }
        },
      ]
    );
  };

  const handleApproveNewUser = (id) => {
    const user = newUsers.find(user => user.id === id);
    if (user) {
      setNewUsers(prevUsers => prevUsers.filter(u => u.id !== id));
      router.push('/(admin)/new-registration');
    }
  };
  
  const handleCallUser = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const filteredUsers = registeredUsers.filter(user => 
    user.hotel_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.shop_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => setSelectedUser(item)}
    >
      <View style={styles.userHeader}>
        <Text style={styles.hotelName}>{item.shop_name || 'Unnamed Business'}</Text>
        <Text style={styles.hotelId}>{item.hotel_id || 'No ID'}</Text>
      </View>
      
      <View style={styles.userInfo}>
        <View style={styles.infoRow}>
          <User size={14} color={COLORS.darkGray} />
          <Text style={styles.infoText}>{item.owner_name || 'No owner name'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Phone size={14} color={COLORS.darkGray} />
          <Text style={styles.infoText}>{item.phone_number || 'No phone'}</Text>
        </View>
      </View>
      
      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleCallUser(item.phone_number)}
        >
          <Phone size={18} color={COLORS.primary} />
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleRemoveUser(item.id)}
        >
          <Trash2 size={18} color={COLORS.error} />
          <Text style={styles.deleteText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderNewUserItem = ({ item }) => (
    <View style={styles.newUserCard}>
      <View>
        <Text style={styles.newUserPhone}>{item.phone}</Text>
        <Text style={styles.newUserTimestamp}>
          Requested: {formatDate(item.timestamp)}
        </Text>
      </View>
      
      <Button
        title="Register"
        onPress={() => handleApproveNewUser(item.id)}
        variant="primary"
        size="small"
      />
    </View>
  );
  
  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <Text style={styles.emptyText}>
          {showNewUsers 
            ? 'No new users waiting for approval' 
            : searchQuery 
              ? 'No users match your search criteria' 
              : 'No registered users found'}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.searchContainer}>
        <Search size={20} color={COLORS.darkGray} />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchInputContainer}
          inputStyle={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={20} color={COLORS.darkGray} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, !showNewUsers && styles.activeTab]}
          onPress={() => setShowNewUsers(false)}
        >
          <Text style={styles.tabText}>Registered Users</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, showNewUsers && styles.activeTab]}
          onPress={() => setShowNewUsers(true)}
        >
          <Text style={styles.tabText}>
            New Requests {newUsers.length > 0 && `(${newUsers.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      {!showNewUsers ? (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={EmptyListComponent}
        />
      ) : (
        <FlatList
          data={newUsers}
          renderItem={renderNewUserItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={EmptyListComponent}
        />
      )}

      {/* User Details Modal */}
      <Modal
        visible={!!selectedUser}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedUser(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedUser(null)}>
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>User Details</Text>
              <View style={{ width: 24 }} />
            </View>
            
            {selectedUser && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Hotel ID</Text>
                  <Text style={styles.detailValue}>{selectedUser.hotel_id}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Hotel Name</Text>
                  <Text style={styles.detailValue}>{selectedUser.shop_name}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Owner Name</Text>
                  <Text style={styles.detailValue}>{selectedUser.owner_name}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Phone Number</Text>
                  <View style={styles.phoneContainer}>
                    <Text style={styles.detailValue}>{selectedUser.phone_number}</Text>
                    <TouchableOpacity 
                      style={styles.callButton}
                      onPress={() => handleCallUser(selectedUser.phone_number)}
                    >
                      <Phone size={18} color={COLORS.white} />
                      <Text style={styles.callButtonText}>Call</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Address</Text>
                  <Text style={styles.detailValue}>{selectedUser.google_maps_location}</Text>
                  
                  {selectedUser.google_maps_location && (
                    <TouchableOpacity 
                      style={styles.mapButton} 
                      onPress={() => {
                        Linking.openURL(selectedUser.google_maps_location);
                      }}
                    >
                      <MapPin size={16} color={COLORS.white} />
                      <Text style={styles.mapButtonText}>Open in Maps</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Registration Date</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(selectedUser.registration_date)}
                  </Text>
                </View>
                
                <Button
                  title="Remove User"
                  onPress={() => handleRemoveUser(selectedUser.id)}
                  variant="danger"
                  size="large"
                  style={styles.removeButton}
                />
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchInputContainer: {
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 0,
  },
  searchInput: {
    height: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  listContainer: {
    padding: 16,
  },
  userCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userHeader: {
    marginBottom: 12,
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
  userInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  deleteButton: {
    marginLeft: 'auto',
  },
  deleteText: {
    fontSize: 14,
    color: COLORS.error,
  },
  newUserCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  newUserPhone: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  newUserTimestamp: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalBody: {
    padding: 16,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.text,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    gap: 4,
  },
  callButtonText: {
    fontSize: 14,
    color: COLORS.white,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  mapButtonText: {
    fontSize: 14,
    color: COLORS.white,
  },
  removeButton: {
    marginTop: 16,
    marginBottom: 24,
  },
});
