import React from 'react';
import { View, StyleSheet, ViewStyle, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';

interface SafeScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  backgroundColor?: string;
}

/** Pantalla segura que maneja notch y barras del sistema */
export const SafeScreen: React.FC<SafeScreenProps> = ({
  children, style, scrollable = false, onRefresh, isRefreshing = false, backgroundColor = colors.neutral[50],
}) => {
  if (scrollable) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, style]}
          showsVerticalScrollIndicator={false}
          refreshControl={onRefresh ? <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} /> : undefined}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }, style]}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { flexGrow: 1, padding: 16 },
});
