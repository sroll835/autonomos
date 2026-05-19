import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/presentation/stores/authStore';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { colors } from '@/presentation/theme/colors';
import apiClient from '@/infrastructure/api/client';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [avatar, setAvatar] = useState(user?.avatar ?? '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para cambiar la foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setUploading(true);
      try {
        const form = new FormData();
        form.append('file', { uri: result.assets[0].uri, type: 'image/jpeg', name: 'avatar.jpg' } as never);
        const { data } = await apiClient.post<{ url: string }>('/users/avatar', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setAvatar(data.url);
      } catch {
        setAvatar(result.assets[0].uri);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Nombre requerido' });
      return;
    }
    setSaving(true);
    try {
      await updateUser({ name: name.trim(), phone: phone.trim(), avatar });
      Toast.show({ type: 'success', text1: 'Perfil actualizado' });
      router.back();
    } catch (e: unknown) {
      Toast.show({ type: 'error', text1: 'Error al guardar', text2: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Editar perfil</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color={colors.primary[500]} /> : <Text style={styles.saveBtn}>Guardar</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.avatarWrapper} onPress={pickAvatar} disabled={uploading}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImg} contentFit="cover" />
          ) : (
            <Avatar uri={user?.avatar} name={user?.name} size={100} />
          )}
          <View style={styles.avatarOverlay}>
            {uploading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.cameraIcon}>📷</Text>}
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarHint}>Toca para cambiar foto</Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre"
              placeholderTextColor={colors.neutral[400]}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+57 300 000 0000"
              keyboardType="phone-pad"
              placeholderTextColor={colors.neutral[400]}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={user?.email}
              editable={false}
            />
            <Text style={styles.fieldHint}>El correo no se puede cambiar</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Rol</Text>
            <View style={[styles.input, styles.inputDisabled, styles.roleRow]}>
              <Text style={styles.roleText}>{user?.role}</Text>
            </View>
            <Text style={styles.fieldHint}>Contacta soporte para cambiar tu rol</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: colors.white, borderBottomWidth: 0.5, borderBottomColor: colors.neutral[200] },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.neutral[100], alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 18, color: colors.navy[500] },
  title: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900] },
  saveBtn: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.primary[600] },
  content: { padding: 24, alignItems: 'center' },
  avatarWrapper: { position: 'relative', width: 100, height: 100, borderRadius: 50, overflow: 'hidden', marginBottom: 8 },
  avatarImg: { width: 100, height: 100, borderRadius: 50 },
  avatarOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  cameraIcon: { fontSize: 28 },
  avatarHint: { fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.neutral[500], marginBottom: 28 },
  form: { width: '100%', gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: colors.neutral[700] },
  input: { borderWidth: 1.5, borderColor: colors.neutral[200], borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.neutral[900], backgroundColor: colors.white },
  inputDisabled: { backgroundColor: colors.neutral[50], color: colors.neutral[500] },
  roleRow: { justifyContent: 'center' },
  roleText: { fontSize: 15, fontFamily: 'Inter_500Medium', color: colors.neutral[500] },
  fieldHint: { fontSize: 11, fontFamily: 'Inter_400Regular', color: colors.neutral[400] },
});
