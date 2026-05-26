import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing, radius } from '../../theme/tokens/spacing';
import { typography } from '../../theme/tokens/typography';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default' | 'emergency';
type BadgeStyle = 'filled' | 'outlined';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  badgeStyle?: BadgeStyle;
  style?: ViewStyle;
}

/**
 * Badge JuanCode — outlined sutil sobre dark glass.
 * Filled usa surface + texto del color del variant. Outlined sin fill.
 */
export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  badgeStyle = 'filled',
  style,
}) => {
  const theme = useTheme();

  const colorMap: Record<BadgeVariant, string> = {
    success:   theme.colors.success,
    warning:   theme.colors.warning,
    danger:    theme.colors.danger,
    info:      theme.colors.info,
    emergency: theme.colors.emergency,
    default:   theme.colors.textSecondary,
  };

  const color = colorMap[variant];
  const bg = badgeStyle === 'filled' ? theme.colors.surface : 'transparent';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg, borderColor: color, borderRadius: 999 },
        style,
      ]}
    >
      <Text style={[typography.overline, { color, textTransform: 'none', letterSpacing: 0.5, fontSize: 11 }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});
