import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Home, ShoppingBag, Wrench, Package, User } from 'lucide-react-native';
import { useAuthStore } from '@/presentation/stores/authStore';
import { useCartStore } from '@/presentation/stores/cartStore';
import { useTheme } from '@/presentation/theme/ThemeProvider';

const TAB_ICONS: Record<string, any> = {
  index:       Home,
  marketplace: ShoppingBag,
  services:    Wrench,
  orders:      Package,
  profile:     User,
};

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const cartCount = useCartStore((s) => s.itemCount);
  const theme = useTheme();

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.chrome,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.bg2 + 'D9',
          borderTopColor: theme.colors.borderSubtle,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 6,
          position: 'absolute',
        },
        tabBarBackground: () => (
          <BlurView
            intensity={Platform.OS === 'ios' ? 40 : 80}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarLabelStyle: { fontSize: 11, fontFamily: 'Manrope_500Medium', letterSpacing: 0.2 },
        tabBarIcon: ({ focused, color }) => {
          const Icon = TAB_ICONS[route.name];
          if (!Icon) return null;
          return <Icon size={22} color={color} strokeWidth={focused ? 2 : 1.5} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: 'Autopartes',
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: theme.colors.emergency,
            color: theme.colors.textPrimary,
            fontSize: 10,
            fontFamily: 'Manrope_600SemiBold',
          },
        }}
      />
      <Tabs.Screen name="services" options={{ title: 'Servicios' }} />
      <Tabs.Screen name="orders" options={{ title: 'Pedidos' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
