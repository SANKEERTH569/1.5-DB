import React from 'react';
import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="new-registration" />
      <Stack.Screen name="user-details" />
      <Stack.Screen name="default-orders" />
      <Stack.Screen name="past-orders" />
      <Stack.Screen name="delivery" />
    </Stack>
  );
}