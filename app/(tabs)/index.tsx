import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import {
  MapPin,
  Siren,
  ChevronRight,
  Cog,
  Wrench,
  Truck,
  HeartPulse,
  Package,
  HardHat,
  Tag,
} from 'lucide-react-native';
import { useAuthStore } from '@/presentation/stores/authStore';
import { useLocationStore } from '@/presentation/stores/locationStore';
import { SafeScreen } from '@/presentation/components/layout/SafeScreen';
import { Card } from '@/presentation/components/ui/Card';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { GradientText } from '@/presentation/components/ui/GradientText';
import { useTheme } from '@/presentation/theme/ThemeProvider';
import { typography } from '@/presentation/theme/tokens/typography';
import { spacing, radius } from '@/presentation/theme/tokens/spacing';

const { width } = Dimensions.get('window');
const GRID_GAP = spacing.md;
const GRID_HORIZONTAL = spacing.md * 2;
const SERVICE_CARD_SIZE = (width - GRID_HORIZONTAL - GRID_GAP * 2) / 3;

const SERVICE_GRID: Array<{ id: string; label: string; Icon: any; route: string }> = [
  { id: 'autoparts',  label: 'Autopartes',  Icon: Cog,        route: '/(tabs)/marketplace' },
  { id: 'mechanic',   label: 'Mecánico',    Icon: Wrench,     route: '/(tabs)/services' },
  { id: 'tow',        label: 'Grúa',        Icon: Truck,      route: '/(tabs)/services' },
  { id: 'ambulance',  label: 'Ambulancia',  Icon: HeartPulse, route: '/emergency' },
  { id: 'logistics',  label: 'Logística',   Icon: Package,    route: '/(tabs)/services' },
  { id: 'autonomous', label: 'Autónomos',   Icon: HardHat,    route: '/(tabs)/services' },
];

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuthStore();
  const { currentAddress, getCurrentLocation } = useLocationStore();

  useEffect(() => { getCurrentLocation(); }, []);

  const firstName = user?.name?.split(' ')[0] ?? 'Usuario';

  return (
    <SafeScreen scrollable>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[typography.h1, { color: theme.colors.textPrimary }]}>
            Hola,{'  '}
            <GradientText style={typography.h1}>{firstName}</GradientText>
          </Text>
          <View style={styles.locationRow}>
            <MapPin size={14} color={theme.colors.textSecondary} strokeWidth={1.5} />
            <Text
              style={[typography.caption, { color: theme.colors.textSecondary, marginLeft: spacing.xs }]}
              numberOfLines={1}
            >
              {currentAddress || 'Obteniendo ubicación...'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
          <Avatar uri={user?.avatar} name={user?.name} size={48} />
        </TouchableOpacity>
      </View>

      {/* SOS — única superficie con color emergency (jerarquía de seguridad) */}
      <Pressable
        onPress={() => router.push('/emergency')}
        style={({ pressed }) => [
          styles.sosButton,
          {
            backgroundColor: theme.colors.emergency,
            borderRadius: radius.lg,
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <Siren size={28} color={theme.colors.textPrimary} strokeWidth={2} />
        <View style={styles.sosTextBlock}>
          <Text style={[typography.overline, { color: theme.colors.textPrimary }]}>
            Emergencia SOS
          </Text>
          <Text style={[typography.caption, { color: 'rgba(237, 241, 250, 0.85)', marginTop: 2 }]}>
            Toca para llamar ayuda inmediata
          </Text>
        </View>
        <ChevronRight size={20} color={theme.colors.textPrimary} strokeWidth={2} />
      </Pressable>

      {/* Grid de servicios */}
      <Text style={[typography.h2, { color: theme.colors.textPrimary, marginBottom: spacing.lg }]}>
        ¿Qué{'  '}<GradientText style={typography.h2}>necesitas</GradientText>?
      </Text>
      <View style={styles.servicesGrid}>
        {SERVICE_GRID.map((service) => (
          <Pressable
            key={service.id}
            onPress={() => router.push(service.route as never)}
            style={({ pressed }) => [
              styles.serviceCard,
              {
                width: SERVICE_CARD_SIZE,
                backgroundColor: pressed ? theme.colors.surfaceRaised : theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: radius.lg,
              },
            ]}
          >
            <service.Icon size={28} color={theme.colors.chrome} strokeWidth={1.5} />
            <Text
              style={[
                typography.caption,
                { color: theme.colors.textPrimary, marginTop: spacing.sm, textAlign: 'center' },
              ]}
            >
              {service.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Banner de ofertas — Card highlighted con grad-soft */}
      <Text style={[typography.h2, { color: theme.colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.lg }]}>
        Ofertas del día
      </Text>
      <Card highlighted style={styles.offerBanner}>
        <View
          style={[
            styles.offerIconWrap,
            { backgroundColor: theme.colors.bg2, borderColor: theme.colors.chrome },
          ]}
        >
          <Tag size={20} color={theme.colors.chrome} strokeWidth={1.5} />
        </View>
        <View style={styles.offerContent}>
          <Text style={[typography.h3, { color: theme.colors.textPrimary }]}>
            Autopartes importadas
          </Text>
          <Text style={[typography.body, { color: theme.colors.textSecondary, marginTop: spacing.xs }]}>
            Hasta <GradientText style={[typography.body, { fontFamily: 'Manrope_600SemiBold' }]}>40%</GradientText> de descuento en repuestos
          </Text>
        </View>
        <ChevronRight size={18} color={theme.colors.textSecondary} strokeWidth={1.5} />
      </Card>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerLeft: { flex: 1, gap: spacing.xs },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  sosTextBlock: { flex: 1 },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  serviceCard: {
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    padding: spacing.sm,
  },
  offerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  offerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerContent: { flex: 1 },
});
