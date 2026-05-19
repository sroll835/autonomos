import React, { useState, useRef } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, TextInputProps, Animated } from 'react-native';
import { colors } from '../../theme/colors';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

/** Input con label flotante, iconos y estado de error */
export const Input: React.FC<InputProps> = ({
  label, error, leftIcon, rightIcon, onRightIconPress, value, onFocus, onBlur, ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
    setIsFocused(true);
    Animated.timing(labelAnim, { toValue: 1, duration: 150, useNativeDriver: false }).start();
    onFocus?.(e);
  };

  const handleBlur = (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(labelAnim, { toValue: 0, duration: 150, useNativeDriver: false }).start();
    }
    onBlur?.(e);
  };

  const labelTop = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 4] });
  const labelFontSize = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 12] });
  const labelColor = error ? colors.semantic.emergency : isFocused ? colors.primary[500] : colors.neutral[500];

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, isFocused && styles.focused, !!error && styles.errorBorder]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <View style={styles.inputWrapper}>
          <Animated.Text style={[styles.label, { top: labelTop, fontSize: labelFontSize, color: labelColor }]}>
            {label}
          </Animated.Text>
          <TextInput
            style={[styles.input, leftIcon ? styles.inputWithLeft : null]}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor={colors.neutral[300]}
            {...props}
          />
        </View>
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.neutral[50], borderRadius: 12,
    borderWidth: 1, borderColor: colors.neutral[200], minHeight: 56,
  },
  focused: { borderColor: colors.primary[500] },
  errorBorder: { borderColor: colors.semantic.emergency },
  inputWrapper: { flex: 1, paddingHorizontal: 16, justifyContent: 'center', minHeight: 56 },
  label: { position: 'absolute', left: 16, fontFamily: 'Inter_400Regular', zIndex: 1 },
  input: { fontSize: 16, fontFamily: 'Inter_400Regular', color: colors.neutral[900], paddingTop: 20, paddingBottom: 6 },
  inputWithLeft: { paddingLeft: 0 },
  leftIcon: { paddingLeft: 16 },
  rightIcon: { paddingRight: 16 },
  errorText: { marginTop: 4, fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.semantic.emergency, marginLeft: 4 },
});
