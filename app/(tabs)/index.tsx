import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/presentation/stores/authStore';
import { useLocationStore } from '@/presentation/stores/locationStore';
import { SafeScreen } from '@/presentation/components/layout/SafeScreen';
import { Card } from '@/presentation/components/ui/Card';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { colors } from '@/presentation/theme/colors';

const { width } = Dimensions.get('window');

const SERVICE_GRID = [
  { id: 'autoparts', label: 'Autopartes', emoji: '🔩', route: '/(tabs)/marketplace', color: '#E8F0FE' },
  { id: 'mechanic', label: 'Mecánico', emoji: '🔧', route: '/(tabs)/services', color: '#E8F0FE' },
  { id: 'tow', label: 'Grúa', emoji: '🚛', route: '/(tabs)/services', color: '#FFF3E0' },
  { id: 'ambulance', label: 'Ambulancia', emoji: '🚑', route: '/emergency', color: '#FCE8E8' },
  { id: 'logistics', label: 'Logística', emoji: '📦', route: '/(tabs)/services', color: '#E8F5E9' },
  { id: 'autonomous', label: 'Autónomos', emoji: '👷', route: '/(tabs)/services', color: '#F3E5F5' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentAddress, getCurrentLocation } = useLocationStore();

  useEffect(() => { getCurrentLocation(); }, []);

  const firstName = user?.name?.split(' ')[0] ?? 'Usuario';

  return (
    <SafeScreen scrollable backgroundColor={colors.neutral[50]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Hola, {firstName} 👋</Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.location} numberOfLines={1}>{currentAddress || 'Obteniendo ubicación...'}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
          <Avatar uri={user?.avatar} name={user?.name} size={44} />
        </TouchableOpacity>
      </View>

      {/* Botón SOS */}
      <TouchableOpacity
        style={styles.sosButton}
        onPress={() => router.push('/emergency')}
        activeOpacity={0.85}
      >
        <Text style={styles.sosIcon}>🚨</Text>
        <View>
          <Text style={styles.sosTitle}>EMERGENCIA SOS</Text>
          <Text style={styles.sosSubtitle}>Toca para llamar ayuda inmediata</Text>
        </View>
        <Text style={styles.sosArrow}>→</Text>
      </TouchableOpacity>

      {/* Grid de servicios */}
      <Text style={styles.sectionTitle}>¿Qué necesitas?</Text>
      <View style={styles.servicesGrid}>
        {SERVICE_GRID.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[styles.serviceCard, { backgroundColor: service.color }]}
            onPress={() => router.push(service.route as never)}
            activeOpacity={0.8}
          >
            <Text style={styles.serviceEmoji}>{service.emoji}</Text>
            <Text style={styles.serviceLabel}>{service.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Banner de ofertas */}
      <Text style={styles.sectionTitle}>Ofertas del día</Text>
      <Card style={styles.offerBanner}>
        <Text style={styles.offerEmoji}>🎯</Text>
        <View style={styles.offerContent}>
          <Text style={styles.offerTitle}>Autopartes importadas</Text>
          <Text style={styles.offerDesc}>Hasta 40% de descuento en repuestos seleccionados</Text>
        </View>
      </Card>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 22, fontFamily: 'Inter_700Bold', color: colors.neutral[900], marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationIcon: { fontSize: 12, marginRight: 4 },
  location: { fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.neutral[500], flex: 1 },
  sosButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.semantic.emergency,
    borderRadius: 16, padding: 16, marginBottom: 24, gap: 12,
  },
  sosIcon: { fontSize: 28 },
  sosTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: colors.white },
  sosSubtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.85)' },
  sosArrow: { marginLeft: 'auto', fontSize: 18, color: colors.white },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: colors.neutral[900], marginBottom: 14 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  serviceCard: { width: (width - 56) / 3, aspectRatio: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center', padding: 8 },
  serviceEmoji: { fontSize: 28, marginBottom: 6 },
  serviceLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', color: colors.neutral[700], textAlign: 'center' },
  offerBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  offerEmoji: { fontSize: 32 },
  offerContent: { flex: 1 },
  offerTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900], marginBottom: 2 },
  offerDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.neutral[500] },
});
