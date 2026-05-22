import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { Card } from '@/presentation/components/ui/Card';
import { colors } from '@/presentation/theme/colors';
import { container } from '@/di/container';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

const RELATIONSHIPS = ['Familiar', 'Pareja', 'Amigo/a', 'Compañero/a', 'Otro'];

export default function EmergencyContactsScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('Familiar');

  const { data: contacts, isLoading } = useQuery<EmergencyContact[]>({
    queryKey: ['emergency-contacts'],
    queryFn: () => container.repos.emergency.getContacts(),
  });

  const addMutation = useMutation({
    mutationFn: () => container.repos.emergency.addContact({ name, phone, relationship }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['emergency-contacts'] });
      setShowModal(false);
      setName(''); setPhone('');
      Toast.show({ type: 'success', text1: 'Contacto agregado' });
    },
    onError: (e: Error) => Toast.show({ type: 'error', text1: e.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => container.repos.emergency.removeContact(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['emergency-contacts'] }),
  });

  const handleDelete = (id: string) => {
    Alert.alert('Eliminar contacto', '¿Seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Contactos de emergencia</Text>
        <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>🆘 Estos contactos serán notificados automáticamente cuando actives una alerta SOS.</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary[500]} />
      ) : (
        <FlatList
          data={contacts ?? []}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.contactCard}>
              <View style={styles.contactRow}>
                <View style={styles.contactAvatar}>
                  <Text style={styles.contactInitial}>{item.name[0]?.toUpperCase()}</Text>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <Text style={styles.contactMeta}>{item.relationship} · {item.phone}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteIcon}>🗑</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>👨‍👩‍👧</Text>
              <Text style={styles.emptyTitle}>Sin contactos aún</Text>
              <Text style={styles.emptyText}>Agrega personas de confianza para emergencias</Text>
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
            <Text style={styles.modalTitle}>Nuevo contacto</Text>
            <TouchableOpacity onPress={() => addMutation.mutate()} disabled={!name || !phone || addMutation.isPending}>
              {addMutation.isPending ? <ActivityIndicator size="small" color={colors.primary[500]} /> : <Text style={[styles.modalSave, (!name || !phone) && styles.disabled]}>Guardar</Text>}
            </TouchableOpacity>
          </View>
          <View style={styles.formContent}>
            <View style={styles.field}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nombre del contacto" placeholderTextColor={colors.neutral[400]} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+57 300 000 0000" keyboardType="phone-pad" placeholderTextColor={colors.neutral[400]} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Relación</Text>
              <View style={styles.chips}>
                {RELATIONSHIPS.map((r) => (
                  <TouchableOpacity key={r} style={[styles.chip, relationship === r && styles.chipActive]} onPress={() => setRelationship(r)}>
                    <Text style={[styles.chipText, relationship === r && styles.chipTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
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
  infoBox: { backgroundColor: '#FFF3CD', margin: 16, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#FFD700' },
  infoText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#7A5500', lineHeight: 18 },
  list: { padding: 16, gap: 10, paddingBottom: 40 },
  contactCard: { padding: 14 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  contactAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.navy[500], alignItems: 'center', justifyContent: 'center' },
  contactInitial: { fontSize: 18, fontFamily: 'Inter_700Bold', color: colors.white },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900] },
  contactMeta: { fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.neutral[500], marginTop: 2 },
  deleteBtn: { padding: 8 },
  deleteIcon: { fontSize: 18 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900], marginBottom: 6 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.neutral[500], textAlign: 'center' },
  modal: { flex: 1, backgroundColor: colors.white },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5, borderBottomColor: colors.neutral[200] },
  modalCancel: { fontSize: 15, color: colors.neutral[600] },
  modalTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900] },
  modalSave: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.primary[600] },
  disabled: { color: colors.neutral[400] },
  formContent: { padding: 20, gap: 18 },
  field: { gap: 8 },
  label: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: colors.neutral[700] },
  input: { borderWidth: 1.5, borderColor: colors.neutral[200], borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.neutral[900] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: colors.neutral[200] },
  chipActive: { borderColor: colors.primary[500], backgroundColor: colors.primary[50] },
  chipText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.neutral[600] },
  chipTextActive: { color: colors.primary[900], fontFamily: 'Inter_600SemiBold' },
});
