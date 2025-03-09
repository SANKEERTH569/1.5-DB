import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '@/constants/Colors';
import Button from '@/components/common/Button';

export default function SplashScreen() {
  const router = useRouter();
  const { user, userRole, isLoading } = useAuth();
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
  }, [user, userRole, isLoading, router, showSplash]);

  const handleGetStarted = () => {
    router.push('/(auth)');
  };

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.splashContent}>
          <Text style={styles.splashLogoText}>THATKart</Text>
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
        <Text style={styles.logoText}>THATKart</Text>
        <Text style={styles.tagline}>Simplifying daily grocery deliveries</Text>
      </View>
      
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.overlay} />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome to THATKart</Text>
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
              Already signed in as {userRole}
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
  },
  logoContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  logoText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: COLORS.primary,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tagline: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 4,
  },
  imageContainer: {
    height: '65%',
    width: '100%',
    position: 'absolute',
    top: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backgroundGradient: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
    paddingBottom: 40,
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
    alignSelf: 'center',
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
  splashLogoText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 44,
    color: COLORS.primary,
    marginBottom: 30,
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