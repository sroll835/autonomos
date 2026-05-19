import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../../theme/colors';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  style?: ViewStyle;
}

/** Avatar con fallback a iniciales del nombre */
export const Avatar: React.FC<AvatarProps> = ({ uri, name, size = 40, style }) => {
  const initials = name ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() : '?';

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
        contentFit="cover"
        placeholder={{ blurhash: 'LEHLh[WB2yk8pyoJadR*.7kCMdnj' }}
      />
    );
  }

  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }, style]}>
      <Text style={[styles.initials, { fontSize: size * 0.35 }]}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: { backgroundColor: colors.navy[400], alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.white, fontFamily: 'Inter_600SemiBold' },
});
