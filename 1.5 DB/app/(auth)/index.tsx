import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import Button from '@/components/common/Button';
import { Phone, Mail } from 'lucide-react-native';

export default function AuthScreen() {
  const router = useRouter();

  const handlePhoneLogin = () => {
    router.push('/(auth)/phone-login');
  };

  const handleEmailLogin = () => {
    router.push('/(auth)/email-login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Kirana</Text>
        <Text style={styles.subtitle}>Choose how you want to login</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Login with Phone Number"
          onPress={handlePhoneLogin}
          variant="primary"
          size="large"
          style={styles.button}
          textStyle={styles.buttonText}
          icon={<Phone size={20} color="white" style={styles.buttonIcon} />}
        />
        
        <Text style={styles.orText}>OR</Text>
        
        <Button
          title="Login with Email"
          onPress={handleEmailLogin}
          variant="outline"
          size="large"
          style={styles.button}
          textStyle={styles.outlineButtonText}
          icon={<Mail size={20} color={COLORS.primary} style={styles.buttonIcon} />}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
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
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.darkGray,
  },
  imageContainer: {
    height: 200,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 40,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    marginBottom: 16,
  },
  buttonText: {
    fontFamily: 'Poppins-Medium',
  },
  outlineButtonText: {
    fontFamily: 'Poppins-Medium',
  },
  buttonIcon: {
    marginRight: 8,
  },
  orText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.darkGray,
    marginVertical: 16,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
  },
});