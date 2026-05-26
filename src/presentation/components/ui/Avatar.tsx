import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../theme/ThemeProvider';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  style?: ViewStyle;
}

/**
 * Avatar JuanCode con fallback a iniciales.
 * Fallback bg: surfaceRaised glass · border: borderStrong
 * Iniciales: textPrimary Manrope 600
 */
export const Avatar: React.FC<AvatarProps> = ({ uri, name, size = 40, style }) => {
  const theme = useTheme();
  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '·';

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1,
            borderColor: theme.colors.border,
          },
          style as any,
        ]}
        contentFit="cover"
        placeholder={{ blurhash: 'LEHLh[WB2yk8pyoJadR*.7kCMdnj' }}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.colors.surfaceRaised,
          borderWidth: 1,
          borderColor: theme.colors.borderStrong,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize: size * 0.36,
            color: theme.colors.textPrimary,
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { fontFamily: 'Manrope_600SemiBold', letterSpacing: 0.5 },
});
