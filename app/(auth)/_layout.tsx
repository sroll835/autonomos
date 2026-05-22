import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/presentation/stores/authStore';

/** Layout de autenticación — redirige al home si ya hay sesión */
export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Redirect href="/(tabs)" />;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0A0B' } }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
