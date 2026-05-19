import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

/** Componente botón base con variantes y estado de carga */
export const Button: React.FC<ButtonProps> = ({
  title, onPress, variant = 'primary', size = 'md',
  isLoading = false, disabled = false, style, textStyle, fullWidth = false,
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.navy[500] : colors.primary[500]} size="small" />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: { borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  // Variantes
  primary: { backgroundColor: colors.primary[500] },
  secondary: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary[500] },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.semantic.emergency },
  // Tamaños
  size_sm: { paddingVertical: 8, paddingHorizontal: 16, height: 36 },
  size_md: { paddingVertical: 12, paddingHorizontal: 24, height: 48 },
  size_lg: { paddingVertical: 16, paddingHorizontal: 32, height: 56 },
  // Texto
  text: { fontFamily: 'Inter_600SemiBold' },
  text_primary: { color: colors.navy[500] },
  text_secondary: { color: colors.primary[500] },
  text_ghost: { color: colors.primary[500] },
  text_danger: { color: colors.white },
  textSize_sm: { fontSize: 13 },
  textSize_md: { fontSize: 15 },
  textSize_lg: { fontSize: 16 },
});
