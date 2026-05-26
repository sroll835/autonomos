import React from 'react';
import { View, Pressable, StyleSheet, Platform, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing, radius } from '../../theme/tokens/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  padding?: number;
  /** Variante con bg `grad-soft` (degradado tenue de marca). Cards destacadas. */
  highlighted?: boolean;
  /** Sombra glow oscuro suave. */
  glow?: boolean;
}

/**
 * Card JuanCode — glassmorphism.
 *
 * Default: bg `surface` (rgba blanco 0.04), borde `border` (rgba 0.10), radius lg.
 * highlighted=true: fondo LinearGradient con `gradient.soft` para cards de
 * énfasis (hero, ofertas destacadas).
 *
 * El texto/icono interior debe ir con theme.colors.textPrimary/textSecondary
 * (cards SIEMPRE son dark glass — no hay variante light).
 */
export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  padding = spacing.lg,
  highlighted = false,
  glow = false,
}) => {
  const theme = useTheme();

  const baseStyle: ViewStyle = {
    backgroundColor: highlighted ? 'transparent' : theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding,
    overflow: 'hidden',
  };

  const glowStyle: ViewStyle | undefined = glow
    ? (Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.5,
          shadowRadius: 24,
        },
        android: { elevation: 8 },
        web: { boxShadow: '0 12px 32px rgba(0, 0, 0, 0.55)' } as ViewStyle,
        default: {},
      }) as ViewStyle)
    : undefined;

  const content = highlighted ? (
    <>
      <LinearGradient
        colors={theme.gradient.soft as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { borderRadius: radius.lg }]}
      />
      {children}
    </>
  ) : (
    children
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          baseStyle,
          glowStyle,
          style,
          pressed && { backgroundColor: theme.colors.surfaceRaised },
        ]}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={[baseStyle, glowStyle, style]}>{content}</View>;
};

const styles = StyleSheet.create({});
