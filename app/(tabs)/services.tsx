import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/presentation/components/layout/SafeScreen';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { useLocationStore } from '@/presentation/stores/locationStore';
import { formatDistance } from '@/shared/utils/formatters';
import { colors } from '@/presentation/theme/colors';
import { Provider, ServiceType } from '@/domain/entities/Provider';
import { container } from '@/di/container';

const SERVICE_TABS: { type: ServiceType; label: string; emoji: string }[] = [
  { type: 'MECANICO',   label: 'Mecánicos',  emoji: '🔧' },
  { type: 'GRUA',       label: 'Grúas',      emoji: '🚛' },
  { type: 'AMBULANCIA', label: 'Ambulancias',emoji: '🚑' },
  { type: 'LOGISTICA',  label: 'Logística',  emoji: '📦' },
];

function ProviderCard({ provider, onPress }: { provider: Provider; onPress: () => void }) {
  return (
    <Card onPress={onPress} style={styles.providerCard}>
      <View style={styles.providerHeader}>
        <Avatar uri={provider.avatar} name={provider.name} size={52} />
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{provider.name}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.ratingText}>{provider.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({provider.reviewCount} reseñas)</Text>
          </View>
          {provider.distance !== undefined && (
            <Text style={styles.distance}>📍 {formatDistance(provider.distance)}</Text>
          )}
        </View>
        <Badge
          label={provider.isAvailable ? 'Disponible' : 'Ocupado'}
          variant={provider.isAvailable ? 'success' : 'warning'}
        />
      </View>
      {provider.certifications.length > 0 && (
        <View style={styles.certs}>
          {provider.certifications.slice(0, 3).map((cert) => (
            <View key={cert} style={styles.certTag}>
              <Text style={styles.certText}>{cert}</Text>
            </View>
          ))}
        </View>
      )}
      <TouchableOpacity
        style={[styles.requestBtn, !provider.isAvailable && styles.requestBtnDisabled]}
        disabled={!provider.isAvailable}
        onPress={onPress}
      >
        <Text style={styles.requestBtnText}>
          {provider.isAvailable ? 'Solicitar servicio' : 'No disponible'}
        </Text>
      </TouchableOpacity>
    </Card>
  );
}

export default function ServicesScreen() {
  const router = useRouter();
  const { currentLocation, getCurrentLocation } = useLocationStore();
  const [activeTab, setActiveTab] = useState<ServiceType>('MECANICO');

  useEffect(() => { getCurrentLocation(); }, []);

  const { data: providers, isLoading } = useQuery<Provider[]>({
    queryKey: ['providers', activeTab, currentLocation],
    queryFn: () => container.repos.service.getNearbyProviders(currentLocation!, activeTab),
    enabled: !!currentLocation,
  });

  return (
    <SafeScreen backgroundColor={colors.neutral[50]}>
      {/* Tabs de tipo de servicio */}
      <View style={styles.tabs}>
        {SERVICE_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.type}
            style={[styles.tab, activeTab === tab.type && styles.tabActive]}
            onPress={() => setActiveTab(tab.type)}
          >
            <Text style={styles.tabEmoji}>{tab.emoji}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.type && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de proveedores */}
      {isLoading ? (
        <View style={styles.skeletons}>
          {[...Array(3)].map((_, i) => <Skeleton key={i} height={130} borderRadius={12} style={{ marginBottom: 12 }} />)}
        </View>
      ) : (
        <FlatList
          data={providers ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProviderCard
              provider={item}
              onPress={() => router.push(`/service/${item.id}` as never)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>Sin proveedores cercanos</Text>
              <Text style={styles.emptyText}>No hay {activeTab.toLowerCase()}s disponibles en tu zona ahora mismo.</Text>
            </View>
          }
        />
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, gap: 8 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: colors.neutral[100] },
  tabActive: { backgroundColor: colors.navy[500] },
  tabEmoji: { fontSize: 18, marginBottom: 2 },
  tabLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', color: colors.neutral[500] },
  tabLabelActive: { color: colors.white },
  skeletons: { padding: 16 },
  listContent: { padding: 16, paddingBottom: 100 },
  providerCard: { marginBottom: 12 },
  providerHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  providerInfo: { flex: 1 },
  providerName: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900], marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  star: { fontSize: 13 },
  ratingText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: colors.neutral[800] },
  reviewCount: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.neutral[500] },
  distance: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.neutral[500], marginTop: 2 },
  certs: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  certTag: { backgroundColor: colors.neutral[100], borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  certText: { fontSize: 11, fontFamily: 'Inter_400Regular', color: colors.neutral[600] },
  requestBtn: { backgroundColor: colors.primary[500], borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  requestBtnDisabled: { backgroundColor: colors.neutral[200] },
  requestBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: colors.navy[500] },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900], marginBottom: 6 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.neutral[500], textAlign: 'center', lineHeight: 20 },
});
