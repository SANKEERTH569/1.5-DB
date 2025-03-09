import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, KeyboardAvoidingView, ScrollView, Animated, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import Button from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Phone, Lock, CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function PhoneLoginScreen() {
  const router = useRouter();
  const { signInWithPhone, isLoading } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const buttonOpacity = useState(new Animated.Value(1))[0];
  const progressWidth = useRef(new Animated.Value(0)).current;
  const phoneInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  
  // Animation values for number entry feedback
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;
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
        Animated.spring(buttonScale, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        })
      ]).start();
    } else if (phoneNumber.length < 10 && (checkmarkOpacity as any)._value > 0) {
      Animated.parallel([
        Animated.timing(checkmarkOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 0.95,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [phoneNumber]);

  const handleBack = () => {
    router.back();
  };

  const handleLogin = async () => {
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
    let isValid = true;

    if (!phoneNumber.trim()) {
      setPhoneError('Phone number is required');
      isValid = false;
    } else if (phoneNumber.length < 10) {
      setPhoneError('Please enter a valid 10-digit phone number');
      isValid = false;
    } else {
      setPhoneError('');
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (!isValid) return;

    // Format phone number to E.164 format for database consistency
    let formattedNumber = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      formattedNumber = `+91${phoneNumber}`; // Default to India code
    }

    try {
      const userData = await signInWithPhone(formattedNumber, password);
      
      // Route based on user role
      switch (userData.role) {
        case 'admin':
          router.replace('/(admin)');
          break;
        case 'delivery':
          router.replace('/(delivery)');
          break;
        case 'user':
          router.replace('/(user)');
          break;
        default:
          router.replace('/(auth)');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      
      if (errorMessage.includes('user-not-found') || errorMessage.includes('invalid-credential')) {
        setPhoneError('No account found with this phone number.');
      } else if (errorMessage.includes('wrong-password')) {
        setPasswordError('Incorrect password. Please try again.');
      } else {
        setPasswordError('Login failed: ' + errorMessage);
      }
      console.error(err);
    }
  };

  const focusPasswordInput = () => {
    passwordInputRef.current?.focus();
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
          <Text style={styles.title}>Login to your account</Text>
          <Text style={styles.subtitle}>
            Enter your phone number and password to access your account
          </Text>
        </View>

        <View style={styles.card}>
          {/* Phone Number Input */}
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => phoneInputRef.current?.focus()} 
            style={styles.inputWrapper}
          >
            <View style={styles.inputContainer}>
              <View style={styles.countryCode}>
                <Phone size={18} color={COLORS.darkGray} />
              </View>
              <TextInput
                ref={phoneInputRef}
                style={[
                  styles.input, 
                  isPhoneFocused && styles.inputFocused,
                  phoneError ? styles.inputError : null
                ]}
                placeholder="Enter your 10-digit number"
                value={phoneNumber}
                onChangeText={(text) => {
                  // Only allow digits
                  const cleaned = text.replace(/[^0-9]/g, '');
                  setPhoneNumber(cleaned);
                  setPhoneError('');
                }}
                keyboardType="phone-pad"
                autoFocus
                onFocus={() => setIsPhoneFocused(true)}
                onBlur={() => setIsPhoneFocused(false)}
                maxLength={10}
                returnKeyType="next"
                onSubmitEditing={focusPasswordInput}
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
            {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
          </TouchableOpacity>
          
          {/* Password Input */}
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => passwordInputRef.current?.focus()} 
            style={styles.inputWrapper}
          >
            <View style={styles.passwordContainer}>
              <View style={styles.passwordIconContainer}>
                <Lock size={20} color={COLORS.darkGray} />
              </View>
              <TextInput
                ref={passwordInputRef}
                style={[
                  styles.passwordInput, 
                  isPasswordFocused && styles.inputFocused,
                  passwordError ? styles.inputError : null
                ]}
                placeholder="Enter your password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError('');
                }}
                secureTextEntry
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Animated.View style={{ 
            opacity: buttonOpacity,
            transform: [{ scale: buttonScale }]
          }}>
            <Button
              title="Login"
              onPress={handleLogin}
              variant="primary"
              size="large"
              isLoading={isLoading}
              style={
                phoneNumber.length < 10 || !password
                  ? { ...styles.button, ...styles.buttonDisabled }
                  : styles.button
              }
              disabled={(phoneNumber.length < 10 || !password) || isLoading}
            />
          </Animated.View>
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
    marginBottom: 20,
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
  input: {
    flex: 1,
    height: 56,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.text,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
    marginLeft: 4,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    borderRadius: 14,
    height: 56,
    marginBottom: 8,
  },
  passwordIconContainer: {
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingRight: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.text,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.primary,
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
  }
});