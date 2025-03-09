import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  Animated,
  Linking,
  ActivityIndicator
} from 'react-native';
import { COLORS } from '@/constants/Colors';
import Button from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { 
  LogOut, 
  Phone, 
  MapPin, 
  User, 
  MessageSquare, 
  Calendar, 
  ChevronRight, 
  Shield, 
  HelpCircle,
  Settings,
  AlertCircle
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

export default function ProfileScreen() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!user?.hotel_id && !user?.id) {
          console.log('No user ID available:', user);
          setError('User not authenticated');
          return;
        }
        
        const id = user.hotel_id || user.id;
        console.log('Fetching user details for ID:', id);
        
        const response = await axios.get(`http://localhost:3000/registrations/${id}`);
        console.log('User details response:', response.data);
        
        if (response.data) {
          setUserData(response.data);
        } else {
          setError('Failed to load user details');
        }
      } catch (err: any) {
        console.error('Error fetching user details:', err);
        setError(err.message || 'Failed to load user details');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUserDetails();
    }
  }, [user]);

  React.useEffect(() => {
    if (showLogoutConfirm) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showLogoutConfirm]);

  const handleLogout = async () => {
    try {
      setShowLogoutConfirm(false); // Hide the confirmation modal
      await logout();
      // The redirect will be handled by the logout function in AuthContext
    } catch (error) {
      console.error('Error logging out:', error);
      // Show error message to user
      alert('Failed to logout. Please try again.');
    }
  };

  const handleOpenMap = () => {
    Linking.openURL(userData?.google_maps_location || '');
  };

  const handleWhatsApp = () => {
    const phoneNumber = userData?.phone_number?.replace(/\s+/g, '') || user?.phone?.replace(/\s+/g, '');
    Linking.openURL(`whatsapp://send?phone=${phoneNumber}`);
  };
  
  const handleCall = () => {
    const phoneNumber = userData?.phone_number?.replace(/\s+/g, '') || user?.phone?.replace(/\s+/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };
  
  const handleEmail = () => {
    Linking.openURL(`mailto:${userData?.email_address || user?.email || 'support@thatkart.com'}`);
  };

  if (authLoading || isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <AlertCircle size={50} color={COLORS.error} />
        <Text style={styles.errorText}>Please log in to view your profile</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <AlertCircle size={50} color={COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Try Again"
          onPress={() => setError(null)}
          variant="primary"
          size="small"
          style={styles.retryButton}
        />
      </View>
    );
  }

  console.log('Current user data:', { user, userData });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <View style={styles.header}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primary + 'E6']}
          style={styles.headerGradient}
        />
        
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Text style={styles.profileInitial}>{userData?.shop_name?.charAt(0) || user?.name?.charAt(0) || '?'}</Text>
          </View>
          
          <Text style={styles.hotelName}>{userData?.shop_name || user?.name || 'Loading...'}</Text>
          
          <View style={styles.hotelIdContainer}>
            <Text style={styles.hotelIdLabel}>Hotel ID: </Text>
            <Text style={styles.hotelId}>{userData?.hotel_id || user?.id || 'Loading...'}</Text>
          </View>
          
          <View style={styles.membershipContainer}>
            <Calendar size={14} color={COLORS.white + '99'} style={styles.membershipIcon} />
            <Text style={styles.membershipText}>Member since {new Date(userData?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData?.order_count || 0}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData?.status || 'Active'}</Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>
        </View>
      </View>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <User size={18} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Owner Name</Text>
                <Text style={styles.infoValue}>{userData?.owner_name || 'Not specified'}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Phone size={18} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{userData?.phone_number || user?.phone || 'Not specified'}</Text>
              </View>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleCall}
                activeOpacity={0.7}
              >
                <Phone size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <MapPin size={18} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue} numberOfLines={2}>{userData?.address || 'Not specified'}</Text>
              </View>
              {userData?.google_maps_location && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handleOpenMap}
                  activeOpacity={0.7}
                >
                  <ChevronRight size={16} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Contact & Support</Text>
          
          <TouchableOpacity 
            style={styles.contactCard}
            onPress={handleWhatsApp}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#25D366', '#128C7E']}
              style={styles.whatsappGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.contactCardContent}>
                <MessageSquare size={22} color={COLORS.white} style={styles.contactIcon} />
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactTitle}>WhatsApp Support</Text>
                  <Text style={styles.contactSubtitle}>Get quick assistance via WhatsApp</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactCard}
            onPress={handleEmail}
            activeOpacity={0.8}
          >
            <View style={styles.emailCardContent}>
              <View style={styles.emailIconContainer}>
                <HelpCircle size={22} color={COLORS.primary} />
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={styles.emailTitle}>Email Support</Text>
                <Text style={styles.emailSubtitle}>{userData?.email_address || 'support@thatkart.com'}</Text>
              </View>
              <ChevronRight size={18} color={COLORS.darkGray} />
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingsItem} activeOpacity={0.7}>
              <View style={styles.settingsIconContainer}>
                <Shield size={18} color={COLORS.text} />
              </View>
              <Text style={styles.settingsText}>Privacy Policy</Text>
              <ChevronRight size={16} color={COLORS.darkGray} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.settingsItem} activeOpacity={0.7}>
              <View style={styles.settingsIconContainer}>
                <Settings size={18} color={COLORS.text} />
              </View>
              <Text style={styles.settingsText}>App Settings</Text>
              <ChevronRight size={16} color={COLORS.darkGray} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.settingsItem} 
              activeOpacity={0.7}
              onPress={() => setShowLogoutConfirm(true)}
            >
              <View style={[styles.settingsIconContainer, styles.logoutIconContainer]}>
                <LogOut size={18} color={COLORS.error} />
              </View>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.noteContainer}>
          <AlertCircle size={16} color={COLORS.info} style={styles.noteIcon} />
          <Text style={styles.noteText}>
            Your profile information can only be updated by the administrator. 
            Please contact support if you need to make changes.
          </Text>
        </View>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>THATKart v1.0.0</Text>
        </View>
      </ScrollView>
      
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <Animated.View 
          style={[
            styles.modalOverlay,
            { opacity: fadeAnim }
          ]}
        >
          <TouchableOpacity 
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setShowLogoutConfirm(false)}
          />
          
          <Animated.View 
            style={[
              styles.logoutModal,
              {
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <Text style={styles.logoutTitle}>Logout</Text>
            <Text style={styles.logoutMessage}>Are you sure you want to logout from your account?</Text>
            
            <View style={styles.logoutButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowLogoutConfirm(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#F8F9FA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 0,
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 220,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    }),
  },
  profileInitial: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: COLORS.primary,
  },
  hotelName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: COLORS.white,
    marginBottom: 4,
    textAlign: 'center',
  },
  hotelIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  hotelIdLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.white + 'CC',
  },
  hotelId: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: COLORS.white,
  },
  membershipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  membershipIcon: {
    marginRight: 6,
  },
  membershipText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.white + 'CC',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.darkGray,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
    marginTop: 16,
  },
  sectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: COLORS.text,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray + '80',
    marginVertical: 8,
  },
  contactCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  whatsappGradient: {
    borderRadius: 16,
  },
  contactCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  contactIcon: {
    marginRight: 16,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 2,
  },
  contactSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.white + 'E6',
  },
  emailCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
  },
  emailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emailTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 2,
  },
  emailSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.darkGray,
  },
  settingsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.lightGray + '50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoutIconContainer: {
    backgroundColor: COLORS.error + '15',
  },
  settingsText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  logoutText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: COLORS.error,
    flex: 1,
  },
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.info + '10',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.info,
  },
  noteIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  noteText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.darkGray,
    flex: 1,
    lineHeight: 20,
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  versionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.darkGray + '99',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  logoutModal: {
    width: '85%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    }),
  },
  logoutTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  logoutMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: COLORS.darkGray,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  logoutButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: COLORS.text,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.error,
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: COLORS.white,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.darkGray,
    fontFamily: 'Inter-Medium',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 20,
    fontSize: 16,
    color: COLORS.error,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  retryButton: {
    minWidth: 120,
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    pointerEvents: 'box-none',
  },
});