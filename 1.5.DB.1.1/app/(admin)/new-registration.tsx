import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { ArrowLeft, Save } from 'lucide-react-native';
import axios from 'axios';

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
  const [errors, setErrors] = useState({
    shopName: '',
    ownerName: '',
    businessType: '',
    emailAddress: '',
    phoneNumber: '',
  });
  const [dbStatus, setDbStatus] = useState('');

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await axios.get('http://localhost:3000/health');
        setDbStatus(response.data.db);
      } catch (error) {
        console.error('Failed to connect to backend:', error.message);
        setDbStatus('Failed to connect to backend');
      }
    };

    checkBackendHealth();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      shopName: '',
      ownerName: '',
      businessType: '',
      emailAddress: '',
      phoneNumber: '',
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

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    console.log('Form is valid, attempting to save...');

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
      });

      console.log('Response from server:', response.data);

      Alert.alert(
        'Registration Successful',
        `Your details have been registered and you can access them through user details.\n\nHotel ID: ${response.data.hotel_id}\nShop Name: ${response.data.shop_name}\nOwner: ${response.data.owner_name}\nPhone: ${response.data.phone_number}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error saving registration data:', error.message);
      Alert.alert('Error', 'Failed to save registration data');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Registration</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formContainer}>
          <View style={styles.hotelIdContainer}>
            <Text style={styles.hotelIdLabel}>Hotel ID (Auto-generated)</Text>
            <Text style={styles.hotelId}>{hotelId}</Text>
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
          />

          <Input
            label="Owner Name"
            placeholder="Enter owner name"
            value={ownerName}
            onChangeText={(text) => {
              setOwnerName(text);
              setErrors({ ...errors, ownerName: '' });
            }}
            error={errors.ownerName}
          />

          <Input
            label="Business Type"
            placeholder="Enter business type (Hotel, Restaurant, etc.)"
            value={businessType}
            onChangeText={(text) => {
              setBusinessType(text);
              setErrors({ ...errors, businessType: '' });
            }}
            error={errors.businessType}
          />

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
          />

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
          />

          <Input
            label="Alternate Phone Number (Optional)"
            placeholder="Enter alternate phone number"
            value={alternatePhoneNumber}
            onChangeText={setAlternatePhoneNumber}
            keyboardType="phone-pad"
          />

          <Input
            label="Google Maps Location (Optional)"
            placeholder="Enter Google Maps link"
            value={googleMapsLocation}
            onChangeText={setGoogleMapsLocation}
          />

          <Button
            title="Save Registration"
            onPress={handleSave}
            variant="primary"
            size="large"
            style={styles.saveButton}
            icon={<Save size={20} color="white" style={{ marginRight: 8 }} />}
          />
        </View>
      </ScrollView>
      {dbStatus && (
        <View style={styles.dbStatusContainer}>
          <Text style={styles.dbStatusText}>{dbStatus}</Text>
        </View>
      )}
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
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  hotelIdContainer: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  hotelIdLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  hotelId: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: COLORS.primary,
  },
  addressInput: {
    height: 80,
    paddingTop: 12,
  },
  saveButton: {
    marginTop: 24,
  },
  dbStatusContainer: {
    padding: 16,
    backgroundColor: COLORS.errorBackground,
  },
  dbStatusText: {
    color: COLORS.errorText,
    textAlign: 'center',
  },
});