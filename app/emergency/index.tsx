import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Vibration, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEmergencyStore } from '@/presentation/stores/emergencyStore';
import { useLocationStore } from '@/presentation/stores/locationStore';
import { colors } from '@/presentation/theme/colors';
import { formatETA } from '@/shared/utils/formatters';
import { container } from '@/di/container';

export default function EmergencyScreen() {
  const router = useRouter();
  const { activeEmergency, isLoading, countdown, isCountingDown, startCountdown, cancelCountdown, triggerSOS } = useEmergencyStore();
  const { currentLocation, currentAddress, getCurrentLocation } = useLocationStore();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const countdownTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    getCurrentLocation();
    // Animación de pulso del botón SOS
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
    return () => { cancelCountdown(); };
  }, []);

  // Disparar SOS automáticamente cuando el contador llega a 0
  useEffect(() => {
    if (isCountingDown && countdown === 3) {
      // Inicia el proceso de disparo después de 3 segundos
      countdownTimer.current = setTimeout(async () => {
        if (currentLocation) {
          Vibration.vibrate([0, 200, 100, 200]);
          await triggerSOS('MEDICA', currentLocation, currentAddress || 'Ubicación actual');
        }
      }, 3000);
    }
    return () => clearTimeout(countdownTimer.current);
  }, [isCountingDown]);

  const handleSOSPress = () => {
    if (!currentLocation) {
      Alert.alert('Sin ubicación', 'No se puede enviar la alerta sin tu ubicación. Activa el GPS.');
      return;
    }
    Vibration.vibrate(100);
    startCountdown();
  };

  const handleCancel = () => {
    clearTimeout(countdownTimer.current);
    cancelCountdown();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergencia SOS</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Información de ubicación */}
      <View style={styles.locationCard}>
        <Text style={styles.locationIcon}>📍</Text>
        <Text style={styles.locationText}>{currentAddress || 'Detectando ubicación...'}</Text>
      </View>

      {/* Estado activo de emergencia */}
      {activeEmergency ? (
        <View style={styles.activeContainer}>
          <Text style={styles.activeEmoji}>🚑</Text>
          <Text style={styles.activeTitle}>¡Ambulancia despachada!</Text>
          {activeEmergency.eta && (
            <Text style={styles.activeEta}>Tiempo estimado: {formatETA(activeEmergency.eta)}</Text>
          )}
          {activeEmergency.ambulanceDriver && (
            <Text style={styles.activeDriver}>Conductor: {activeEmergency.ambulanceDriver}</Text>
          )}
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => {
              if (activeEmergency?.ambulancePhone) {
                Linking.openURL(`tel:${activeEmergency.ambulancePhone}`);
              }
            }}
          >
            <Text style={styles.callBtnText}>📞 Llamar al conductor</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={async () => {
              try {
                await container.repos.emergency.notifyContacts(activeEmergency!.id);
                Alert.alert('Notificación enviada', 'Tus contactos de emergencia han sido alertados.');
              } catch {
                Alert.alert('Error', 'No se pudo notificar a tus contactos.');
              }
            }}
          >
            <Text style={styles.contactBtnText}>👨‍👩‍👧 Notificar contacto de emergencia</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Botón SOS principal */}
          <View style={styles.sosContainer}>
            <Animated.View style={[styles.sosRing, { transform: [{ scale: pulseAnim }] }]} />
            <TouchableOpacity
              style={[styles.sosButton, isCountingDown && styles.sosButtonCounting]}
              onPress={handleSOSPress}
              onLongPress={handleSOSPress}
              activeOpacity={0.9}
            >
              <Text style={styles.sosEmoji}>🆘</Text>
              <Text style={styles.sosLabel}>SOS</Text>
              {isCountingDown && <Text style={styles.sosCountdown}>{countdown}</Text>}
            </TouchableOpacity>
          </View>

          {isCountingDown ? (
            <View style={styles.countingContainer}>
              <Text style={styles.countingText}>Enviando alerta en {countdown} segundos...</Text>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                <Text style={styles.cancelBtnText}>CANCELAR</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.instructions}>
              Mantén presionado el botón para activar la alerta de emergencia.{'\n'}
              Tendrás 3 segundos para cancelar.
            </Text>
          )}

          {/* Tipos de emergencia */}
          <View style={styles.emergencyTypes}>
            <Text style={styles.typesTitle}>Tipo de emergencia</Text>
            <View style={styles.typesGrid}>
              {[
                { type: 'MEDICA', emoji: '🏥', label: 'Médica' },
                { type: 'ACCIDENTE', emoji: '🚗', label: 'Accidente' },
                { type: 'INCENDIO', emoji: '🔥', label: 'Incendio' },
                { type: 'OTRO', emoji: '❗', label: 'Otro' },
              ].map((item) => (
                <TouchableOpacity key={item.type} style={styles.typeCard}>
                  <Text style={styles.typeEmoji}>{item.emoji}</Text>
                  <Text style={styles.typeLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  closeIcon: { color: colors.white, fontSize: 16 },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: colors.white },
  locationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, margin: 16, gap: 8 },
  locationIcon: { fontSize: 16 },
  locationText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.8)' },
  sosContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 40, position: 'relative' },
  sosRing: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(232,58,32,0.2)', borderWidth: 2, borderColor: 'rgba(232,58,32,0.4)' },
  sosButton: { width: 160, height: 160, borderRadius: 80, backgroundColor: colors.semantic.emergency, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)' },
  sosButtonCounting: { backgroundColor: '#B02810' },
  sosEmoji: { fontSize: 48 },
  sosLabel: { fontSize: 20, fontFamily: 'Inter_700Bold', color: colors.white, marginTop: 4 },
  sosCountdown: { fontSize: 36, fontFamily: 'Inter_700Bold', color: colors.white },
  countingContainer: { alignItems: 'center', gap: 16 },
  countingText: { fontSize: 16, fontFamily: 'Inter_500Medium', color: colors.white, textAlign: 'center' },
  cancelBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  cancelBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: colors.white, letterSpacing: 2 },
  instructions: { fontSize: 14, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.6)', textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 },
  emergencyTypes: { margin: 16, marginTop: 24 },
  typesTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: 'rgba(255,255,255,0.7)', marginBottom: 12 },
  typesGrid: { flexDirection: 'row', gap: 10 },
  typeCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  typeEmoji: { fontSize: 22, marginBottom: 4 },
  typeLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.8)' },
  activeContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  activeEmoji: { fontSize: 64 },
  activeTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: colors.white, textAlign: 'center' },
  activeEta: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: colors.primary[500] },
  activeDriver: { fontSize: 15, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.8)' },
  callBtn: { backgroundColor: colors.semantic.success, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, width: '100%', alignItems: 'center' },
  callBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: colors.white },
  contactBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  contactBtnText: { fontSize: 15, fontFamily: 'Inter_500Medium', color: colors.white },
});
