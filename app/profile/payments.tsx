import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { Card } from '@/presentation/components/ui/Card';
import { colors } from '@/presentation/theme/colors';
import apiClient from '@/infrastructure/api/client';
import { ENDPOINTS } from '@/infrastructure/api/endpoints';

interface PaymentMethod {
  id: string;
  type: 'TARJETA' | 'PSE' | 'NEQUI';
  last4?: string;
  brand?: string;
  phone?: string;
  bank?: string;
  isDefault: boolean;
}

const METHOD_ICONS: Record<string, string> = { TARJETA: '💳', PSE: '🏦', NEQUI: '📱' };

export default function PaymentsScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'TARJETA' | 'NEQUI'>('TARJETA');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [phone, setPhone] = useState('');

  const { data: methods, isLoading } = useQuery<PaymentMethod[]>({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.USERS.PAYMENT_METHODS);
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const payload = selectedType === 'TARJETA'
        ? { type: 'TARJETA', last4: cardNumber.slice(-4), brand: 'Visa', cardHolder, expiry }
        : { type: 'NEQUI', phone };
      const { data } = await apiClient.post(ENDPOINTS.USERS.PAYMENT_METHODS, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-methods'] });
      setShowModal(false);
      setCardNumber(''); setCardHolder(''); setExpiry(''); setPhone('');
      Toast.show({ type: 'success', text1: 'Método de pago agregado' });
    },
    onError: (e: Error) => Toast.show({ type: 'error', text1: e.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`${ENDPOINTS.USERS.PAYMENT_METHODS}/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payment-methods'] }),
  });

  const handleDelete = (id: string) => {
    Alert.alert('Eliminar método', '¿Confirmas la eliminación?', [
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
        <Text style={styles.title}>Métodos de pago</Text>
        <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary[500]} />
      ) : (
        <FlatList
          data={methods ?? []}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.methodCard}>
              <View style={styles.methodRow}>
                <Text style={styles.methodIcon}>{METHOD_ICONS[item.type]}</Text>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>
                    {item.type === 'TARJETA' ? `${item.brand} •••• ${item.last4}` : item.type === 'NEQUI' ? `Nequi ${item.phone}` : `PSE ${item.bank}`}
                  </Text>
                  {item.isDefault && <Text style={styles.defaultTag}>Principal</Text>}
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteIcon}>🗑</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>💳</Text>
              <Text style={styles.emptyTitle}>Sin métodos de pago</Text>
              <Text style={styles.emptyText}>Agrega una tarjeta o billetera digital para pagar más rápido</Text>
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
            <Text style={styles.modalTitle}>Nuevo método</Text>
            <TouchableOpacity onPress={() => addMutation.mutate()} disabled={addMutation.isPending}>
              {addMutation.isPending ? <ActivityIndicator size="small" color={colors.primary[500]} /> : <Text style={styles.modalSave}>Guardar</Text>}
            </TouchableOpacity>
          </View>
          <View style={styles.typeSelector}>
            {(['TARJETA', 'NEQUI'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeOption, selectedType === t && styles.typeOptionActive]}
                onPress={() => setSelectedType(t)}
              >
                <Text style={styles.typeOptionIcon}>{METHOD_ICONS[t]}</Text>
                <Text style={[styles.typeOptionLabel, selectedType === t && styles.typeOptionLabelActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.formContent}>
            {selectedType === 'TARJETA' ? (
              <>
                <Field label="Número de tarjeta" value={cardNumber} onChange={setCardNumber} placeholder="1234 5678 9012 3456" keyboard="numeric" />
                <Field label="Titular" value={cardHolder} onChange={setCardHolder} placeholder="Como aparece en la tarjeta" />
                <Field label="Vencimiento" value={expiry} onChange={setExpiry} placeholder="MM/AA" />
              </>
            ) : (
              <Field label="Número Nequi" value={phone} onChange={setPhone} placeholder="+57 300 000 0000" keyboard="phone-pad" />
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function Field({ label, value, onChange, placeholder, keyboard }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; keyboard?: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType={(keyboard as never) ?? 'default'}
        placeholderTextColor={colors.neutral[400]}
      />
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
  methodCard: { padding: 14 },
  methodRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  methodIcon: { fontSize: 28 },
  methodInfo: { flex: 1 },
  methodName: { fontSize: 15, fontFamily: 'Inter_500Medium', color: colors.neutral[900] },
  defaultTag: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: colors.semantic.success, marginTop: 2 },
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
  typeSelector: { flexDirection: 'row', gap: 12, padding: 16 },
  typeOption: { flex: 1, alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: colors.neutral[200] },
  typeOptionActive: { borderColor: colors.primary[500], backgroundColor: colors.primary[50] },
  typeOptionIcon: { fontSize: 24, marginBottom: 4 },
  typeOptionLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.neutral[600] },
  typeOptionLabelActive: { color: colors.primary[900], fontFamily: 'Inter_600SemiBold' },
  formContent: { padding: 16, gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: colors.neutral[700] },
  input: { borderWidth: 1.5, borderColor: colors.neutral[200], borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.neutral[900] },
});
