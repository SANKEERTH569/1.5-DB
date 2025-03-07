import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="phone-login" />
      <Stack.Screen name="email-login" />
      <Stack.Screen name="verify-otp" />
    </Stack>
  );
}