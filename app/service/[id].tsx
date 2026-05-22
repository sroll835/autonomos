import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import { colors } from '@/presentation/theme/colors';
import { Provider } from '@/domain/entities/Provider';
import { container } from '@/di/container';
import { useLocationStore } from '@/presentation/stores/locationStore';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentLocation, currentAddress } = useLocationStore();
  const [description, setDescription] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [rating, setRating] = useState(0);

  const { data: provider } = useQuery<Provider>({
    queryKey: ['provider', id],
    queryFn: () => container.repos.service.getProvider(id),
  });

  const handleRequest = async () => {
    if (!description.trim()) {
      Toast.show({ type: 'error', text1: 'Descripción requerida', text2: 'Describe brevemente el problema' });
      return;
    }
    if (!currentLocation) {
      Toast.show({ type: 'error', text1: 'Sin ubicación', text2: 'Activa el GPS para continuar' });
      return;
    }
    setIsRequesting(true);
    try {
      const data = await container.repos.service.createServiceRequest({
        serviceType: provider!.serviceType,
        providerId: id,
        description,
        location: currentLocation,
        address: currentAddress,
      });
      Toast.show({ type: 'success', text1: '¡Solicitud enviada!', text2: 'El proveedor responderá pronto' });
      router.replace(`/tracking/${data.id}` as never);
    } catch (e: unknown) {
      Toast.show({ type: 'error', text1: 'Error', text2: (e as Error).message });
    } finally {
      setIsRequesting(false);
    }
  };

  if (!provider) return null;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Info del proveedor */}
        <View style={styles.providerSection}>
          <Avatar uri={provider.avatar} name={provider.name} size={72} />
          <Text style={styles.providerName}>{provider.name}</Text>
          <View style={styles.metaRow}>
            <Text>⭐ {provider.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({provider.reviewCount} reseñas)</Text>
            <Badge label={provider.isAvailable ? 'Disponible' : 'Ocupado'} variant={provider.isAvailable ? 'success' : 'warning'} />
          </View>
          {provider.vehicle && (
            <Text style={styles.vehicleInfo}>🚗 {provider.vehicle.brand} {provider.vehicle.model} · {provider.vehicle.plate}</Text>
          )}
          {provider.certifications.length > 0 && (
            <View style={styles.certs}>
              {provider.certifications.map((c) => (
                <View key={c} style={styles.certTag}>
                  <Text style={styles.certText}>{c}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Formulario de solicitud */}
        <View style={styles.requestForm}>
          <Text style={styles.formTitle}>Describe el problema</Text>
          <TextInput
            style={styles.descInput}
            placeholder="Ej: El motor no enciende, hay ruido extraño en el motor..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={colors.neutral[400]}
          />

          <View style={styles.locationInfo}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{currentAddress || 'Detectando ubicación...'}</Text>
          </View>

          {provider.pricePerHour && (
            <View style={styles.priceInfo}>
              <Text style={styles.priceLabel}>Tarifa estimada:</Text>
              <Text style={styles.priceValue}>${provider.pricePerHour.toLocaleString('es-CO')}/hora</Text>
            </View>
          )}

          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>¿Ya usaste este servicio? Califica:</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Text style={styles.ratingStar}>{star <= rating ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Solicitar servicio"
          onPress={handleRequest}
          isLoading={isRequesting}
          disabled={!provider.isAvailable}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  header: { padding: 16, paddingTop: 50 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  backIcon: { fontSize: 20, color: colors.navy[500] },
  providerSection: { alignItems: 'center', backgroundColor: colors.white, paddingVertical: 24, paddingHorizontal: 16, marginBottom: 12 },
  providerName: { fontSize: 22, fontFamily: 'Inter_700Bold', color: colors.neutral[900], marginTop: 12, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reviewCount: { fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.neutral[500] },
  vehicleInfo: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.neutral[600], marginBottom: 12 },
  certs: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  certTag: { backgroundColor: colors.primary[50], borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: colors.primary[100] },
  certText: { fontSize: 12, fontFamily: 'Inter_500Medium', color: colors.primary[900] },
  requestForm: { backgroundColor: colors.white, padding: 20, margin: 12, borderRadius: 16 },
  formTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900], marginBottom: 12 },
  descInput: { borderWidth: 1.5, borderColor: colors.neutral[200], borderRadius: 12, padding: 14, fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.neutral[900], minHeight: 100, marginBottom: 14 },
  locationInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.neutral[50], borderRadius: 10, padding: 12, marginBottom: 12 },
  locationIcon: { fontSize: 16 },
  locationText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.neutral[600] },
  priceInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.neutral[100], paddingTop: 14 },
  priceLabel: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.neutral[600] },
  priceValue: { fontSize: 17, fontFamily: 'Inter_700Bold', color: colors.navy[500] },
  ratingSection: { marginTop: 16, borderTopWidth: 1, borderTopColor: colors.neutral[100], paddingTop: 14 },
  ratingLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.neutral[600], marginBottom: 8 },
  starsRow: { flexDirection: 'row', gap: 6 },
  ratingStar: { fontSize: 28 },
  footer: { padding: 16, backgroundColor: colors.white, borderTopWidth: 0.5, borderTopColor: colors.neutral[200] },
});
