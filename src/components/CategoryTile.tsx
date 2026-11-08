import { StyleSheet, Text, View } from 'react-native';
import type { Category } from '@/data/types';
import { categoryColor, useTheme } from '@/theme';
import { FlameIcon } from './icons';
import { PressableSticker } from './Sticker';

type Props = { category: Category; label: string; hint: string; selected: boolean; onPress: () => void };

/** A toggleable category sticker: paper when off, its own color when picked (pressed flat). */
export function CategoryTile({ category, label, hint, selected, onPress }: Props) {
  const { colors, fonts, mode, radius } = useTheme();
  const color = categoryColor[category];
  const night = mode === 'night';
  return (
    <PressableSticker
      onPress={onPress}
      selected={selected}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      accessibilityHint={hint}
      bg={selected ? color : colors.surface}
      glow={selected && night ? color : undefined}
      radius={radius.md}
      style={styles.grow}
      faceStyle={styles.face}
    >
      <View
        style={[
          styles.chip,
          {
            borderColor: colors.ink,
            backgroundColor: selected ? (night ? colors.text : '#FFFFFF') : night ? colors.background : color,
          },
        ]}
      >
        <FlameIcon size={20} color={selected || night ? color : '#FFFFFF'} outline={colors.ink} />
      </View>
      <Text style={[styles.label, { color: selected ? colors.onColor : colors.text, fontFamily: fonts.display }]}>{label}</Text>
    </PressableSticker>
  );
}

const styles = StyleSheet.create({
  grow: { flex: 1 },
  face: { minHeight: 68, paddingHorizontal: 10, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  chip: { width: 34, height: 34, borderRadius: 10, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontSize: 16, lineHeight: 18 },
});
