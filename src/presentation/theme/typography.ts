import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const typography = StyleSheet.create({
  h1: { fontSize: 28, fontFamily: 'Inter_700Bold', color: colors.neutral[900] },
  h2: { fontSize: 22, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900] },
  h3: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900] },
  body: { fontSize: 16, fontFamily: 'Inter_400Regular', color: colors.neutral[700] },
  bodyMedium: { fontSize: 16, fontFamily: 'Inter_500Medium', color: colors.neutral[700] },
  caption: { fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.neutral[500] },
  button: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  label: { fontSize: 14, fontFamily: 'Inter_500Medium', color: colors.neutral[700] },
});
