import React, { useState, useRef } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, TextInputProps, Animated } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { typography } from '../../theme/tokens/typography';
import { spacing, radius } from '../../theme/tokens/spacing';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

/**
 * Input JuanCode — glassmorphism + focus cyan.
 *
 * Background: surface (rgba blanco 0.04 glass)
 * Border default: border (rgba 0.10)
 * Border focus: borderFocus (#22D3EE cian g1)
 * Border error: danger (#FB7185)
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  value,
  onFocus,
  onBlur,
  ...props
}) => {
  const theme = useTheme();
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

  const labelTop = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 6] });
  const labelFontSize = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 11] });
  const labelColor = error
    ? theme.colors.danger
    : isFocused
    ? theme.colors.chrome
    : theme.colors.textSecondary;

  const borderColor = error
    ? theme.colors.danger
    : isFocused
    ? theme.colors.borderFocus
    : theme.colors.border;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor,
            borderRadius: radius.md,
          },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <View style={styles.inputWrapper}>
          <Animated.Text
            style={[
              styles.label,
              {
                top: labelTop,
                fontSize: labelFontSize,
                color: labelColor,
                fontFamily: 'Manrope_500Medium',
                letterSpacing: 0.2,
              },
            ]}
          >
            {label}
          </Animated.Text>
          <TextInput
            style={[
              {
                fontFamily: 'Manrope_400Regular',
                fontSize: 16,
                color: theme.colors.textPrimary,
                paddingTop: 22,
                paddingBottom: 8,
              },
              leftIcon ? styles.inputWithLeft : null,
            ]}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor={theme.colors.textTertiary}
            selectionColor={theme.colors.chrome}
            {...props}
          />
        </View>
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text
          style={[
            typography.caption,
            { color: theme.colors.danger, marginTop: spacing.xs, marginLeft: spacing.xs },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 60,
  },
  inputWrapper: { flex: 1, paddingHorizontal: spacing.md, justifyContent: 'center', minHeight: 60 },
  label: { position: 'absolute', left: spacing.md, zIndex: 1 },
  inputWithLeft: { paddingLeft: 0 },
  leftIcon: { paddingLeft: spacing.md },
  rightIcon: { paddingRight: spacing.md },
});
