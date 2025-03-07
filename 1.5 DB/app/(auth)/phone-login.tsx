import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft } from 'lucide-react-native';

export default function PhoneLoginScreen() {
  const router = useRouter();
  const { signInWithPhone, isLoading } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const handleBack = () => {
    router.back();
  };

  const handleContinue = async () => {
    // Basic validation
    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }

    // Format phone number to E.164 format
    let formattedNumber = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      formattedNumber = `+91${phoneNumber}`; // Default to India code
    }

    try {
      await signInWithPhone(formattedNumber);
      router.push('/(auth)/verify-otp');
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <ArrowLeft size={24} color={COLORS.text} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Enter your phone number</Text>
        <Text style={styles.subtitle}>
          We'll send you a verification code to confirm your identity
        </Text>

        <View style={styles.inputContainer}>
          <Input
            label="Phone Number"
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              setError('');
            }}
            keyboardType="phone-pad"
            error={error}
            autoFocus
          />
          
          {Platform.OS === 'web' && (
            <div id="recaptcha-container"></div>
          )}
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          variant="primary"
          size="large"
          isLoading={isLoading}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 20,
  },
  backButton: {
    marginTop: 50,
    marginBottom: 20,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  button: {
    width: '100%',
  },
});