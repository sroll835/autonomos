import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { colors } from '../../theme/colors';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/** Skeleton animado para estados de carga */
export const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 16, borderRadius = 8, style }) => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[{ width: width as number, height, borderRadius, backgroundColor: colors.neutral[200] }, animStyle, style]} />
  );
};

/** Skeleton de tarjeta de producto */
export const ProductCardSkeleton: React.FC = () => (
  <View style={skeletonStyles.card}>
    <Skeleton height={140} borderRadius={8} style={{ marginBottom: 8 }} />
    <Skeleton height={14} style={{ marginBottom: 6 }} />
    <Skeleton height={14} width="60%" style={{ marginBottom: 8 }} />
    <Skeleton height={20} width="40%" />
  </View>
);

const skeletonStyles = StyleSheet.create({
  card: { padding: 12, backgroundColor: colors.white, borderRadius: 12, marginBottom: 12 },
});
