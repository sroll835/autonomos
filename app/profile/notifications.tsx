import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/presentation/components/ui/Card';
import { colors } from '@/presentation/theme/colors';
import apiClient from '@/infrastructure/api/client';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'ORDER' | 'SERVICE' | 'EMERGENCY' | 'PROMO' | 'SYSTEM';
  read: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  ORDER: '📦', SERVICE: '🔧', EMERGENCY: '🆘', PROMO: '🎉', SYSTEM: 'ℹ️',
};

function formatRelative(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours}h`;
  return `Hace ${Math.floor(hours / 24)}d`;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const qc = useQueryClient();

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await apiClient.get('/notifications');
      return data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => apiClient.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = async () => {
    await apiClient.patch('/notifications/read-all');
    qc.invalidateQueries({ queryKey: ['notifications'] });
  };

  const unreadCount = (notifications ?? []).filter((n) => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          Notificaciones {unreadCount > 0 && <Text style={styles.badge}> {unreadCount} </Text>}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAll}>Marcar todo leído</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary[500]} />
      ) : (
        <FlatList
          data={notifications ?? []}
          keyExtractor={(n) => n.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => !item.read && markReadMutation.mutate(item.id)} activeOpacity={0.8}>
              <Card style={[styles.notifCard, !item.read && styles.unreadCard]}>
                <View style={styles.notifRow}>
                  <Text style={styles.notifIcon}>{TYPE_ICONS[item.type]}</Text>
                  <View style={styles.notifContent}>
                    <Text style={[styles.notifTitle, !item.read && styles.boldTitle]}>{item.title}</Text>
                    <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
                    <Text style={styles.notifTime}>{formatRelative(item.createdAt)}</Text>
                  </View>
                  {!item.read && <View style={styles.unreadDot} />}
                </View>
              </Card>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔔</Text>
              <Text style={styles.emptyTitle}>Sin notificaciones</Text>
              <Text style={styles.emptyText}>Las actualizaciones de tus pedidos y servicios aparecerán aquí</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.white, borderBottomWidth: 0.5, borderBottomColor: colors.neutral[200] },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.neutral[100], alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  backIcon: { fontSize: 18, color: colors.navy[500] },
  title: { flex: 1, fontSize: 17, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900] },
  badge: { fontSize: 12, fontFamily: 'Inter_700Bold', color: colors.semantic.emergency, backgroundColor: '#FEE2E2', borderRadius: 10, paddingHorizontal: 6 },
  markAll: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.semantic.info },
  list: { padding: 16, gap: 8, paddingBottom: 40 },
  notifCard: { padding: 14 },
  unreadCard: { borderLeftWidth: 3, borderLeftColor: colors.primary[500] },
  notifRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  notifIcon: { fontSize: 24, marginTop: 2 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontFamily: 'Inter_500Medium', color: colors.neutral[900], marginBottom: 3 },
  boldTitle: { fontFamily: 'Inter_700Bold' },
  notifBody: { fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.neutral[600], lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 11, fontFamily: 'Inter_400Regular', color: colors.neutral[400] },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary[500], marginTop: 6 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900], marginBottom: 6 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.neutral[500], textAlign: 'center', lineHeight: 20 },
});
