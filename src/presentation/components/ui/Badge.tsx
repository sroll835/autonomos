import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';
type BadgeStyle = 'filled' | 'outlined';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  badgeStyle?: BadgeStyle;
  style?: ViewStyle;
}

const VARIANT_CONFIG = {
  success: { bg: '#E6F9F2', border: colors.semantic.success, text: colors.semantic.success },
  warning: { bg: '#FFF3E8', border: colors.semantic.warning, text: colors.semantic.warning },
  danger:  { bg: '#FEE8E6', border: colors.semantic.emergency, text: colors.semantic.emergency },
  info:    { bg: '#E8F0FE', border: colors.semantic.info, text: colors.semantic.info },
  default: { bg: colors.neutral[100], border: colors.neutral[300], text: colors.neutral[700] },
};

/** Badge de estado con variantes filled y outlined */
export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', badgeStyle = 'filled', style }) => {
  const config = VARIANT_CONFIG[variant];
  return (
    <View style={[
      styles.badge,
      badgeStyle === 'filled' ? { backgroundColor: config.bg } : { backgroundColor: 'transparent' },
      { borderColor: config.border },
      style,
    ]}>
      <Text style={[styles.text, { color: config.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, alignSelf: 'flex-start' },
  text: { fontSize: 12, fontFamily: 'Inter_500Medium' },
});
