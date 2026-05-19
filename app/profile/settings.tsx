import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card } from '@/presentation/components/ui/Card';
import { colors } from '@/presentation/theme/colors';
import { useAuthStore } from '@/presentation/stores/authStore';

interface SettingToggle {
  key: string;
  label: string;
  description: string;
  emoji: string;
}

const NOTIFICATION_SETTINGS: SettingToggle[] = [
  { key: 'notif_orders', label: 'Pedidos y entregas', description: 'Actualizaciones de estado de pedidos', emoji: '📦' },
  { key: 'notif_services', label: 'Servicios', description: 'Respuestas de proveedores y cotizaciones', emoji: '🔧' },
  { key: 'notif_emergency', label: 'Emergencias', description: 'Alertas SOS y respuestas', emoji: '🆘' },
  { key: 'notif_promos', label: 'Promociones', description: 'Descuentos y ofertas especiales', emoji: '🎉' },
];

const PRIVACY_SETTINGS: SettingToggle[] = [
  { key: 'share_location', label: 'Compartir ubicación', description: 'Permite que proveedores vean tu ubicación en tiempo real', emoji: '📍' },
  { key: 'show_online', label: 'Mostrar como activo', description: 'Otros usuarios pueden ver cuando estás en línea', emoji: '🟢' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [settings, setSettings] = useState<Record<string, boolean>>({
    notif_orders: true,
    notif_services: true,
    notif_emergency: true,
    notif_promos: false,
    share_location: true,
    show_online: true,
  });

  const toggle = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar cuenta',
      'Esta acción es irreversible. Se eliminarán todos tus datos, pedidos e historial.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: async () => {
          Alert.alert('Solicitud enviada', 'Recibirás un correo de confirmación en 24-48h.');
        }},
      ]
    );
  };

  const handleClearCache = async () => {
    await AsyncStorage.clear();
    Alert.alert('Caché limpiado', 'Los datos locales han sido eliminados.');
  };

  function SettingRow({ item }: { item: SettingToggle }) {
    return (
      <View style={styles.settingRow}>
        <Text style={styles.settingEmoji}>{item.emoji}</Text>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>{item.label}</Text>
          <Text style={styles.settingDesc}>{item.description}</Text>
        </View>
        <Switch
          value={settings[item.key]}
          onValueChange={() => toggle(item.key)}
          trackColor={{ false: colors.neutral[200], true: colors.primary[500] }}
          thumbColor={colors.white}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Configuración</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Notificaciones</Text>
        <Card style={styles.section}>
          {NOTIFICATION_SETTINGS.map((item, idx) => (
            <View key={item.key}>
              <SettingRow item={item} />
              {idx < NOTIFICATION_SETTINGS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>

        <Text style={styles.sectionTitle}>Privacidad</Text>
        <Card style={styles.section}>
          {PRIVACY_SETTINGS.map((item, idx) => (
            <View key={item.key}>
              <SettingRow item={item} />
              {idx < PRIVACY_SETTINGS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>

        <Text style={styles.sectionTitle}>Datos y cuenta</Text>
        <Card style={styles.section}>
          <TouchableOpacity style={styles.actionRow} onPress={handleClearCache}>
            <Text style={styles.actionEmoji}>🗑</Text>
            <Text style={styles.actionLabel}>Limpiar caché</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.actionRow} onPress={() => Alert.alert('Exportar datos', 'Recibirás un correo con tus datos en 24h.')}>
            <Text style={styles.actionEmoji}>📤</Text>
            <Text style={styles.actionLabel}>Exportar mis datos</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.actionRow} onPress={handleDeleteAccount}>
            <Text style={styles.actionEmoji}>⚠️</Text>
            <Text style={[styles.actionLabel, styles.dangerText]}>Eliminar cuenta</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </Card>

        <Text style={styles.version}>AUTONOMOS v1.0.0 · Términos · Privacidad</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.white, borderBottomWidth: 0.5, borderBottomColor: colors.neutral[200] },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.neutral[100], alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  backIcon: { fontSize: 18, color: colors.navy[500] },
  title: { flex: 1, fontSize: 17, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900] },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: colors.neutral[500], marginTop: 20, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  section: { padding: 0, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  settingEmoji: { fontSize: 22 },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 14, fontFamily: 'Inter_500Medium', color: colors.neutral[900] },
  settingDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.neutral[500], marginTop: 2 },
  divider: { height: 0.5, backgroundColor: colors.neutral[100], marginLeft: 52 },
  actionRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  actionEmoji: { fontSize: 22 },
  actionLabel: { flex: 1, fontSize: 14, fontFamily: 'Inter_500Medium', color: colors.neutral[900] },
  actionArrow: { fontSize: 16, color: colors.neutral[400] },
  dangerText: { color: colors.semantic.emergency },
  version: { textAlign: 'center', fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.neutral[400], marginTop: 32 },
});
