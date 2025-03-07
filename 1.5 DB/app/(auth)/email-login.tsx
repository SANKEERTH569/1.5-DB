import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft } from 'lucide-react-native';

export default function EmailLoginScreen() {
  const router = useRouter();
  const { signInWithEmail, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });

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
    return isValid;
  };

  const handleLogin = async () => {
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
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <ArrowLeft size={24} color={COLORS.text} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Login with Email</Text>
        <Text style={styles.subtitle}>
          Enter your email and password to continue
        </Text>

        <View style={styles.formContainer}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors({ ...errors, email: '' });
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors({ ...errors, password: '' });
            }}
            secureTextEntry
            error={errors.password}
          />
          
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Login"
          onPress={handleLogin}
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
  formContainer: {
    marginBottom: 24,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.primary,
  },
  button: {
    width: '100%',
  },
});