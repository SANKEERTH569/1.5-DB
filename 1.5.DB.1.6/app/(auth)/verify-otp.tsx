import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import Button from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Shield, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { confirmPhoneCode, isLoading, phoneNumber } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [isComplete, setIsComplete] = useState(false);
  
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const animatedValues = useRef(otp.map(() => new Animated.Value(0))).current;
  const buttonScale = useRef(new Animated.Value(0.95)).current;
  const timerProgress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start timer animation
    Animated.timing(timerProgress, {
      toValue: 0,
      duration: 60000,
      useNativeDriver: false,
    }).start();
    
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check if OTP is complete
    const isOtpComplete = otp.every(digit => digit !== '');
    setIsComplete(isOtpComplete);
    
    if (isOtpComplete) {
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(buttonScale, {
        toValue: 0.95,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [otp]);

  const handleBack = () => {
    router.back();
  };

  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) {
      // Handle paste of full OTP
      if (text.length === 6 && /^\d+$/.test(text)) {
        const digits = text.split('');
        setOtp(digits);
        setError('');
        
        // Animate all inputs
        digits.forEach((_, i) => {
          animateInput(i);
        });
        
        return;
      }
      text = text[0];
    }
    
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setError('');

    // Animate the input
    if (text !== '') {
      animateInput(index);
    }

    // Auto focus next input
    if (text !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const animateInput = (index: number) => {
    Animated.sequence([
      Animated.timing(animatedValues[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues[index], {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      await confirmPhoneCode(otpCode);
      router.replace('/(user)');
    } catch (err) {
      setError('Invalid verification code. Please try again.');
      console.error(err);
      
      // Shake animation for error
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.97,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleResend = () => {
    // Reset timer
    setTimer(60);
    
    // Reset timer animation
    timerProgress.setValue(1);
    Animated.timing(timerProgress, {
      toValue: 0,
      duration: 60000,
      useNativeDriver: false,
    }).start();
    
    // Resend OTP logic would go here
  };

  const formatPhoneNumber = (phone: string = '') => {
    if (!phone) return '';
    
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as XXX-XXX-XXXX or return original if not enough digits
    if (cleaned.length >= 10) {
      return `+91 ${cleaned.slice(-10, -7)}-${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`;
    }
    
    return phone;
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
            <Shield size={28} color={COLORS.white} />
          </View>
          <Text style={styles.title}>Verification Code</Text>
          <Text style={styles.subtitle}>
            We've sent a verification code to
          </Text>
          <Text style={styles.phoneNumber}>
            {formatPhoneNumber(phoneNumber)}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <Animated.View 
                key={index}
                style={[
                  styles.otpInputWrapper,
                  {
                    transform: [
                      { 
                        scale: animatedValues[index].interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [1, 1.1, 1]
                        })
                      }
                    ]
                  }
                ]}
              >
                <TextInput
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.otpInput,
                    digit ? styles.otpInputFilled : {},
                    error ? styles.otpInputError : {}
                  ]}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  autoFocus={index === 0}
                  selectionColor={COLORS.primary}
                />
              </Animated.View>
            ))}
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Animated.View style={{ 
            transform: [{ scale: buttonScale }],
            opacity: isComplete ? 1 : 0.7
          }}>
            <Button
              title="Verify & Continue"
              onPress={handleVerify}
              variant="primary"
              size="large"
              isLoading={isLoading}
              style={styles.button}
              disabled={!isComplete || isLoading}
            />
          </Animated.View>

          <View style={styles.timerContainer}>
            <View style={styles.timerProgressContainer}>
              <Animated.View 
                style={[
                  styles.timerProgressBar,
                  {
                    width: timerProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }
                ]}
              />
            </View>
            
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                Didn't receive the code?{' '}
              </Text>
              {timer > 0 ? (
                <Text style={styles.timerText}>Resend in {timer}s</Text>
              ) : (
                <TouchableOpacity 
                  onPress={handleResend}
                  style={styles.resendButtonContainer}
                  activeOpacity={0.7}
                >
                  <RefreshCw size={14} color={COLORS.primary} style={styles.resendIcon} />
                  <Text style={styles.resendButton}>Resend Code</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
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
  },
  phoneNumber: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.text,
    marginTop: 4,
    textAlign: 'center',
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  otpInputWrapper: {
    width: 50,
    height: 60,
  },
  otpInput: {
    width: '100%',
    height: '100%',
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    borderRadius: 14,
    textAlign: 'center',
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.text,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  otpInputError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + '05',
  },
  errorContainer: {
    backgroundColor: COLORS.error + '10',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.error + '20',
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    borderRadius: 16,
    height: 58,
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerProgressContainer: {
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  timerProgressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  timerText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.gray,
  },
  resendButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  resendIcon: {
    marginRight: 6,
  },
  resendButton: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: COLORS.primary,
  },
});