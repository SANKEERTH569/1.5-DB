import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '@/constants/Colors';
import Button from '@/components/common/Button';

export default function SplashScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash screen for 2 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && !showSplash) {
      // If user is already logged in, redirect to appropriate dashboard
      if (user) {
        switch (user.role) {
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
  }, [user, isLoading, router, showSplash]);

  const handleGetStarted = () => {
    router.push('/(auth)');
  };

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.splashContent}>
          <Image source={require('../assets/images/tathkart-logo.png')} style={styles.splashLogo} />
          <View style={styles.loadingIndicator}>
            <View style={styles.loadingBar} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/images/tathkart-logo.png')} style={styles.logo} />
        <Text style={styles.tagline}>Simplifying daily grocery deliveries</Text>
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome to Tathkart</Text>
          <Text style={styles.description}>
            The easiest way for hotels and restaurants to manage their daily grocery orders
          </Text>
          
          <View style={styles.locationContainer}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>KAKINADA</Text>
          </View>
          
          <Button
            title="Get Started"
            onPress={handleGetStarted}
            variant="primary"
            size="large"
            style={styles.button}
          />
          
          {user && (
            <Text style={styles.alreadySignedIn}>
              Already signed in as {user.role}
            </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 250, // Increased width
    height: 250, // Increased height
  },
  splashLogo: {
    width: 250, // Increased width
    height: 250, // Increased height
    marginBottom: 30,
  },
  tagline: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 4,
    textAlign: 'center',
  },
  contentContainer: {
    width: '100%',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 30,
    color: COLORS.text,
    marginBottom: 14,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 17,
    color: COLORS.darkGray,
    marginBottom: 20,
    lineHeight: 26,
    textAlign: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
  },
  locationIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  locationText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: COLORS.primary,
    letterSpacing: 1,
  },
  button: {
    width: '100%',
    borderRadius: 14,
    height: 56,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    alignItems: 'center',
  },
  loadingIndicator: {
    width: 200,
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  loadingBar: {
    width: '70%',
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
    position: 'absolute',
    left: 0,
    top: 0,
    animation: 'loading 1.5s infinite',
  },
  alreadySignedIn: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 16,
  },
});