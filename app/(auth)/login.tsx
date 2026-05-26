import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Eye, EyeOff } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/presentation/stores/authStore';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { GradientText } from '@/presentation/components/ui/GradientText';
import { loginSchema, LoginFormData } from '@/shared/validations/authValidations';
import { useTheme } from '@/presentation/theme/ThemeProvider';
import { typography } from '@/presentation/theme/tokens/typography';
import { spacing } from '@/presentation/theme/tokens/spacing';

export default function LoginScreen() {
  const router = useRouter();
  const theme = useTheme();
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo horizontal AUTONOMOS */}
        <View style={styles.logoBlock}>
          <Image
            source={require('../../image/logo_largo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[typography.body, { color: theme.colors.textSecondary, marginTop: spacing.lg, textAlign: 'center', letterSpacing: 0.5 }]}>
            Todo para ti y tu vehículo
          </Text>
        </View>

        {/* Heading con sello degradado */}
        <View style={styles.headingBlock}>
          <Text style={[typography.h2, { color: theme.colors.textPrimary, textAlign: 'center' }]}>
            Bienvenido de{'  '}
            <GradientText style={typography.h2}>vuelta</GradientText>
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
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
                rightIcon={
                  showPassword
                    ? <EyeOff size={20} color={theme.colors.textSecondary} strokeWidth={1.5} />
                    : <Eye size={20} color={theme.colors.textSecondary} strokeWidth={1.5} />
                }
                onRightIconPress={() => setShowPassword(!showPassword)}
              />
            )}
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password' as never)}
            style={styles.forgotBtn}
          >
            <Text style={[typography.caption, { color: theme.colors.chrome, letterSpacing: 0.4 }]}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          <Button
            title="Iniciar sesión"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            fullWidth
            size="lg"
            style={{ marginTop: spacing.lg }}
          />

          <View style={styles.registerRow}>
            <Text style={[typography.body, { color: theme.colors.textSecondary }]}>
              ¿No tienes cuenta?{'  '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={[typography.body, { color: theme.colors.chrome, fontFamily: 'Manrope_600SemiBold' }]}>
                Crear cuenta
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['2xl'],
  },
  logoBlock: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 260,
    height: 64,
  },
  headingBlock: {
    marginBottom: spacing.xl,
  },
  form: { flex: 1 },
  forgotBtn: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.sm,
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
    alignItems: 'center',
  },
});
