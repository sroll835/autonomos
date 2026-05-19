import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useQuery } from '@tanstack/react-query';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Badge } from '@/presentation/components/ui/Badge';
import { colors } from '@/presentation/theme/colors';
import { formatETA } from '@/shared/utils/formatters';
import { Order } from '@/domain/entities/Order';
import { Coordinates } from '@/domain/entities/User';
import apiClient from '@/infrastructure/api/client';
import { ENDPOINTS } from '@/infrastructure/api/endpoints';
import { getSocket, SOCKET_EVENTS } from '@/infrastructure/socket/socketClient';

const { height } = Dimensions.get('window');

export default function TrackingScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [providerLocation, setProviderLocation] = useState<Coordinates | null>(null);
  const [eta, setEta] = useState<number | null>(null);

  const { data: order } = useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.ORDERS.TRACK(orderId));
      return data;
    },
    refetchInterval: 30000,
  });

  // Suscripción a actualizaciones en tiempo real
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit('track:join', { orderId });
    socket.on(SOCKET_EVENTS.ORDER_LOCATION_UPDATE, (data: { location: Coordinates; eta: number }) => {
      setProviderLocation(data.location);
      setEta(data.eta);
    });

    return () => {
      socket.emit('track:leave', { orderId });
      socket.off(SOCKET_EVENTS.ORDER_LOCATION_UPDATE);
    };
  }, [orderId]);

  const deliveryLocation = order?.deliveryLocation;
  const mapRegion = providerLocation ?? deliveryLocation ?? { latitude: 4.7110, longitude: -74.0721 };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seguimiento</Text>
        {order && <Badge label={order.status} variant="info" />}
      </View>

      {/* Mapa fullscreen */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={{
          latitude: (mapRegion as Coordinates).latitude,
          longitude: (mapRegion as Coordinates).longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {providerLocation && (
          <Marker coordinate={providerLocation} title="Proveedor">
            <View style={styles.providerMarker}>
              <Text style={styles.providerMarkerEmoji}>🚚</Text>
            </View>
          </Marker>
        )}
        {deliveryLocation && (
          <Marker coordinate={deliveryLocation} title="Destino">
            <View style={styles.destMarker}>
              <Text style={styles.destMarkerEmoji}>📍</Text>
            </View>
          </Marker>
        )}
        {providerLocation && deliveryLocation && (
          <Polyline
            coordinates={[providerLocation, deliveryLocation]}
            strokeColor={colors.primary[500]}
            strokeWidth={3}
            lineDashPattern={[8, 4]}
          />
        )}
      </MapView>

      {/* Panel inferior */}
      <View style={styles.panel}>
        {eta && (
          <View style={styles.etaRow}>
            <Text style={styles.etaEmoji}>⏱</Text>
            <Text style={styles.etaText}>Llega en {formatETA(eta)}</Text>
          </View>
        )}
        <View style={styles.providerRow}>
          <Avatar size={44} />
          <View style={styles.providerMeta}>
            <Text style={styles.providerName}>Conductor asignado</Text>
            <Text style={styles.providerVehicle}>📦 Pedido #{orderId?.slice(-6).toUpperCase()}</Text>
          </View>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => {
              if ((order as any)?.providerPhone) {
                const { Linking } = require('react-native');
                Linking.openURL(`tel:${(order as any).providerPhone}`);
              }
            }}
          >
            <Text style={styles.callBtnText}>📞</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.chatBtn} onPress={() => router.push(`/chat/${orderId}` as never)}>
          <Text style={styles.chatBtnText}>💬 Abrir chat</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: colors.white },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.neutral[100], alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 18, color: colors.navy[500] },
  headerTitle: { flex: 1, fontSize: 18, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900] },
  map: { flex: 1 },
  providerMarker: { backgroundColor: colors.primary[500], borderRadius: 20, padding: 8, borderWidth: 2, borderColor: colors.white },
  providerMarkerEmoji: { fontSize: 18 },
  destMarker: { backgroundColor: colors.semantic.emergency, borderRadius: 20, padding: 6, borderWidth: 2, borderColor: colors.white },
  destMarkerEmoji: { fontSize: 16 },
  panel: { backgroundColor: colors.white, padding: 16, borderTopLeftRadius: 20, borderTopRightRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 10 },
  etaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  etaEmoji: { fontSize: 18 },
  etaText: { fontSize: 18, fontFamily: 'Inter_700Bold', color: colors.navy[500] },
  providerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  providerMeta: { flex: 1 },
  providerName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900] },
  providerVehicle: { fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.neutral[500] },
  callBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.semantic.success, alignItems: 'center', justifyContent: 'center' },
  callBtnText: { fontSize: 20 },
  chatBtn: { backgroundColor: colors.neutral[100], borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.neutral[200] },
  chatBtnText: { fontSize: 15, fontFamily: 'Inter_500Medium', color: colors.neutral[700] },
});
