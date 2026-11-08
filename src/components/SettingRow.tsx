import { ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useTheme } from '@/theme';
import { PressableSticker, Sticker } from './Sticker';

/** A titled group of rows on one sticker. */
export function SettingSection({ title, children }: { title: string; children: ReactNode }) {
  const { colors, fonts, spacing, radius } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.display }]}>
        {title}
      </Text>
      <Sticker bg={colors.surface} radius={radius.lg} faceStyle={{ paddingHorizontal: spacing.md }}>
        {children}
      </Sticker>
    </View>
  );
}

type ToggleProps = { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void };

/** A whole-row toggle: tapping the label flips it too (bigger touch target). */
export function ToggleRow({ label, hint, value, onChange }: ToggleProps) {
  const { colors, fonts, spacing, fontSize } = useTheme();
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
        <Text style={{ color: colors.text, fontFamily: fonts.bodyBold, fontSize: fontSize.body }}>{label}</Text>
        {hint ? (
          <Text style={{ color: colors.textMuted, fontFamily: fonts.body, fontSize: 14, marginTop: 2, lineHeight: 19 }}>{hint}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.accent, false: colors.background }}
        thumbColor={colors.switchThumb}
        ios_backgroundColor={colors.background}
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

/** A row of sticker buttons; the chosen one is pressed flat and filled. */
export function ChoiceRow<T extends string>({ label, options, value, onChange }: ChoiceProps<T>) {
  const { colors, fonts, spacing, radius, sticker } = useTheme();
  return (
    <View style={{ paddingVertical: spacing.sm, gap: spacing.sm }}>
      {label ? <Text style={{ color: colors.text, fontFamily: fonts.bodyBold, fontSize: 17 }}>{label}</Text> : null}
      <View accessibilityRole="radiogroup" style={[styles.row, { gap: spacing.sm }]}>
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <PressableSticker
              key={o.value}
              onPress={() => onChange(o.value)}
              selected={selected}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={o.label}
              bg={selected ? colors.selected : colors.surface}
              radius={radius.md}
              shadow={sticker.shadowSmall}
              style={styles.grow}
              faceStyle={styles.segment}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{ color: selected ? colors.onSelected : colors.text, fontFamily: fonts.bodyBold, fontSize: 16 }}
              >
                {o.label}
              </Text>
            </PressableSticker>
          );
        })}
      </View>
    </View>
  );
}

export function Divider() {
  const { colors } = useTheme();
  return <View style={{ height: 2, backgroundColor: colors.background, marginHorizontal: -4 }} />;
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 22, marginLeft: 2 },
  row: { flexDirection: 'row', alignItems: 'center' },
  grow: { flex: 1 },
  segment: { minHeight: 46, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
});
