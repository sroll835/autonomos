import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../theme/ThemeProvider';
import { typography } from '../../theme/tokens/typography';
import { spacing } from '../../theme/tokens/spacing';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  rightComponent?: React.ReactNode;
  /** Si true muestra el logo_largo en lugar del title. Default false. */
  logo?: boolean;
}

/**
 * Header JuanCode — bg blur translúcido sobre dark.
 * - `logo=true` muestra logo_largo.png horizontal.
 * - showBack: icono Lucide ChevronLeft.
 */
export const Header: React.FC<HeaderProps> = ({ title, showBack = false, rightComponent, logo = false }) => {
  const router = useRouter();
  const theme = useTheme();

  return (
    <BlurView
      intensity={Platform.OS === 'ios' ? 30 : 60}
      tint="dark"
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.bg2 + 'CC',
          borderBottomColor: theme.colors.borderSubtle,
        },
      ]}
    >
      {showBack && (
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={24} color={theme.colors.textPrimary} strokeWidth={1.5} />
        </TouchableOpacity>
      )}
      {logo ? (
        <Image
          source={require('../../../../image/logo_largo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      ) : (
        <Text style={[typography.h3, { color: theme.colors.textPrimary, flex: 1 }, showBack && styles.titleWithBack]}>
          {title}
        </Text>
      )}
      {rightComponent && <View style={styles.right}>{rightComponent}</View>}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
  },
  backButton: { marginRight: spacing.sm + 4 },
  logo: { flex: 1, height: 28 },
  titleWithBack: { textAlign: 'center', marginRight: 40 },
  right: { marginLeft: 'auto' },
});
