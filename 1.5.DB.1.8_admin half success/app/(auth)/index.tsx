import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import Button from '@/components/common/Button';
import { Phone, Mail } from 'lucide-react-native';

const { width } = Dimensions.get('window');

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
        <Image source={require('../../assets/images/tathkart-logo.png')} style={styles.logo} />
        <Text style={styles.welcomeText}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Choose your login method</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Login as Customer"
          onPress={handlePhoneLogin}
          variant="primary"
          size="large"
          style={styles.button}
          textStyle={styles.buttonText}
          icon={<Phone size={24} color="white" style={styles.buttonIcon} />}
        />
        
        <View style={styles.orContainer}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>
        
        <Button
          title="Admin Login"
          onPress={handleEmailLogin}
          variant="outline"
          size="large"
          style={styles.buttonOutline}
          textStyle={styles.outlineButtonText}
          icon={<Mail size={24} color={COLORS.primary} style={styles.buttonIcon} />}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our{' '}
          <Text style={styles.linkText}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={styles.linkText}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 24,
  },
  welcomeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  button: {
    width: '100%',
    marginBottom: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  buttonOutline: {
    width: '100%',
    marginBottom: 24,
    borderColor: COLORS.primary,
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.white,
    fontSize: 18,
  },
  outlineButtonText: {
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.primary,
    fontSize: 18,
  },
  buttonIcon: {
    marginRight: 12,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  orText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.darkGray,
    marginHorizontal: 16,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 24,
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  linkText: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
    fontFamily: 'Inter-Medium',
  },
});