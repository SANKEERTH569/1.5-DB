import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  StatusBar,
  Platform,
  TextInput,
  KeyboardAvoidingView
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { 
  ArrowLeft, 
  Save, 
  Building2, 
  User, 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Lock
} from 'lucide-react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

// Generate a random hotel ID
const generateHotelId = () => {
  const prefix = 'THK';
  const randomNum = Math.floor(100 + Math.random() * 900); // 3-digit number
  return `${prefix}${randomNum}`;
};

export default function NewRegistrationScreen() {
  const router = useRouter();
  const [hotelId] = useState(generateHotelId());
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [alternatePhoneNumber, setAlternatePhoneNumber] = useState('');
  const [googleMapsLocation, setGoogleMapsLocation] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    shopName: '',
    ownerName: '',
    businessType: '',
    emailAddress: '',
    phoneNumber: '',
    password: '',
  });
  const [dbStatus, setDbStatus] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Animation values
  const progressValue = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  // Refs for input fields
  const ownerNameRef = useRef<TextInput>(null);
  const businessTypeRef = useRef<TextInput>(null);
  const emailAddressRef = useRef<TextInput>(null);
  const phoneNumberRef = useRef<TextInput>(null);
  const alternatePhoneNumberRef = useRef<TextInput>(null);
  const googleMapsLocationRef = useRef<TextInput>(null);

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await axios.get('http://localhost:3000/health');
        setDbStatus(response.data.db);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Failed to connect to backend:', errorMessage);
        setDbStatus('Failed to connect to backend');
      }
    };

    checkBackendHealth();
  }, []);
  
  // Calculate form completion progress
  useEffect(() => {
    const requiredFields = [shopName, ownerName, businessType, emailAddress, phoneNumber];
    const filledFields = requiredFields.filter(field => field.trim() !== '').length;
    const progress = filledFields / requiredFields.length;
    
    Animated.timing(progressValue, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [shopName, ownerName, businessType, emailAddress, phoneNumber]);

  const handleBack = () => {
    router.back();
  };
  
  const handleCopyHotelId = () => {
    // In a real app, this would use Clipboard.setString(hotelId)
    setIsCopied(true);
    
    // Reset after 2 seconds
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      shopName: '',
      ownerName: '',
      businessType: '',
      emailAddress: '',
      phoneNumber: '',
      password: '',
    };

    if (!shopName.trim()) {
      newErrors.shopName = 'Shop name is required';
      isValid = false;
    }

    if (!ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required';
      isValid = false;
    }

    if (!businessType.trim()) {
      newErrors.businessType = 'Business type is required';
      isValid = false;
    }

    if (!emailAddress.trim()) {
      newErrors.emailAddress = 'Email address is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
      newErrors.emailAddress = 'Enter a valid email address';
      isValid = false;
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
      isValid = false;
    } else if (!/^\+?[0-9]{10,12}$/.test(phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Enter a valid phone number';
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0.5,
      duration: 200,
      useNativeDriver: true,
    }).start();

    try {
      const response = await axios.post('http://localhost:3000/register', {
        hotelId,
        shopName,
        ownerName,
        businessType,
        emailAddress,
        phoneNumber,
        alternatePhoneNumber,
        googleMapsLocation,
        password
      });

      // Display success message
      Alert.alert(
        'Success',
        'Registration successfully stored in the database!',
        [{ text: 'OK', onPress: () => router.back() }]
      );

      // Fade back in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      
      setIsSubmitting(false);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error saving registration data:', errorMessage);
      
      // Fade back in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      
      setIsSubmitting(false);
      
      Alert.alert('Error', 'Failed to save registration data');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Registration</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <View style={styles.progressContainer}>
        <Animated.View 
          style={[
            styles.progressBar,
            {
              width: progressValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              }),
              backgroundColor: progressValue.interpolate({
                inputRange: [0, 0.3, 0.7, 1],
                outputRange: [COLORS.error, COLORS.warning, COLORS.info, COLORS.success]
              })
            }
          ]}
        />
      </View>

      <Animated.ScrollView 
        style={[styles.content, { opacity: fadeAnim }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <View style={styles.hotelIdCard}>
            <LinearGradient
              colors={[COLORS.primary + '20', COLORS.primary + '05']}
              style={styles.hotelIdGradient}
            >
              <View style={styles.hotelIdHeader}>
                <Text style={styles.hotelIdLabel}>Hotel ID (Auto-generated)</Text>
                <TouchableOpacity 
                  style={styles.copyButton}
                  onPress={handleCopyHotelId}
                  activeOpacity={0.7}
                >
                  {isCopied ? (
                    <CheckCircle2 size={18} color={COLORS.success} />
                  ) : (
                    <Copy size={18} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.hotelId}>{hotelId}</Text>
            </LinearGradient>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <Building2 size={20} color={COLORS.primary} />
            </View>
            <Input
              label="Shop Name"
              placeholder="Enter shop name"
              value={shopName}
              onChangeText={(text) => {
                setShopName(text);
                setErrors({ ...errors, shopName: '' });
              }}
              error={errors.shopName}
              returnKeyType="next"
              onSubmitEditing={() => ownerNameRef.current?.focus()}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <User size={20} color={COLORS.primary} />
            </View>
            <Input
              label="Owner Name"
              placeholder="Enter owner name"
              value={ownerName}
              onChangeText={(text) => {
                setOwnerName(text);
                setErrors({ ...errors, ownerName: '' });
              }}
              error={errors.ownerName}
              returnKeyType="next"
              onSubmitEditing={() => businessTypeRef.current?.focus()}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <Briefcase size={20} color={COLORS.primary} />
            </View>
            <Input
              label="Business Type"
              placeholder="Enter business type (Hotel, Restaurant, etc.)"
              value={businessType}
              onChangeText={(text) => {
                setBusinessType(text);
                setErrors({ ...errors, businessType: '' });
              }}
              error={errors.businessType}
              returnKeyType="next"
              onSubmitEditing={() => emailAddressRef.current?.focus()}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <Mail size={20} color={COLORS.primary} />
            </View>
            <Input
              label="Email Address"
              placeholder="Enter email address"
              value={emailAddress}
              onChangeText={(text) => {
                setEmailAddress(text);
                setErrors({ ...errors, emailAddress: '' });
              }}
              keyboardType="email-address"
              error={errors.emailAddress}
              returnKeyType="next"
              onSubmitEditing={() => phoneNumberRef.current?.focus()}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <Phone size={20} color={COLORS.primary} />
            </View>
            <Input
              label="Phone Number"
              placeholder="Enter phone number"
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text);
                setErrors({ ...errors, phoneNumber: '' });
              }}
              keyboardType="phone-pad"
              error={errors.phoneNumber}
              returnKeyType="next"
              onSubmitEditing={() => alternatePhoneNumberRef.current?.focus()}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <Phone size={20} color={COLORS.darkGray} />
            </View>
            <Input
              label="Alternate Phone Number (Optional)"
              placeholder="Enter alternate phone number"
              value={alternatePhoneNumber}
              onChangeText={setAlternatePhoneNumber}
              keyboardType="phone-pad"
              returnKeyType="next"
              onSubmitEditing={() => googleMapsLocationRef.current?.focus()}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <MapPin size={20} color={COLORS.darkGray} />
            </View>
            <Input
              label="Google Maps Location (Optional)"
              placeholder="Enter Google Maps link"
              value={googleMapsLocation}
              onChangeText={setGoogleMapsLocation}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <Lock size={20} color={COLORS.primary} />
            </View>
            <Input
              label="Password"
              placeholder="Enter password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors({ ...errors, password: '' });
              }}
              error={errors.password}
              secureTextEntry
              style={styles.input}
            />
          </View>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Button
              title="Save Registration"
              onPress={handleSave}
              variant="primary"
              size="large"
              style={styles.saveButton}
              isLoading={isSubmitting}
            />
          </Animated.View>
        </View>
      </Animated.ScrollView>
      
      {dbStatus && (
        <View style={[
          styles.dbStatusContainer,
          dbStatus === 'Connected' ? styles.dbConnected : styles.dbDisconnected
        ]}>
          <Database size={16} color={dbStatus === 'Connected' ? COLORS.success : COLORS.error} style={styles.dbIcon} />
          <Text style={[
            styles.dbStatusText,
            dbStatus === 'Connected' ? styles.dbConnectedText : styles.dbDisconnectedText
          ]}>
            Database: {dbStatus}
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray + '50',
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: COLORS.text,
  },
  progressContainer: {
    height: 4,
    backgroundColor: COLORS.lightGray,
    width: '100%',
  },
  progressBar: {
    height: '100%',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  formContainer: {
    padding: 16,
  },
  hotelIdCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  hotelIdGradient: {
    padding: 20,
  },
  hotelIdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hotelIdLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  copyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hotelId: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: COLORS.primary,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  inputIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray + '50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 12,
  },
  input: {
    flex: 1,
  },
  saveButton: {
    marginTop: 24,
    borderRadius: 12,
    height: 56,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  dbStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  dbConnected: {
    backgroundColor: COLORS.success + '10',
    borderTopColor: COLORS.success + '30',
  },
  dbDisconnected: {
    backgroundColor: COLORS.error + '10',
    borderTopColor: COLORS.error + '30',
  },
  dbIcon: {
    marginRight: 8,
  },
  dbStatusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  dbConnectedText: {
    color: COLORS.success,
  },
  dbDisconnectedText: {
    color: COLORS.error,
  },
});