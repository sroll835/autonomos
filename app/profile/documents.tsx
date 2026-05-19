import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { colors } from '@/presentation/theme/colors';
import apiClient from '@/infrastructure/api/client';

interface Document {
  id: string;
  type: 'CEDULA' | 'LICENCIA' | 'SOAT' | 'TECNOMECANICA' | 'OTRO';
  name: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  uploadedAt: string;
  url: string;
}

const DOC_TYPES = [
  { key: 'CEDULA', label: 'Cédula de identidad', emoji: '🪪' },
  { key: 'LICENCIA', label: 'Licencia de conducción', emoji: '🚗' },
  { key: 'SOAT', label: 'SOAT', emoji: '🛡️' },
  { key: 'TECNOMECANICA', label: 'Técnico-mecánica', emoji: '🔧' },
  { key: 'OTRO', label: 'Otro documento', emoji: '📄' },
];

const STATUS_CONFIG = {
  PENDING: { label: 'En revisión', variant: 'warning' as const },
  APPROVED: { label: 'Aprobado', variant: 'success' as const },
  REJECTED: { label: 'Rechazado', variant: 'danger' as const },
};

export default function DocumentsScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const [uploading, setUploading] = useState<string | null>(null);

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data } = await apiClient.get('/users/documents');
      return data;
    },
  });

  const uploadDocument = async (type: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
      });
      if (result.canceled || !result.assets[0]) return;

      setUploading(type);
      const form = new FormData();
      form.append('file', { uri: result.assets[0].uri, type: 'image/jpeg', name: `${type}.jpg` } as never);
      form.append('type', type);
      await apiClient.post('/users/documents', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      qc.invalidateQueries({ queryKey: ['documents'] });
      Toast.show({ type: 'success', text1: 'Documento enviado para revisión' });
    } catch (e: unknown) {
      Toast.show({ type: 'error', text1: (e as Error).message });
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Eliminar documento', '¿Seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        await apiClient.delete(`/users/documents/${id}`);
        qc.invalidateQueries({ queryKey: ['documents'] });
      }},
    ]);
  };

  const uploadedTypes = new Set((documents ?? []).map((d) => d.type));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Documentos</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>📋 Documenta tu perfil para mayor confianza y acceso a más servicios.</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary[500]} />
      ) : (
        <FlatList
          data={DOC_TYPES}
          keyExtractor={(d) => d.key}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const uploaded = (documents ?? []).find((d) => d.type === item.key);
            return (
              <Card style={styles.docCard}>
                <View style={styles.docRow}>
                  <Text style={styles.docEmoji}>{item.emoji}</Text>
                  <View style={styles.docInfo}>
                    <Text style={styles.docName}>{item.label}</Text>
                    {uploaded ? (
                      <Badge label={STATUS_CONFIG[uploaded.status].label} variant={STATUS_CONFIG[uploaded.status].variant} />
                    ) : (
                      <Text style={styles.docMissing}>No subido</Text>
                    )}
                  </View>
                  {uploaded ? (
                    <TouchableOpacity onPress={() => handleDelete(uploaded.id)} style={styles.actionBtn}>
                      <Text style={styles.deleteIcon}>🗑</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.uploadBtn}
                      onPress={() => uploadDocument(item.key)}
                      disabled={uploading === item.key}
                    >
                      {uploading === item.key
                        ? <ActivityIndicator size="small" color={colors.navy[500]} />
                        : <Text style={styles.uploadBtnText}>Subir</Text>
                      }
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            );
          }}
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
  infoBox: { backgroundColor: '#EFF6FF', margin: 16, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#BFDBFE' },
  infoText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#1E40AF', lineHeight: 18 },
  list: { padding: 16, gap: 10, paddingBottom: 40 },
  docCard: { padding: 14 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  docEmoji: { fontSize: 28 },
  docInfo: { flex: 1, gap: 4 },
  docName: { fontSize: 14, fontFamily: 'Inter_500Medium', color: colors.neutral[900] },
  docMissing: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.neutral[400] },
  actionBtn: { padding: 8 },
  deleteIcon: { fontSize: 18 },
  uploadBtn: { backgroundColor: colors.primary[500], borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7, minWidth: 60, alignItems: 'center' },
  uploadBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: colors.navy[500] },
});
