import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Animated,
  TextInput,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function EmailLoginScreen() {
  const router = useRouter();
  const { signInWithEmail, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  // Animation values
  const buttonScale = useRef(new Animated.Value(1)).current;
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  
  // Refs for input fields
  const passwordInputRef = useRef<TextInput>(null);

  const handleBack = () => {
    router.back();
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    
    if (!isValid) {
      // Shake animation for error
      Animated.sequence([
        Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
      ]).start();
    }
    
    return isValid;
  };

  const handleLogin = async () => {
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

    try {
      await signInWithEmail(email, password);
      
      // Redirect based on hardcoded credentials for demo
      if (email === 'shanmukvarada@gmail.com') {
        if (password === '123456admin') {
          router.replace('/(admin)');
        } else if (password === '123456boy') {
          router.replace('/(delivery)');
        }
      }
    } catch (err) {
      setErrors({
        ...errors,
        password: 'Invalid email or password',
      });
      console.error(err);
      
      // Shake animation for error
      Animated.sequence([
        Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
      ]).start();
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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <LinearGradient
        colors={[COLORS.primary + '10', COLORS.white]}
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
            <Mail size={28} color={COLORS.white} />
          </View>
          <Text style={styles.title}>Login with Email</Text>
          <Text style={styles.subtitle}>
            Enter your email and password to continue
          </Text>
        </View>

        <Animated.View 
          style={[
            styles.card,
            { transform: [{ translateX: shakeAnimation }] }
          ]}
        >
          <View style={styles.formContainer}>
            <View style={[
              styles.inputWrapper,
              emailFocused && styles.inputWrapperFocused,
              errors.email ? styles.inputWrapperError : null
            ]}>
              <View style={styles.inputIconContainer}>
                <Mail size={20} color={emailFocused ? COLORS.primary : COLORS.darkGray} />
              </View>
              <Input
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrors({ ...errors, email: '' });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                error=""
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                style={styles.input}
                returnKeyType="next"
                onSubmitEditing={focusPasswordInput}
              />
            </View>
            
            {errors.email ? (
              <View style={styles.errorContainer}>
                <AlertCircle size={14} color={COLORS.error} style={styles.errorIcon} />
                <Text style={styles.errorText}>{errors.email}</Text>
              </View>
            ) : null}
            
            <View style={[
              styles.inputWrapper,
              passwordFocused && styles.inputWrapperFocused,
              errors.password ? styles.inputWrapperError : null
            ]}>
              <View style={styles.inputIconContainer}>
                <Lock size={20} color={passwordFocused ? COLORS.primary : COLORS.darkGray} />
              </View>
              <Input
                ref={passwordInputRef}
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors({ ...errors, password: '' });
                }}
                secureTextEntry={!showPassword}
                error=""
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                style={styles.input}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                {showPassword ? (
                  <EyeOff size={20} color={COLORS.darkGray} />
                ) : (
                  <Eye size={20} color={COLORS.darkGray} />
                )}
              </TouchableOpacity>
            </View>
            
            {errors.password ? (
              <View style={styles.errorContainer}>
                <AlertCircle size={14} color={COLORS.error} style={styles.errorIcon} />
                <Text style={styles.errorText}>{errors.password}</Text>
              </View>
            ) : null}
            
            <TouchableOpacity 
              style={styles.forgotPassword}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Button
              title="Login"
              onPress={handleLogin}
              variant="primary"
              size="large"
              isLoading={isLoading}
              style={styles.button}
            />
          </Animated.View>
          
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>
          
          <TouchableOpacity 
            style={styles.phoneLoginButton}
            onPress={() => router.push('/(auth)/phone-login')}
            activeOpacity={0.7}
          >
            <Text style={styles.phoneLoginText}>Login with Phone Number</Text>
          </TouchableOpacity>
        </Animated.View>
        
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            Don't have an account? Contact your administrator
          </Text>
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
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  formContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: COLORS.lightGray + '20',
    overflow: 'hidden',
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + '05',
  },
  inputIconContainer: {
    padding: 12,
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: COLORS.text,
  },
  eyeButton: {
    padding: 12,
    paddingRight: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -8,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  errorIcon: {
    marginRight: 6,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.error,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 8,
  },
  forgotPasswordText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.primary,
  },
  button: {
    width: '100%',
    borderRadius: 14,
    height: 56,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  dividerText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
    marginHorizontal: 16,
  },
  phoneLoginButton: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  phoneLoginText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.primary,
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
});