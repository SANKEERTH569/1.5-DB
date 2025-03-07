import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image
} from 'react-native';
import { COLORS } from '@/constants/Colors';
import Button from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Phone, MapPin, User, MessageSquare } from 'lucide-react-native';

// Mock user data
const USER_DATA = {
  hotelId: 'KIR001',
  name: 'Hotel Sunshine',
  ownerName: 'John Doe',
  phone: '+91 9876543210',
  address: '123 Main Street, City Center, Hyderabad, 500001',
  addressLink: 'https://maps.google.com/?q=17.385044,78.486671',
  registrationDate: '2024-12-15',
};

export default function ProfileScreen() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleOpenMap = () => {
    // In a real app, this would open the map link
    console.log('Opening map:', USER_DATA.addressLink);
  };

  const handleWhatsApp = () => {
    // In a real app, this would open WhatsApp
    console.log('Opening WhatsApp with number:', USER_DATA.phone);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Text style={styles.profileInitial}>{USER_DATA.name.charAt(0)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.hotelName}>{USER_DATA.name}</Text>
            <View style={styles.hotelIdContainer}>
              <Text style={styles.hotelIdLabel}>Hotel ID:</Text>
              <Text style={styles.hotelId}>{USER_DATA.hotelId}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Hotel Information</Text>
        
        <View style={styles.infoItem}>
          <User size={20} color={COLORS.darkGray} style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Owner Name</Text>
            <Text style={styles.infoValue}>{USER_DATA.ownerName}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <Phone size={20} color={COLORS.darkGray} style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>{USER_DATA.phone}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <MapPin size={20} color={COLORS.darkGray} style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{USER_DATA.address}</Text>
            <TouchableOpacity 
              style={styles.mapLinkButton}
              onPress={handleOpenMap}
            >
              <Text style={styles.mapLinkText}>Open in Maps</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <MessageSquare size={20} color={COLORS.darkGray} style={styles.infoIcon} />
          <TouchableOpacity 
            style={styles.whatsappButton}
            onPress={handleWhatsApp}
          >
            <Text style={styles.whatsappText}>Contact via WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.noteSection}>
        <Text style={styles.noteText}>
          Note: Your profile information can only be updated by the administrator. 
          Please contact support if you need to make changes.
        </Text>
      </View>

      <Button
        title="Logout"
        onPress={handleLogout}
        variant="outline"
        size="large"
        style={styles.logoutButton}
        icon={<LogOut size={20} color={COLORS.primary} style={styles.logoutIcon} />}
      />
    </ScrollView>
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
  profileCard: {
    backgroundColor: COLORS.white,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInitial: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: COLORS.white,
  },
  profileInfo: {
    flex: 1,
  },
  hotelName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 4,
  },
  hotelIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hotelIdLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
    marginRight: 4,
  },
  hotelId: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.text,
  },
  infoSection: {
    backgroundColor: COLORS.white,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.text,
  },
  mapLinkButton: {
    marginTop: 8,
  },
  mapLinkText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.primary,
  },
  whatsappButton: {
    backgroundColor: '#25D366', // WhatsApp green
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  whatsappText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.white,
  },
  noteSection: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: COLORS.info + '20', // 20% opacity
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },
  noteText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
  logoutIcon: {
    marginRight: 8,
  },
});