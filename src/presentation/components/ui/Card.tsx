import React from 'react';
import { View, Pressable, StyleSheet, Platform, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing, radius } from '../../theme/tokens/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  padding?: number;
  /** Eleva la card con sombra (úsalo para focos principales: modales, hero). Default false. */
  elevated?: boolean;
}

/**
 * Card — superficie de agrupación.
 *
 * Default: background `surface`, border 1px `border`. Sin sombra.
 * elevated=true: añade `shadow.drop` (iOS shadow / Android elevation / Web boxShadow).
 * onPress: usa Pressable con overlay `pressed` semitransparente.
 */
export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  padding = spacing.lg,
  elevated = false,
}) => {
  const theme = useTheme();

  const baseStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding,
    overflow: 'hidden',
  };

  const elevatedStyle: ViewStyle | undefined = elevated
    ? (Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
        },
        android: { elevation: 6 },
        web: { boxShadow: '0 4px 24px rgba(0, 0, 0, 0.5)' } as ViewStyle,
        default: {},
      }) as ViewStyle)
    : undefined;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          baseStyle,
          elevatedStyle,
          style,
          pressed && { backgroundColor: theme.colors.surfaceRaised },
        ]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[baseStyle, elevatedStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({});
