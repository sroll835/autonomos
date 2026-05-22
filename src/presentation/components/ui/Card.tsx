import React from 'react';
import { View, Pressable, StyleSheet, Platform, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing, radius } from '../../theme/tokens/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  padding?: number;
  /**
   * `light` (default): blanco suave sobre dark stage — patrón spotlight luxury.
   * `dark`: superficie oscura para casos donde se necesita continuidad con el bg negro.
   */
  variant?: 'light' | 'dark';
  /** Si true añade shadow.spotlight (chrome glow en iOS/Web, elevation Android). */
  glow?: boolean;
}

/**
 * Card — superficie spotlight sobre fondo dark.
 *
 * Default `light`: bg #F4F4F5, border subtle, optional glow chrome.
 * El TEXTO interior debe ir con theme.colors.textOnLight / textOnLightSecondary
 * cuando variant es light. Iconos también en color oscuro.
 *
 * onPress: Pressable con tono ligeramente más oscuro al press (físico).
 */
export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  padding = spacing.lg,
  variant = 'light',
  glow = false,
}) => {
  const theme = useTheme();

  const isLight = variant === 'light';
  const bg = isLight ? theme.colors.cardLight : theme.colors.surface;
  const borderColor = isLight ? theme.colors.cardLightBorder : theme.colors.border;
  const pressedBg = isLight ? '#E5E5E7' : theme.colors.surfaceRaised;

  const baseStyle: ViewStyle = {
    backgroundColor: bg,
    borderColor,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding,
    overflow: 'hidden',
  };

  const glowStyle: ViewStyle | undefined = glow
    ? (Platform.select({
        ios: {
          shadowColor: theme.colors.chrome,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.18,
          shadowRadius: 18,
        },
        android: { elevation: 6 },
        web: { boxShadow: `0 0 24px ${theme.colors.chromeGlow}` } as ViewStyle,
        default: {},
      }) as ViewStyle)
    : undefined;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          baseStyle,
          glowStyle,
          style,
          pressed && { backgroundColor: pressedBg },
        ]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[baseStyle, glowStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({});
