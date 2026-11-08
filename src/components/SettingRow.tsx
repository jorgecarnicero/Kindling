import { ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useTheme } from '@/theme';

export function SettingSection({ title, children }: { title: string; children: ReactNode }) {
  const { colors, spacing, radius } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={[styles.sectionTitle, { color: colors.accent }]}>{title.toUpperCase()}</Text>
      <View
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
        }}
      >
        {children}
      </View>
    </View>
  );
}

type ToggleProps = { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void };

/** A whole-row toggle: tapping the label flips it too (bigger touch target). */
export function ToggleRow({ label, hint, value, onChange }: ToggleProps) {
  const { colors, spacing, fontSize } = useTheme();
  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      accessibilityHint={hint}
      style={[styles.row, { paddingVertical: spacing.md, gap: spacing.md }]}
    >
      <View style={styles.grow}>
        <Text style={{ color: colors.text, fontSize: fontSize.body }}>{label}</Text>
        {hint ? <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 2 }}>{hint}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.accent, false: colors.border }}
        thumbColor={colors.switchThumb}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    </Pressable>
  );
}

type Option<T extends string> = { value: T; label: string };
type ChoiceProps<T extends string> = {
  label?: string;
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
};

/** Segmented control for a small set of choices. */
export function ChoiceRow<T extends string>({ label, options, value, onChange }: ChoiceProps<T>) {
  const { colors, spacing, radius, fontSize } = useTheme();
  return (
    <View style={{ paddingVertical: spacing.md, gap: spacing.sm }}>
      {label ? <Text style={{ color: colors.text, fontSize: fontSize.body }}>{label}</Text> : null}
      <View
        accessibilityRole="radiogroup"
        style={[styles.segments, { borderColor: colors.border, borderRadius: radius.pill }]}
      >
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <Pressable
              key={o.value}
              onPress={() => onChange(o.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[
                styles.segment,
                { borderRadius: radius.pill, backgroundColor: selected ? colors.accent : 'transparent' },
              ]}
            >
              <Text style={{ color: selected ? colors.onAccent : colors.text, fontWeight: '600' }}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function Divider() {
  const { colors } = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />;
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 1.2, marginLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  grow: { flex: 1 },
  segments: { flexDirection: 'row', borderWidth: 1, padding: 3 },
  segment: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center' },
});
