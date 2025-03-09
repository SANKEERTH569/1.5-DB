import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { COLORS } from '@/constants/Colors';

export default function RegistrationsListScreen() {
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const response = await axios.get('http://your_backend_url/registrations');
        setRegistrations(response.data);
      } catch (error) {
        console.error('Failed to fetch registrations', error);
      }
    };

    fetchRegistrations();
  }, []);

  const register = async (registrationData) => {
    try {
      const response = await axios.post('http://localhost:3000/register', registrationData);
      console.log('Registration successful', response.data);
    } catch (error) {
      console.error('Failed to register', error);
    }
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
        `Hotel ID: ${response.data.hotel_id}\nShop Name: ${response.data.shop_name}\nOwner: ${response.data.owner_name}\nPhone: ${response.data.phone_number}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error saving registration data:', error);
      Alert.alert('Error', 'Failed to save registration data');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {registrations.map((registration) => (
        <View key={registration.id} style={styles.registrationItem}>
          <Text style={styles.hotelId}>Hotel ID: {registration.hotel_id}</Text>
          <Text>Shop Name: {registration.shop_name}</Text>
          <Text>Owner Name: {registration.owner_name}</Text>
          <Text>Business Type: {registration.business_type}</Text>
          <Text>Email: {registration.email_address}</Text>
          <Text>Phone: {registration.phone_number}</Text>
          <Text>Alternate Phone: {registration.alternate_phone_number}</Text>
          <Text>Location: {registration.google_maps_location}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  registrationItem: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  hotelId: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: COLORS.primary,
    marginBottom: 8,
  },
});