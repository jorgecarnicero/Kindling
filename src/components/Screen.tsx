import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';

type Props = { title: string; subtitle?: string; children?: ReactNode };

/** Placeholder screen body: centred title, optional subtitle and content. */
export function Screen({ title, subtitle, children }: Props) {
  const { colors, spacing, fontSize } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: colors.background, padding: spacing.lg }]}>
      <Text style={[styles.title, { color: colors.text, fontSize: fontSize.title }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textMuted, fontSize: fontSize.body }]}>
          {subtitle}
        </Text>
      ) : null}
      <View style={{ marginTop: spacing.xl, gap: spacing.md, alignSelf: 'stretch' }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '700', textAlign: 'center' },
  subtitle: { marginTop: 8, textAlign: 'center' },
});
