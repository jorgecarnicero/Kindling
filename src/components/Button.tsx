import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

export function Button({ label, onPress, variant = 'primary', disabled = false }: Props) {
  const { colors, radius, fontSize } = useTheme();
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          borderRadius: radius.pill,
          backgroundColor: primary ? colors.accent : colors.surface,
          borderColor: primary ? colors.accent : colors.border,
          opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text
        style={{
          color: primary ? colors.onAccent : colors.text,
          fontSize: fontSize.body,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 52, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});
