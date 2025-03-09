import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, KeyboardAvoidingView, ScrollView, Animated, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function PhoneLoginScreen() {
  const router = useRouter();
  const { signInWithPhone, isLoading } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const buttonOpacity = useState(new Animated.Value(1))[0];
  const progressWidth = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);
  
  // Animation values for number entry feedback
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;
  const securityNoteHeight = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Calculate progress based on phone number length (max 10 digits)
    const progress = Math.min(phoneNumber.length / 10, 1);
    
    Animated.timing(progressWidth, {
      toValue: progress,
      duration: 200,
      useNativeDriver: false,
    }).start();
    
    // Show checkmark when all 10 digits are entered
    if (phoneNumber.length === 10) {
      Animated.parallel([
        Animated.timing(checkmarkOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(securityNoteHeight, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        })
      ]).start();
    } else if (phoneNumber.length < 10 && checkmarkOpacity._value > 0) {
      Animated.parallel([
        Animated.timing(checkmarkOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(securityNoteHeight, {
          toValue: phoneNumber.length > 0 ? 0.5 : 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.spring(buttonScale, {
          toValue: 0.95,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        })
      ]).start();
    } else if (phoneNumber.length > 0) {
      Animated.timing(securityNoteHeight, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(securityNoteHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [phoneNumber]);

  const handleBack = () => {
    router.back();
  };

  const handleContinue = async () => {
    // Animate button press
    Animated.sequence([
      Animated.timing(buttonOpacity, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Basic validation
    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }

    if (phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit phone number');
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

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={[COLORS.primary + '15', COLORS.white]}
        style={styles.gradient}
      />
      
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={handleBack}
        activeOpacity={0.7}
      >
        <ArrowLeft size={24} color={COLORS.text} />
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <View style={styles.iconContainer}>
            <Phone size={28} color={COLORS.white} />
          </View>
          <Text style={styles.title}>Enter your phone number</Text>
          <Text style={styles.subtitle}>
            We'll send you a verification code to confirm your identity
          </Text>
        </View>

        <View style={styles.card}>
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={focusInput} 
            style={styles.inputWrapper}
          >
            <View style={styles.inputContainer}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>+91</Text>
              </View>
              <Input
                ref={inputRef}
                label="Phone Number"
                placeholder="Enter your 10-digit number"
                value={phoneNumber}
                onChangeText={(text) => {
                  // Only allow digits
                  const cleaned = text.replace(/[^0-9]/g, '');
                  setPhoneNumber(cleaned);
                  setError('');
                }}
                keyboardType="phone-pad"
                error={error}
                autoFocus
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={[styles.input, isFocused && styles.inputFocused]}
                maxLength={10}
              />
              
              <Animated.View 
                style={[
                  styles.checkmarkContainer, 
                  { opacity: checkmarkOpacity }
                ]}
              >
                <CheckCircle2 size={22} color={COLORS.success} />
              </Animated.View>
            </View>
            
            <View style={styles.progressContainer}>
              <Animated.View 
                style={[
                  styles.progressBar, 
                  { 
                    width: progressWidth.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    }),
                    backgroundColor: progressWidth.interpolate({
                      inputRange: [0, 0.3, 0.6, 1],
                      outputRange: [COLORS.lightGray, COLORS.primary + '80', COLORS.primary + 'CC', COLORS.success]
                    })
                  }
                ]}
              />
            </View>
          </TouchableOpacity>
          
          {Platform.OS === 'web' && (
            <div id="recaptcha-container" style={styles.recaptcha}></div>
          )}
          
          <Animated.View 
            style={[
              styles.securityNoteContainer,
              {
                height: securityNoteHeight.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 40, 40]
                }),
                opacity: securityNoteHeight,
                marginBottom: securityNoteHeight.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 16, 28]
                })
              }
            ]}
          >
            <View style={styles.securityNote}>
              <ShieldCheck size={16} color={COLORS.success} style={styles.securityIcon} />
              <Text style={styles.securityText}>
                {phoneNumber.length === 10 
                  ? "Your number is valid and ready to verify" 
                  : "Enter all 10 digits of your phone number"}
              </Text>
            </View>
          </Animated.View>

          <Animated.View style={{ 
            opacity: buttonOpacity,
            transform: [{ scale: buttonScale }]
          }}>
            <Button
              title={phoneNumber.length === 10 ? "Send Verification Code" : "Continue"}
              onPress={handleContinue}
              variant="primary"
              size="large"
              isLoading={isLoading}
              style={[
                styles.button, 
                phoneNumber.length < 10 && styles.buttonDisabled
              ]}
              disabled={phoneNumber.length < 10 || isLoading}
            />
          </Animated.View>
          
          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
        
        <View style={styles.helpContainer}>
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpText}>Need help?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 100,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '90%',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  inputWrapper: {
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    position: 'relative',
  },
  countryCode: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: COLORS.lightGray,
    borderRadius: 14,
    marginRight: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  countryCodeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.text,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    transition: 'all 0.3s ease',
    borderRadius: 14,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  checkmarkContainer: {
    position: 'absolute',
    right: 12,
    bottom: 20,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 2,
  },
  progressContainer: {
    height: 4,
    backgroundColor: COLORS.lightGray,
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  securityNoteContainer: {
    overflow: 'hidden',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success + '10',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: COLORS.success + '20',
  },
  securityIcon: {
    marginRight: 8,
  },
  securityText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: COLORS.success,
  },
  button: {
    width: '100%',
    borderRadius: 16,
    height: 58,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  termsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    fontFamily: 'Inter-Medium',
    color: COLORS.primary,
  },
  helpContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  helpButton: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 20,
    paddingHorizontal: 20,
  },
  helpText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  recaptcha: {
    marginBottom: 20,
    alignItems: 'center',
  },
});