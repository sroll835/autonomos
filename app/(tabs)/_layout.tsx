import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@/presentation/stores/authStore';
import { useCartStore } from '@/presentation/stores/cartStore';
import { colors } from '@/presentation/theme/colors';

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  index:       { active: '🏠', inactive: '🏡' },
  marketplace: { active: '🛒', inactive: '🛍' },
  services:    { active: '🔧', inactive: '⚙️' },
  orders:      { active: '📦', inactive: '📫' },
  profile:     { active: '👤', inactive: '👥' },
};

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const cartCount = useCartStore((s) => s.itemCount);

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.neutral[500],
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20 }}>
            {focused ? TAB_ICONS[route.name]?.active : TAB_ICONS[route.name]?.inactive}
          </Text>
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: 'Autopartes',
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: styles.badge,
        }}
      />
      <Tabs.Screen name="services" options={{ title: 'Servicios' }} />
      <Tabs.Screen name="orders" options={{ title: 'Pedidos' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.neutral[200],
    borderTopWidth: 0.5,
    height: 60,
    paddingBottom: 8,
    paddingTop: 4,
  },
  tabLabel: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  badge: { backgroundColor: colors.semantic.emergency, fontSize: 10 },
});
