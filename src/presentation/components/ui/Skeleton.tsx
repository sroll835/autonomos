import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/tokens/spacing';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/** Skeleton JuanCode — surface glass con shimmer sutil */
export const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 16, borderRadius = radius.md, style }) => {
  const theme = useTheme();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: theme.colors.surfaceRaised,
        },
        animStyle,
        style,
      ]}
    />
  );
};

/** Skeleton de tarjeta de producto */
export const ProductCardSkeleton: React.FC = () => {
  const theme = useTheme();
  return (
    <View
      style={{
        padding: spacing.sm + 4,
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: radius.lg,
        marginBottom: spacing.sm + 4,
      }}
    >
      <Skeleton height={140} borderRadius={radius.md} style={{ marginBottom: spacing.sm }} />
      <Skeleton height={14} style={{ marginBottom: spacing.xs + 2 }} />
      <Skeleton height={14} width={'60%' as any} style={{ marginBottom: spacing.sm }} />
      <Skeleton height={20} width={'40%' as any} />
    </View>
  );
};
