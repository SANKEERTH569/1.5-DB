import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import Button from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft } from 'lucide-react-native';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { confirmPhoneCode, isLoading } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
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

  const handleBack = () => {
    router.back();
  };

  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[0];
    }
    
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setError('');

    // Auto focus next input
    if (text !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
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
    }
  };

  const handleResend = () => {
    // Reset timer
    setTimer(60);
    // Resend OTP logic would go here
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <ArrowLeft size={24} color={COLORS.text} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Verification Code</Text>
        <Text style={styles.subtitle}>
          We've sent a verification code to your phone number
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={styles.otpInput}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              autoFocus={index === 0}
            />
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          title="Verify"
          onPress={handleVerify}
          variant="primary"
          size="large"
          isLoading={isLoading}
          style={styles.button}
        />

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            Didn't receive the code?{' '}
          </Text>
          {timer > 0 ? (
            <Text style={styles.timerText}>Resend in {timer}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendButton}>Resend</Text>
            </TouchableOpacity>
          )}
        </View>
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Inter-Medium',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.error,
    marginBottom: 16,
  },
  button: {
    width: '100%',
    marginBottom: 24,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  timerText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.gray,
  },
  resendButton: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.primary,
  },
});