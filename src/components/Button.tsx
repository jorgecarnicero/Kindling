import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/theme';

type Props = { label: string; onPress: () => void; variant?: 'primary' | 'secondary' };

export function Button({ label, onPress, variant = 'primary' }: Props) {
  const { colors, radius, fontSize } = useTheme();
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          borderRadius: radius.pill,
          backgroundColor: primary ? colors.accent : colors.surface,
          borderColor: primary ? colors.accent : colors.border,
          opacity: pressed ? 0.8 : 1,
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
