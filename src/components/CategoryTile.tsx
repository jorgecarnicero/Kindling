import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/theme';

type Props = { label: string; hint: string; selected: boolean; onPress: () => void };

/** A toggleable category card for the Home grid. */
export function CategoryTile({ label, hint, selected, onPress }: Props) {
  const { colors, spacing, radius, fontSize } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      accessibilityHint={hint}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: colors.surface,
          borderColor: selected ? colors.accent : colors.border,
          borderWidth: selected ? 2 : 1,
          // Keep the content still when the border thickens.
          padding: selected ? spacing.md - 1 : spacing.md,
          borderRadius: radius.md,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={styles.top}>
        <Text style={[styles.label, { color: colors.text, fontSize: fontSize.body }]}>{label}</Text>
        <View
          style={[
            styles.check,
            {
              borderColor: selected ? colors.accent : colors.border,
              backgroundColor: selected ? colors.accent : 'transparent',
            },
          ]}
        >
          {selected ? (
            <Svg width={12} height={12} viewBox="0 0 24 24">
              <Path
                d="M5 12.5l4.5 4.5L19 7.5"
                stroke={colors.onAccent}
                strokeWidth={3.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          ) : null}
        </View>
      </View>
      <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>{hint}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, minHeight: 96 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  label: { flex: 1, fontWeight: '700' },
  check: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});
