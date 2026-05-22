import React from 'react';
import { View, StyleSheet, ViewStyle, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/tokens/spacing';

interface SafeScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  /** Override del background del screen. Por default usa theme.colors.background. */
  backgroundColor?: string;
}

/**
 * Pantalla segura — maneja notch y barras del sistema.
 * Por default usa `theme.colors.background` (negro void).
 * `backgroundColor` permite override puntual si el screen necesita otra superficie.
 */
export const SafeScreen: React.FC<SafeScreenProps> = ({
  children,
  style,
  scrollable = false,
  onRefresh,
  isRefreshing = false,
  backgroundColor,
}) => {
  const theme = useTheme();
  const bg = backgroundColor ?? theme.colors.background;

  if (scrollable) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, style]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.chrome}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }, style]}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { flexGrow: 1, padding: spacing.md },
});
