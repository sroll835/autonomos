import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/presentation/components/layout/SafeScreen';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { formatCOP, formatDate } from '@/shared/utils/formatters';
import { colors } from '@/presentation/theme/colors';
import { Order, OrderStatus } from '@/domain/entities/Order';
import apiClient from '@/infrastructure/api/client';
import { ENDPOINTS } from '@/infrastructure/api/endpoints';

const STATUS_CONFIG: Record<OrderStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; emoji: string }> = {
  PENDING:    { label: 'Pendiente',   variant: 'warning', emoji: '⏳' },
  CONFIRMED:  { label: 'Confirmado',  variant: 'info',    emoji: '✅' },
  PREPARING:  { label: 'Preparando',  variant: 'info',    emoji: '📦' },
  IN_TRANSIT: { label: 'En camino',   variant: 'info',    emoji: '🚚' },
  DELIVERED:  { label: 'Entregado',   variant: 'success', emoji: '🎉' },
  CANCELLED:  { label: 'Cancelado',   variant: 'danger',  emoji: '❌' },
};

export default function OrdersScreen() {
  const router = useRouter();
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.ORDERS.LIST);
      return data;
    },
  });

  return (
    <SafeScreen backgroundColor={colors.neutral[50]}>
      <Text style={styles.screenTitle}>Mis Pedidos</Text>
      {isLoading ? (
        <View style={{ padding: 16 }}>
          {[...Array(3)].map((_, i) => <Skeleton key={i} height={100} borderRadius={12} style={{ marginBottom: 12 }} />)}
        </View>
      ) : (
        <FlatList
          data={orders ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const statusCfg = STATUS_CONFIG[item.status];
            return (
              <Card onPress={() => router.push(`/tracking/${item.id}` as never)} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>Pedido #{item.id.slice(-6).toUpperCase()}</Text>
                  <Badge label={statusCfg.label} variant={statusCfg.variant} />
                </View>
                <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                <Text style={styles.orderItems}>{item.items.length} producto(s)</Text>
                <View style={styles.orderFooter}>
                  <Text style={styles.orderTotal}>{formatCOP(item.total)}</Text>
                  <Text style={styles.trackText}>{statusCfg.emoji} Ver detalle →</Text>
                </View>
              </Card>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyTitle}>Sin pedidos aún</Text>
              <Text style={styles.emptyText}>Tus pedidos del marketplace aparecerán aquí</Text>
              <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(tabs)/marketplace')}>
                <Text style={styles.shopBtnText}>Ir al marketplace</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  screenTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', color: colors.neutral[900], padding: 16, paddingBottom: 8 },
  list: { padding: 16, paddingTop: 8, paddingBottom: 100 },
  orderCard: { marginBottom: 12 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderId: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900] },
  orderDate: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.neutral[500], marginBottom: 4 },
  orderItems: { fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.neutral[600], marginBottom: 10 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTotal: { fontSize: 17, fontFamily: 'Inter_700Bold', color: colors.navy[500] },
  trackText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.primary[600] },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900], marginBottom: 6 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.neutral[500], textAlign: 'center', marginBottom: 20 },
  shopBtn: { backgroundColor: colors.primary[500], borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  shopBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: colors.navy[500] },
});
