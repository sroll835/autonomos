import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/presentation/stores/authStore';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { loginSchema, LoginFormData } from '@/shared/validations/authValidations';
import { colors } from '@/presentation/theme/colors';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      router.replace('/(tabs)');
    } catch (e: unknown) {
      Toast.show({ type: 'error', text1: 'Error al iniciar sesión', text2: (e as Error).message });
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>AUTONOMOS</Text>
          <Text style={styles.tagline}>Todo para ti y tu vehículo</Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          <Text style={styles.title}>Iniciar sesión</Text>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Correo electrónico"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Contraseña"
                value={value}
                onChangeText={onChange}
                secureTextEntry={!showPassword}
                error={errors.password?.message}
                rightIcon={<Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />
            )}
          />

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password' as never)} style={styles.forgotBtn}>
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <Button title="Iniciar sesión" onPress={handleSubmit(onSubmit)} isLoading={isLoading} fullWidth size="lg" style={styles.submitBtn} />

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerLink}>Crear cuenta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scroll: { flexGrow: 1, padding: 24 },
  logoContainer: { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
  logo: { fontSize: 32, fontFamily: 'Inter_700Bold', color: colors.navy[500], letterSpacing: 2 },
  tagline: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.neutral[500], marginTop: 4 },
  form: { flex: 1 },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold', color: colors.neutral[900], marginBottom: 24 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24, marginTop: -8 },
  forgotText: { color: colors.primary[600], fontFamily: 'Inter_500Medium', fontSize: 14 },
  submitBtn: { marginBottom: 24 },
  registerRow: { flexDirection: 'row', justifyContent: 'center' },
  registerText: { color: colors.neutral[500], fontFamily: 'Inter_400Regular' },
  registerLink: { color: colors.primary[600], fontFamily: 'Inter_600SemiBold' },
  eyeIcon: { fontSize: 18 },
});
