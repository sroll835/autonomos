import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightComponent?: React.ReactNode;
}

/** Header de navegación con opción de botón atrás */
export const Header: React.FC<HeaderProps> = ({ title, showBack = false, rightComponent }) => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      {showBack && (
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      )}
      <Text style={[styles.title, showBack && styles.titleWithBack]}>{title}</Text>
      {rightComponent && <View style={styles.right}>{rightComponent}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.white, borderBottomWidth: 0.5, borderBottomColor: colors.neutral[200] },
  backButton: { marginRight: 12 },
  backIcon: { fontSize: 22, color: colors.navy[500] },
  title: { flex: 1, fontSize: 18, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900] },
  titleWithBack: { textAlign: 'center', marginRight: 40 },
  right: { marginLeft: 'auto' },
});
