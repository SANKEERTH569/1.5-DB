import React, { useContext, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import AuthContext, { useAuth } from '@/context/AuthContext';

export default function DeliveryLayout() {
  const router = useRouter();
  const { user, userRole, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user || userRole !== 'delivery') {
        router.replace('/(auth)/login');
      }
    }
  }, [user, userRole, isLoading, router]);

  if (isLoading) {
    return <Stack screenOptions={{ headerShown: false }} />; // Render nothing while loading
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}