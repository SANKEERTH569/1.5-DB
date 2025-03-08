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
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import Button from '@/components/common/Button';
import { ArrowLeft, Trash2, Phone, MapPin, Search } from 'lucide-react-native';
import Input from '@/components/common/Input';
import axios from 'axios';

export default function UserDetailsScreen() {
  const router = useRouter();
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [newUsers, setNewUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showNewUsers, setShowNewUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRegisteredUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/registrations');
        console.log('Fetched registered users:', response.data);
        setRegisteredUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch registered users:', error.message);
      }
    };

    fetchRegisteredUsers();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleRemoveUser = (id: string) => {
    Alert.alert(
      'Remove User',
      'Are you sure you want to remove this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`http://localhost:3000/registrations/${id}`);
              setRegisteredUsers(prevUsers => prevUsers.filter(user => user.id !== id));
              setSelectedUser(null);
              Alert.alert('Success', 'User has been removed successfully.');
            } catch (error) {
              console.error('Failed to remove user:', error.message);
              Alert.alert('Error', 'Failed to remove user.');
            }
          }
        },
      ]
    );
  };

  const handleApproveNewUser = (id: string) => {
    // In a real app, this would navigate to the registration form with the phone pre-filled
    const user = newUsers.find(user => user.id === id);
    if (user) {
      Alert.alert(
        'Approve User',
        `Proceed to register user with phone ${user.phone}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Register', 
            onPress: () => {
              // Remove from new users list
              setNewUsers(prevUsers => prevUsers.filter(u => u.id !== id));
              // Navigate to registration form
              router.push('/(admin)/new-registration');
            }
          },
        ]
      );
    }
  };

  const filteredUsers = registeredUsers.filter(user => 
    user.hotel_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUserItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => setSelectedUser(item)}
    >
      <View style={styles.userHeader}>
        <View>
          <Text style={styles.hotelId}>{item.hotel_id}</Text>
          <Text style={styles.hotelName}>{item.shop_name}</Text>
        </View>
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleRemoveUser(item.id)}
        >
          <Trash2 size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.ownerName}>{item.owner_name}</Text>
        <View style={styles.phoneContainer}>
          <Phone size={16} color={COLORS.darkGray} style={styles.infoIcon} />
          <Text style={styles.phone}>{item.phone_number}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderNewUserItem = ({ item }: { item: any }) => (
    <View style={styles.newUserCard}>
      <Text style={styles.newUserPhone}>{item.phone}</Text>
      <Button
        title="Register"
        onPress={() => handleApproveNewUser(item.id)}
        variant="primary"
        size="small"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, !showNewUsers && styles.activeTab]}
          onPress={() => setShowNewUsers(false)}
        >
          <Text style={[styles.tabText, !showNewUsers && styles.activeTabText]}>
            Registered Users
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, showNewUsers && styles.activeTab]}
          onPress={() => setShowNewUsers(true)}
        >
          <Text style={[styles.tabText, showNewUsers && styles.activeTabText]}>
            New Users ({newUsers.length})
          </Text>
        </TouchableOpacity>
      </View>

      {!showNewUsers ? (
        <>
          <View style={styles.searchContainer}>
            <Search size={20} color={COLORS.darkGray} style={styles.searchIcon} />
            <Input
              placeholder="Search by ID, name, or phone"
              value={searchQuery}
              onChangeText={setSearchQuery}
              containerStyle={styles.searchInputContainer}
              inputStyle={styles.searchInput}
            />
          </View>
          
          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No registered users found</Text>
              </View>
            }
          />
        </>
      ) : (
        <FlatList
          data={newUsers}
          renderItem={renderNewUserItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No new users waiting for approval</Text>
            </View>
          }
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
              <Text style={styles.modalTitle}>User Details</Text>
              <TouchableOpacity onPress={() => setSelectedUser(null)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
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
                  <Text style={styles.detailValue}>{selectedUser.phone_number}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Address</Text>
                  <Text style={styles.detailValue}>{selectedUser.google_maps_location}</Text>
                  
                  <TouchableOpacity style={styles.mapLinkButton} onPress={() => {
                    // Open the address link in maps
                    Linking.openURL(selectedUser.google_maps_location);
                  }}>
                    <MapPin size={16} color={COLORS.primary} style={{ marginRight: 8 }} />
                    <Text style={styles.mapLinkText}>Open in Maps</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Registration Date</Text>
                  <Text style={styles.detailValue}>{new Date(selectedUser.registration_date).toLocaleDateString()}</Text>
                </View>
                
                <Button
                  title="Remove User"
                  onPress={() => handleRemoveUser(selectedUser.id)}
                  variant="danger"
                  size="large"
                  style={styles.removeUserButton}
                  icon={<Trash2 size={20} color="white" style={{ marginRight: 8 }} />}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
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
  listContainer: {
    padding: 16,
  },
  userCard: {
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
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
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
  removeButton: {
    padding: 4,
  },
  userInfo: {
    marginTop: 4,
  },
  ownerName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 6,
  },
  phone: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  newUserCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  newUserPhone: {
    fontFamily: 'Inter-Medium',
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
  modalBody: {
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
  mapLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  mapLinkText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.primary,
  },
  removeUserButton: {
    marginTop: 24,
  },
});