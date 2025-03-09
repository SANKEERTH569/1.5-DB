import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, KeyboardAvoidingView, ScrollView, Animated, TextInput, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Phone, Lock, CheckCircle2, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function PhoneLoginScreen() {
  const router = useRouter();
  const { signInWithPhone, createAccount, isLoading, fetchUserData, setUser } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const buttonOpacity = useState(new Animated.Value(1))[0];
  const progressWidth = useRef(new Animated.Value(0)).current;
  const phoneInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const nameInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  
  // Animation values for number entry feedback
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.95)).current;

  // Add a new state for confirm password
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);

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

  const toggleMode = () => {
    // Clear all fields and errors when switching modes
    setPhoneNumber('');
    setPassword('');
    setName('');
    setPhoneError('');
    setPasswordError('');
    setNameError('');
    setConfirmPassword('');
    setConfirmPasswordError('');
    setIsCreateMode(!isCreateMode);
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
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (isCreateMode && !name.trim()) {
      setNameError('Name is required');
      isValid = false;
    } else {
      setNameError('');
    }

    if (isCreateMode && password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    if (!isValid) return;

    // Format phone number to E.164 format for database consistency
    let formattedNumber = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      formattedNumber = `+91${phoneNumber}`; // Default to India code
    }
    
    // Create a clean version without special characters for email generation
    const cleanPhoneNumber = formattedNumber.replace(/[^0-9]/g, '');

    try {
      if (isCreateMode) {
        await createAccount(name, formattedNumber, password);
        // After creating account, fetch and set user data
        const userData = await fetchUserData(formattedNumber);
        setUser(userData);
        alert('Account created successfully! Welcome to the app.');
        router.replace('/');
      } else {
        // Login flow
        await signInWithPhone(formattedNumber, password);
        // Fetch user data after successful login
        const userData = await fetchUserData(formattedNumber);
        if (!userData) {
          throw new Error('User data not found');
        }
        // Set user data in context
        setUser(userData);
        router.replace('/');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      
      if (isCreateMode) {
        // Check for specific error types
        if (errorMessage.includes('email-already-in-use') || errorMessage.includes('already registered')) {
          setPhoneError('This phone number is already registered. Please login instead.');
        } else if (errorMessage.includes('weak-password')) {
          setPasswordError('Password is too weak. Please use a stronger password.');
        } else {
          setPhoneError('Failed to create account: ' + errorMessage);
        }
      } else {
        // Login errors
        if (errorMessage.includes('user-not-found') || errorMessage.includes('invalid-credential')) {
          setPhoneError('No account found with this phone number.');
        } else if (errorMessage.includes('wrong-password')) {
          setPasswordError('Incorrect password. Please try again.');
        } else {
          setPasswordError('Login failed: ' + errorMessage);
        }
      }
      console.error(err);
    }
  };

  const focusPhoneInput = () => {
    phoneInputRef.current?.focus();
  };

  const focusPasswordInput = () => {
    passwordInputRef.current?.focus();
  };

  const focusNameInput = () => {
    nameInputRef.current?.focus();
  };

  const focusConfirmPasswordInput = () => {
    confirmPasswordInputRef.current?.focus();
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
          <Text style={styles.title}>
            {isCreateMode ? 'Create a new account' : 'Login to your account'}
          </Text>
          <Text style={styles.subtitle}>
            {isCreateMode 
              ? 'Enter your details to create a new account' 
              : 'Enter your phone number and password to access your account'
            }
          </Text>
        </View>

        <View style={styles.card}>
          {/* Mode Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleButton, !isCreateMode && styles.toggleButtonActive]} 
              onPress={() => setIsCreateMode(false)}
            >
              <Text style={[styles.toggleText, !isCreateMode && styles.toggleTextActive]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleButton, isCreateMode && styles.toggleButtonActive]} 
              onPress={() => setIsCreateMode(true)}
            >
              <Text style={[styles.toggleText, isCreateMode && styles.toggleTextActive]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Name Input (only in create mode) */}
          {isCreateMode && (
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={focusNameInput} 
              style={styles.inputWrapper}
            >
              <View style={styles.passwordContainer}>
                <View style={styles.passwordIconContainer}>
                  <User size={20} color={COLORS.darkGray} />
                </View>
                <TextInput
                  ref={nameInputRef}
                  style={[
                    styles.passwordInput, 
                    isNameFocused && styles.inputFocused,
                    nameError ? styles.inputError : null
                  ]}
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    setNameError('');
                  }}
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setIsNameFocused(false)}
                />
              </View>
              {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
            </TouchableOpacity>
          )}

          {/* Phone Number Input */}
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={focusPhoneInput} 
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
            onPress={focusPasswordInput} 
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
                placeholder={isCreateMode ? "Create a password" : "Enter your password"}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError('');
                }}
                secureTextEntry
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
              />
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </TouchableOpacity>
          
          {/* Confirm Password Input (only in create mode) */}
          {isCreateMode && (
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={focusConfirmPasswordInput} 
              style={styles.inputWrapper}
            >
              <View style={styles.passwordContainer}>
                <View style={styles.passwordIconContainer}>
                  <Lock size={20} color={COLORS.darkGray} />
                </View>
                <TextInput
                  ref={confirmPasswordInputRef}
                  style={[
                    styles.passwordInput, 
                    isConfirmPasswordFocused && styles.inputFocused,
                    confirmPasswordError ? styles.inputError : null
                  ]}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setConfirmPasswordError('');
                  }}
                  secureTextEntry
                  onFocus={() => setIsConfirmPasswordFocused(true)}
                  onBlur={() => setIsConfirmPasswordFocused(false)}
                />
              </View>
              {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
            </TouchableOpacity>
          )}

          {!isCreateMode && (
            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <Animated.View style={{ 
            opacity: buttonOpacity,
            transform: [{ scale: buttonScale }]
          }}>
            <Button
              title={isCreateMode ? "Create Account" : "Login"}
              onPress={handleContinue}
              variant="primary"
              size="large"
              isLoading={isLoading}
              style={
                phoneNumber.length < 10 || !password || (isCreateMode && (!name || !confirmPassword))
                  ? { ...styles.button, ...styles.buttonDisabled }
                  : styles.button
              }
              disabled={(phoneNumber.length < 10 || !password || (isCreateMode && (!name || !confirmPassword))) || isLoading}
            />
          </Animated.View>
          
          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
        
        <View style={styles.createAccountContainer}>
          <Text style={styles.createAccountText}>
            {isCreateMode ? "Already have an account?" : "Don't have an account?"}{' '}
            <Text 
              style={styles.createAccountLink}
              onPress={toggleMode}
            >
              {isCreateMode ? "Login" : "Create Account"}
            </Text>
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
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray + '50',
    borderRadius: 12,
    marginBottom: 24,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  toggleTextActive: {
    color: COLORS.primary,
    fontFamily: 'Inter-SemiBold',
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
  countryCodeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.text,
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
  createAccountContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  createAccountText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  createAccountLink: {
    fontFamily: 'Inter-SemiBold',
    color: COLORS.primary,
  },
});