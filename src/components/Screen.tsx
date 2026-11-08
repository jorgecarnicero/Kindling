import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';
import { ScreenHeader } from './ScreenHeader';

type Props = { title: string; message?: string; children?: ReactNode };

/** An inner screen with a header and a centred message, used for empty states. */
export function Screen({ title, message, children }: Props) {
  const { colors, fonts, spacing } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScreenHeader title={title} />
      <View style={[styles.body, { padding: spacing.xl, gap: spacing.lg }]}>
        {message ? (
          <Text style={{ color: colors.textMuted, fontFamily: fonts.bodySemi, fontSize: 18, lineHeight: 25, textAlign: 'center' }}>
            {message}
          </Text>
        ) : null}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, alignItems: 'stretch', justifyContent: 'center' },
});
