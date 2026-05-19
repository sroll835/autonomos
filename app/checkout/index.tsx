import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { useCartStore } from '@/presentation/stores/cartStore';
import { useLocationStore } from '@/presentation/stores/locationStore';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { colors } from '@/presentation/theme/colors';
import { formatCOP } from '@/shared/utils/formatters';
import { PaymentMethod } from '@/domain/entities/Order';
import apiClient from '@/infrastructure/api/client';
import { ENDPOINTS } from '@/infrastructure/api/endpoints';

const PAYMENT_OPTIONS: { method: PaymentMethod; label: string; emoji: string }[] = [
  { method: 'TARJETA', label: 'Tarjeta de crédito/débito', emoji: '💳' },
  { method: 'PSE', label: 'PSE - Débito bancario', emoji: '🏦' },
  { method: 'NEQUI', label: 'Nequi', emoji: '📱' },
  { method: 'EFECTIVO', label: 'Efectivo al recibir', emoji: '💵' },
];

type Step = 'address' | 'payment' | 'confirm';

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const { currentAddress, currentLocation } = useLocationStore();
  const [step, setStep] = useState<Step>('address');
  const [address, setAddress] = useState(currentAddress ?? '');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [placing, setPlacing] = useState(false);

  const subtotal = total;
  const delivery = 8900;
  const grandTotal = subtotal + delivery;

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      Toast.show({ type: 'error', text1: 'Ingresa una dirección de entrega' });
      return;
    }
    if (!selectedPayment) {
      Toast.show({ type: 'error', text1: 'Selecciona un método de pago' });
      return;
    }
    if (!currentLocation) {
      Toast.show({ type: 'error', text1: 'No se pudo obtener tu ubicación' });
      return;
    }

    Alert.alert(
      'Confirmar pedido',
      `Total a pagar: ${formatCOP(grandTotal)}\nMétodo: ${selectedPayment}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: async () => {
          setPlacing(true);
          try {
            const { data } = await apiClient.post(ENDPOINTS.ORDERS.CREATE, {
              items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity, price: i.product.discountPrice ?? i.product.price })),
              paymentMethod: selectedPayment,
              deliveryAddress: address,
              deliveryLocation: currentLocation,
            });
            clearCart();
            Toast.show({ type: 'success', text1: '¡Pedido confirmado!', text2: `Código: #${data.id.slice(-6).toUpperCase()}` });
            router.replace(`/tracking/${data.id}` as never);
          } catch (e: unknown) {
            Toast.show({ type: 'error', text1: 'Error al crear pedido', text2: (e as Error).message });
          } finally {
            setPlacing(false);
          }
        }},
      ]
    );
  };

  const steps: { key: Step; label: string }[] = [
    { key: 'address', label: 'Dirección' },
    { key: 'payment', label: 'Pago' },
    { key: 'confirm', label: 'Confirmar' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Stepper */}
      <View style={styles.stepper}>
        {steps.map((s, idx) => (
          <React.Fragment key={s.key}>
            <TouchableOpacity
              style={[styles.stepDot, step === s.key && styles.stepDotActive, steps.indexOf(steps.find(x => x.key === step)!) > idx && styles.stepDotDone]}
              onPress={() => {
                if (steps.indexOf(steps.find(x => x.key === step)!) > idx) setStep(s.key);
              }}
            >
              <Text style={[styles.stepNum, (step === s.key || steps.indexOf(steps.find(x => x.key === step)!) > idx) && styles.stepNumActive]}>
                {steps.indexOf(steps.find(x => x.key === step)!) > idx ? '✓' : idx + 1}
              </Text>
            </TouchableOpacity>
            {idx < steps.length - 1 && (
              <View style={[styles.stepLine, steps.indexOf(steps.find(x => x.key === step)!) > idx && styles.stepLineDone]} />
            )}
          </React.Fragment>
        ))}
      </View>
      <View style={styles.stepLabels}>
        {steps.map((s) => (
          <Text key={s.key} style={[styles.stepLabel, step === s.key && styles.stepLabelActive]}>{s.label}</Text>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {step === 'address' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>¿Dónde entregamos?</Text>
            <TextInput
              style={styles.addressInput}
              value={address}
              onChangeText={setAddress}
              placeholder="Calle, número, apartamento, ciudad..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor={colors.neutral[400]}
            />
            {currentAddress && (
              <TouchableOpacity style={styles.useCurrentBtn} onPress={() => setAddress(currentAddress)}>
                <Text style={styles.useCurrentText}>📍 Usar ubicación actual</Text>
              </TouchableOpacity>
            )}
            <Button title="Continuar" onPress={() => setStep('payment')} disabled={!address.trim()} fullWidth size="lg" style={{ marginTop: 20 }} />
          </View>
        )}

        {step === 'payment' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Método de pago</Text>
            {PAYMENT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.method}
                style={[styles.paymentOption, selectedPayment === opt.method && styles.paymentOptionSelected]}
                onPress={() => setSelectedPayment(opt.method)}
              >
                <Text style={styles.paymentEmoji}>{opt.emoji}</Text>
                <Text style={styles.paymentLabel}>{opt.label}</Text>
                <View style={[styles.radio, selectedPayment === opt.method && styles.radioSelected]}>
                  {selectedPayment === opt.method && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
            <Button title="Continuar" onPress={() => setStep('confirm')} disabled={!selectedPayment} fullWidth size="lg" style={{ marginTop: 20 }} />
          </View>
        )}

        {step === 'confirm' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumen del pedido</Text>

            <Card style={styles.summaryCard}>
              {items.map((item) => (
                <View key={item.product.id} style={styles.orderItem}>
                  <Text style={styles.orderItemName} numberOfLines={1}>{item.product.name}</Text>
                  <Text style={styles.orderItemQty}>x{item.quantity}</Text>
                  <Text style={styles.orderItemPrice}>{formatCOP((item.product.discountPrice ?? item.product.price) * item.quantity)}</Text>
                </View>
              ))}
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatCOP(subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Domicilio</Text>
                <Text style={styles.summaryValue}>{formatCOP(delivery)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatCOP(grandTotal)}</Text>
              </View>
            </Card>

            <Card style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoEmoji}>📍</Text>
                <Text style={styles.infoText} numberOfLines={2}>{address}</Text>
              </View>
              <View style={[styles.infoRow, { marginTop: 8 }]}>
                <Text style={styles.infoEmoji}>{PAYMENT_OPTIONS.find((p) => p.method === selectedPayment)?.emoji}</Text>
                <Text style={styles.infoText}>{PAYMENT_OPTIONS.find((p) => p.method === selectedPayment)?.label}</Text>
              </View>
            </Card>

            <Button
              title={placing ? 'Procesando...' : `Confirmar pedido · ${formatCOP(grandTotal)}`}
              onPress={handlePlaceOrder}
              isLoading={placing}
              fullWidth
              size="lg"
              style={{ marginTop: 16 }}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.white, borderBottomWidth: 0.5, borderBottomColor: colors.neutral[200] },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.neutral[100], alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 18, color: colors.navy[500] },
  title: { flex: 1, textAlign: 'center', fontSize: 17, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900] },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingTop: 20 },
  stepDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.neutral[200], alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: colors.navy[500] },
  stepDotDone: { backgroundColor: colors.semantic.success },
  stepNum: { fontSize: 13, fontFamily: 'Inter_700Bold', color: colors.neutral[500] },
  stepNumActive: { color: colors.white },
  stepLine: { flex: 1, height: 2, backgroundColor: colors.neutral[200] },
  stepLineDone: { backgroundColor: colors.semantic.success },
  stepLabels: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, paddingBottom: 8 },
  stepLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', color: colors.neutral[400] },
  stepLabelActive: { color: colors.navy[500], fontFamily: 'Inter_600SemiBold' },
  content: { padding: 16, paddingBottom: 40 },
  section: {},
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: colors.neutral[900], marginBottom: 16 },
  addressInput: { borderWidth: 1.5, borderColor: colors.neutral[200], borderRadius: 12, padding: 14, fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.neutral[900], backgroundColor: colors.white, minHeight: 90 },
  useCurrentBtn: { marginTop: 10, padding: 12, backgroundColor: colors.primary[50], borderRadius: 10, borderWidth: 1, borderColor: colors.primary[100], alignItems: 'center' },
  useCurrentText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: colors.primary[900] },
  paymentOption: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.white, borderRadius: 12, marginBottom: 10, borderWidth: 1.5, borderColor: colors.neutral[200] },
  paymentOptionSelected: { borderColor: colors.primary[500], backgroundColor: colors.primary[50] },
  paymentEmoji: { fontSize: 24, marginRight: 12 },
  paymentLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium', color: colors.neutral[900] },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.neutral[300], alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: colors.primary[500] },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary[500] },
  summaryCard: { marginBottom: 12 },
  orderItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  orderItemName: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.neutral[800] },
  orderItemQty: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.neutral[500], marginHorizontal: 8 },
  orderItemPrice: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900] },
  summaryDivider: { height: 0.5, backgroundColor: colors.neutral[200], marginVertical: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  summaryLabel: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.neutral[600] },
  summaryValue: { fontSize: 14, fontFamily: 'Inter_500Medium', color: colors.neutral[900] },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.neutral[200], paddingTop: 12, marginTop: 8 },
  totalLabel: { fontSize: 16, fontFamily: 'Inter_700Bold', color: colors.neutral[900] },
  totalValue: { fontSize: 18, fontFamily: 'Inter_700Bold', color: colors.navy[500] },
  infoCard: { marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoEmoji: { fontSize: 20 },
  infoText: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.neutral[700] },
});
