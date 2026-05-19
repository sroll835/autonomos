import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/presentation/stores/authStore';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { colors } from '@/presentation/theme/colors';

const MENU_ITEMS = [
  { icon: '🚗', label: 'Mis vehículos', route: '/profile/vehicles' },
  { icon: '💳', label: 'Métodos de pago', route: '/profile/payments' },
  { icon: '🆘', label: 'Contactos de emergencia', route: '/profile/emergency-contacts' },
  { icon: '📋', label: 'Historial de pedidos', route: '/(tabs)/orders' },
  { icon: '⭐', label: 'Mis reseñas', route: '/profile/reviews' },
  { icon: '🔔', label: 'Notificaciones', route: '/profile/notifications' },
  { icon: '📄', label: 'Documentos', route: '/profile/documents' },
  { icon: '⚙️', label: 'Configuración', route: '/profile/settings' },
];

const ROLE_LABELS: Record<string, { label: string; variant: 'info' | 'success' | 'warning' | 'default' }> = {
  CONDUCTOR: { label: 'Conductor',        variant: 'info' },
  TALLER:    { label: 'Taller',           variant: 'success' },
  AUTONOMO:  { label: 'Autónomo',         variant: 'warning' },
  EMPRESA:   { label: 'Empresa',          variant: 'default' },
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  if (!user) return null;
  const roleCfg = ROLE_LABELS[user.role];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cabecera del perfil */}
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatarContainer} onPress={() => {}}>
            <Avatar uri={user.avatar} name={user.name} size={80} />
            <View style={styles.editAvatarBtn}>
              <Text style={styles.editAvatarIcon}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.badgeRow}>
            <Badge label={roleCfg.label} variant={roleCfg.variant} />
            {user.isVerified && <Badge label="✓ Verificado" variant="success" />}
          </View>
          <TouchableOpacity style={styles.editProfileBtn} onPress={() => router.push('/profile/edit' as never)}>
            <Text style={styles.editProfileText}>Editar perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Menú de opciones */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item) => (
            <Card key={item.label} onPress={() => router.push(item.route as never)} style={styles.menuItem}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>→</Text>
            </Card>
          ))}
        </View>

        {/* Botón cerrar sesión */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Cerrar sesión</Text>
        </TouchableOpacity>

        <Text style={styles.version}>AUTONOMOS v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  profileHeader: { alignItems: 'center', backgroundColor: colors.white, paddingVertical: 28, paddingHorizontal: 16, marginBottom: 8 },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primary[500], borderRadius: 12, width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white },
  editAvatarIcon: { fontSize: 13 },
  userName: { fontSize: 22, fontFamily: 'Inter_700Bold', color: colors.neutral[900], marginBottom: 4 },
  userEmail: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.neutral[500], marginBottom: 10 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  editProfileBtn: { backgroundColor: colors.neutral[100], borderRadius: 10, paddingHorizontal: 20, paddingVertical: 8, borderWidth: 1, borderColor: colors.neutral[200] },
  editProfileText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: colors.neutral[700] },
  menuSection: { padding: 16, gap: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: { fontSize: 20 },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.neutral[800] },
  menuArrow: { fontSize: 16, color: colors.neutral[400] },
  logoutBtn: { margin: 16, backgroundColor: '#FEE8E6', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#F8C0BD' },
  logoutText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.semantic.emergency },
  version: { textAlign: 'center', fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.neutral[400], paddingBottom: 24 },
});
