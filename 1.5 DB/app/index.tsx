import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '@/constants/Colors';
import Button from '@/components/common/Button';

export default function SplashScreen() {
  const router = useRouter();
  const { user, userRole, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // If user is already logged in, redirect to appropriate dashboard
      if (user) {
        switch (userRole) {
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
            // If role is not set, go to auth
            router.replace('/(auth)');
        }
      }
    }
  }, [user, userRole, isLoading, router]);

  const handleGetStarted = () => {
    router.push('/(auth)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>THATKart</Text>
        <Text style={styles.tagline}>Simplifying daily grocery deliveries</Text>
      </View>
      
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Welcome to THATKart</Text>
        <Text style={styles.description}>
          The easiest way for hotels and restaurants to manage their daily grocery orders
        </Text>
        
        <Button
          title="Get Started"
          onPress={handleGetStarted}
          variant="primary"
          size="large"
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
  },
  logoContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: COLORS.primary,
  },
  tagline: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 4,
  },
  imageContainer: {
    height: '40%',
    width: '100%',
    marginTop: 30,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: COLORS.text,
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    width: '100%',
  },
});