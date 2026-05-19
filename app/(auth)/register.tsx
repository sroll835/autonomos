import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/presentation/stores/authStore';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { registerSchema, RegisterFormData } from '@/shared/validations/authValidations';
import { colors } from '@/presentation/theme/colors';
import { User } from '@/domain/entities/User';

const ROLES: { value: User['role']; label: string; description: string; emoji: string }[] = [
  { value: 'CONDUCTOR', label: 'Conductor', description: 'Necesito servicios para mi vehículo', emoji: '🚗' },
  { value: 'TALLER', label: 'Taller', description: 'Tengo un taller mecánico', emoji: '🔧' },
  { value: 'AUTONOMO', label: 'Autónomo', description: 'Presto servicios independientes', emoji: '⚙️' },
  { value: 'EMPRESA', label: 'Empresa', description: 'Gestiono una flota vehicular', emoji: '🏢' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<User['role']>('CONDUCTOR');

  const { control, handleSubmit, formState: { errors }, setValue } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'CONDUCTOR' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({ name: data.name, email: data.email, phone: data.phone, password: data.password, role: data.role });
      router.replace('/(tabs)');
    } catch (e: unknown) {
      Toast.show({ type: 'error', text1: 'Error al registrarse', text2: (e as Error).message });
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Crear cuenta</Text>
        </View>

        {/* Selección de rol */}
        <Text style={styles.roleTitle}>¿Cómo usarás AUTONOMOS?</Text>
        <View style={styles.rolesGrid}>
          {ROLES.map((role) => (
            <TouchableOpacity
              key={role.value}
              style={[styles.roleCard, selectedRole === role.value && styles.roleCardActive]}
              onPress={() => { setSelectedRole(role.value); setValue('role', role.value); }}
            >
              <Text style={styles.roleEmoji}>{role.emoji}</Text>
              <Text style={[styles.roleLabel, selectedRole === role.value && styles.roleLabelActive]}>{role.label}</Text>
              <Text style={styles.roleDesc}>{role.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Campos del formulario */}
        <View style={styles.form}>
          <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
            <Input label="Nombre completo" value={value} onChangeText={onChange} autoCapitalize="words" error={errors.name?.message} />
          )} />
          <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
            <Input label="Correo electrónico" value={value} onChangeText={onChange} keyboardType="email-address" autoCapitalize="none" error={errors.email?.message} />
          )} />
          <Controller control={control} name="phone" render={({ field: { onChange, value } }) => (
            <Input label="Teléfono" value={value} onChangeText={onChange} keyboardType="phone-pad" error={errors.phone?.message} />
          )} />
          <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
            <Input label="Contraseña" value={value} onChangeText={onChange} secureTextEntry error={errors.password?.message} />
          )} />
          <Controller control={control} name="confirmPassword" render={({ field: { onChange, value } }) => (
            <Input label="Confirmar contraseña" value={value} onChangeText={onChange} secureTextEntry error={errors.confirmPassword?.message} />
          )} />
        </View>

        <Button title="Crear cuenta" onPress={handleSubmit(onSubmit)} isLoading={isLoading} fullWidth size="lg" style={styles.submitBtn} />

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.loginLink}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scroll: { flexGrow: 1, padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, marginBottom: 24 },
  backBtn: { marginRight: 16 },
  backIcon: { fontSize: 22, color: colors.navy[500] },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold', color: colors.neutral[900] },
  roleTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: colors.neutral[700], marginBottom: 12 },
  rolesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  roleCard: { width: '47%', padding: 16, borderRadius: 12, borderWidth: 1.5, borderColor: colors.neutral[200], backgroundColor: colors.neutral[50] },
  roleCardActive: { borderColor: colors.primary[500], backgroundColor: colors.primary[50] },
  roleEmoji: { fontSize: 24, marginBottom: 6 },
  roleLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.neutral[700], marginBottom: 4 },
  roleLabelActive: { color: colors.navy[500] },
  roleDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.neutral[500], lineHeight: 16 },
  form: {},
  submitBtn: { marginTop: 8, marginBottom: 20 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 24 },
  loginText: { color: colors.neutral[500], fontFamily: 'Inter_400Regular' },
  loginLink: { color: colors.primary[600], fontFamily: 'Inter_600SemiBold' },
});
