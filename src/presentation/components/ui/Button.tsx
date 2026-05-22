import React, { useMemo } from 'react';
import { Pressable, Text, ActivityIndicator, View, Platform, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { typography } from '../../theme/tokens/typography';
import { spacing, radius } from '../../theme/tokens/spacing';

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

const HEIGHTS: Record<ButtonSize, number> = { sm: 36, md: 44, lg: 52 };

/**
 * Button — automotive luxury chiaroscuro.
 *
 * 4 variants:
 *  - primary: CTA blanco sobre negro, glow chrome (iOS/Web; Android elevation)
 *  - secondary: transparente, borde chrome
 *  - ghost: transparente, sin borde, texto secundario
 *  - danger: transparente, borde y texto en danger (apagado)
 *
 * RN puro: Pressable + pressed state via children-as-function.
 * Glow via Platform.select — Android cae a elevation gris (limitación nativa documentada).
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const theme = useTheme();
  const isDisabled = disabled || isLoading;
  const height = HEIGHTS[size];
  const paddingHorizontal = size === 'sm' ? spacing.md : spacing.lg;

  const v = useMemo(() => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: theme.colors.ctaPrimary,
            ...Platform.select({
              ios: {
                shadowColor: theme.colors.chrome,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.16,
                shadowRadius: 20,
              },
              android: { elevation: 8 },
              web: { boxShadow: `0 0 24px ${theme.colors.chromeGlow}` } as ViewStyle,
              default: {},
            }),
          } as ViewStyle,
          text: { color: theme.colors.ctaPrimaryText },
          spinner: theme.colors.ctaPrimaryText,
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: theme.colors.chrome,
          } as ViewStyle,
          text: { color: theme.colors.textPrimary },
          spinner: theme.colors.textPrimary,
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent' } as ViewStyle,
          text: { color: theme.colors.textSecondary },
          spinner: theme.colors.textSecondary,
        };
      case 'danger':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: theme.colors.danger,
          } as ViewStyle,
          text: { color: theme.colors.danger },
          spinner: theme.colors.danger,
        };
    }
  }, [variant, theme]);

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { height, paddingHorizontal, borderRadius: radius.md },
        v.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && variant === 'primary' && { opacity: 0.88 },
        style,
      ]}
    >
      {({ pressed }) => (
        <>
          {pressed && !isDisabled && variant !== 'primary' && (
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                { backgroundColor: theme.colors.pressed, borderRadius: radius.md },
              ]}
            />
          )}
          {isLoading ? (
            <ActivityIndicator color={v.spinner} size="small" />
          ) : (
            <Text style={[typography.button, v.text, textStyle]}>{title}</Text>
          )}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.4 },
});
