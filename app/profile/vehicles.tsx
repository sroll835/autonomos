import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { Card } from '@/presentation/components/ui/Card';
import { colors } from '@/presentation/theme/colors';
import { container } from '@/di/container';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  isPrimary: boolean;
}

export default function VehiclesScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ brand: '', model: '', year: '', plate: '', color: '' });

  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: () => container.repos.user.getVehicles(),
  });

  const addMutation = useMutation({
    mutationFn: () => container.repos.user.addVehicle({
      brand: form.brand,
      model: form.model,
      year: parseInt(form.year, 10),
      plate: form.plate,
      color: form.color,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] });
      setShowModal(false);
      setForm({ brand: '', model: '', year: '', plate: '', color: '' });
      Toast.show({ type: 'success', text1: 'Vehículo agregado' });
    },
    onError: (e: Error) => Toast.show({ type: 'error', text1: e.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => container.repos.user.removeVehicle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
  });

  const handleDelete = (id: string) => {
    Alert.alert('Eliminar vehículo', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ]);
  };

  const canAdd = form.brand && form.model && form.year && form.plate;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mis vehículos</Text>
        <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary[500]} />
      ) : (
        <FlatList
          data={vehicles ?? []}
          keyExtractor={(v) => v.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.vehicleCard}>
              <View style={styles.vehicleRow}>
                <Text style={styles.vehicleEmoji}>🚗</Text>
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleName}>{item.brand} {item.model} {item.year}</Text>
                  <Text style={styles.vehiclePlate}>{item.plate} · {item.color}</Text>
                </View>
                {item.isPrimary && <Text style={styles.primaryTag}>Principal</Text>}
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteIcon}>🗑</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🚗</Text>
              <Text style={styles.emptyTitle}>Sin vehículos</Text>
              <Text style={styles.emptyText}>Agrega tu vehículo para servicios más rápidos</Text>
            </View>
          }
        />
      )}

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nuevo vehículo</Text>
            <TouchableOpacity onPress={() => addMutation.mutate()} disabled={!canAdd || addMutation.isPending}>
              {addMutation.isPending ? <ActivityIndicator size="small" color={colors.primary[500]} /> : <Text style={[styles.modalSave, !canAdd && styles.modalSaveDisabled]}>Guardar</Text>}
            </TouchableOpacity>
          </View>
          <ScrollableForm form={form} setForm={setForm} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function ScrollableForm({ form, setForm }: { form: Record<string, string>; setForm: (f: Record<string, string>) => void }) {
  const fields = [
    { key: 'brand', label: 'Marca', placeholder: 'Ej: Toyota' },
    { key: 'model', label: 'Modelo', placeholder: 'Ej: Corolla' },
    { key: 'year', label: 'Año', placeholder: 'Ej: 2020', keyboard: 'numeric' },
    { key: 'plate', label: 'Placa', placeholder: 'Ej: ABC 123', autoCapitalize: 'characters' },
    { key: 'color', label: 'Color', placeholder: 'Ej: Blanco' },
  ];
  return (
    <View style={styles.formContent}>
      {fields.map((f) => (
        <View key={f.key} style={styles.field}>
          <Text style={styles.label}>{f.label}</Text>
          <TextInput
            style={styles.input}
            value={form[f.key]}
            onChangeText={(v) => setForm({ ...form, [f.key]: v })}
            placeholder={f.placeholder}
            keyboardType={(f.keyboard as never) ?? 'default'}
            autoCapitalize={(f.autoCapitalize as never) ?? 'words'}
            placeholderTextColor={colors.neutral[400]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.white, borderBottomWidth: 0.5, borderBottomColor: colors.neutral[200] },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.neutral[100], alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  backIcon: { fontSize: 18, color: colors.navy[500] },
  title: { flex: 1, fontSize: 17, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900] },
  addBtn: { backgroundColor: colors.primary[500], borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 },
  addBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: colors.navy[500] },
  list: { padding: 16, gap: 10, paddingBottom: 40 },
  vehicleCard: { padding: 14 },
  vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  vehicleEmoji: { fontSize: 28 },
  vehicleInfo: { flex: 1 },
  vehicleName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900] },
  vehiclePlate: { fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.neutral[500], marginTop: 2 },
  primaryTag: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: colors.semantic.success, backgroundColor: '#E6F9F1', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  deleteBtn: { padding: 8 },
  deleteIcon: { fontSize: 18 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900], marginBottom: 6 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.neutral[500], textAlign: 'center', paddingHorizontal: 32 },
  modal: { flex: 1, backgroundColor: colors.white },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5, borderBottomColor: colors.neutral[200] },
  modalCancel: { fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.neutral[600] },
  modalTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900] },
  modalSave: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.primary[600] },
  modalSaveDisabled: { color: colors.neutral[400] },
  formContent: { padding: 20, gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: colors.neutral[700] },
  input: { borderWidth: 1.5, borderColor: colors.neutral[200], borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.neutral[900] },
});
