import React, { useMemo } from 'react';
import { Pressable, Text, ActivityIndicator, View, Platform, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

const HEIGHTS: Record<ButtonSize, number> = { sm: 40, md: 48, lg: 56 };

/**
 * Button JuanCode.
 *
 * - primary: pill (radius 999) con fill LinearGradient brand + texto oscuro
 * - secondary: surface glass + borde borderStrong + texto claro
 * - ghost: transparente, sin borde, texto secondary
 * - danger: surface + borde danger + texto danger
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
  const borderRadius = variant === 'primary' || variant === 'secondary' ? 999 : radius.md;

  const isPrimary = variant === 'primary';

  const nonPrimary = useMemo(() => {
    switch (variant) {
      case 'secondary':
        return {
          container: {
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.borderStrong,
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
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.danger,
          } as ViewStyle,
          text: { color: theme.colors.danger },
          spinner: theme.colors.danger,
        };
      default:
        return null;
    }
  }, [variant, theme]);

  if (isPrimary) {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.base,
          {
            height,
            borderRadius,
            ...Platform.select({
              ios: {
                shadowColor: theme.gradient.g3,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.35,
                shadowRadius: 24,
              },
              android: { elevation: 10 },
              web: { boxShadow: `0 0 28px rgba(168, 85, 247, 0.32)` } as ViewStyle,
              default: {},
            }),
          },
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          pressed && !isDisabled && { opacity: 0.9 },
          style,
        ]}
      >
        <LinearGradient
          colors={theme.gradient.stops as any}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[StyleSheet.absoluteFillObject, { borderRadius }]}
        />
        {isLoading ? (
          <ActivityIndicator color={theme.colors.textOnGradient} size="small" />
        ) : (
          <Text
            style={[
              typography.button,
              { color: theme.colors.textOnGradient, paddingHorizontal },
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
      </Pressable>
    );
  }

  // secondary / ghost / danger
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { height, paddingHorizontal, borderRadius },
        nonPrimary!.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {({ pressed }) => (
        <>
          {pressed && !isDisabled && (
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                { backgroundColor: theme.colors.pressed, borderRadius },
              ]}
            />
          )}
          {isLoading ? (
            <ActivityIndicator color={nonPrimary!.spinner} size="small" />
          ) : (
            <Text style={[typography.button, nonPrimary!.text, textStyle]}>{title}</Text>
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
