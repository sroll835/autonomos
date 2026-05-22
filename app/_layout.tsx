import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Cormorant_500Medium, Cormorant_600SemiBold } from '@expo-google-fonts/cormorant';
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@/presentation/theme/ThemeProvider';
import '@/shared/i18n';

// Mantiene el splash visible hasta que las fuentes carguen
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 3, staleTime: 1000 * 60 * 5 },
    mutations: { retry: 1 },
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Inter — PUENTE temporal. TODO: borrar al CIERRE del grupo 3 del rework visual.
    // Cuando los 8 componentes compartidos (ui/* + layout/*) usen Cormorant/Montserrat,
    // los screens sin migrar caen a fuente de sistema — neutra, no rompe dark premium.
    // Verificación previa: `grep -r "Inter_" src/presentation/components/` debe dar 0.
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    // Cormorant — display/headings (luxury serif)
    Cormorant_500Medium,
    Cormorant_600SemiBold,
    // Montserrat — body/UI (sans-serif premium)
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          {/* contentStyle bg hex literal: root layout no consume useTheme (vive bajo ThemeProvider). Paint between route transitions antes de que mount el screen. Mantener sincronizado con darkTheme.colors.background */}
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0A0B' } }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="emergency/index" options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="service/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="tracking/[orderId]" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
            <Stack.Screen name="checkout" options={{ presentation: 'modal' }} />
            <Stack.Screen name="chat/[serviceId]" options={{ headerShown: false }} />
          </Stack>
          <Toast />
        </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
