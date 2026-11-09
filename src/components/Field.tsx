import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/theme';
import { Sticker } from './Sticker';

type Props = {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength: number;
  /** Bigger text for the main question. */
  big?: boolean;
  autoFocus?: boolean;
};

/** A labelled sticker text box with a live character count. */
export function Field({ label, hint, value, onChange, placeholder, maxLength, big, autoFocus }: Props) {
  const { colors, fonts, radius, sticker } = useTheme();
  const left = maxLength - value.length;
  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={{ color: colors.text, fontFamily: fonts.bodyBold, fontSize: 16 }}>{label}</Text>
        <Text style={{ color: colors.textMuted, fontFamily: fonts.body, fontSize: 13 }}>{left}</Text>
      </View>
      <Sticker bg={colors.surface} radius={radius.md} shadow={sticker.shadowSmall}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          maxLength={maxLength}
          multiline
          autoFocus={autoFocus}
          accessibilityLabel={label}
          accessibilityHint={hint}
          style={[
            styles.input,
            {
              color: colors.text,
              fontFamily: big ? fonts.display : fonts.bodySemi,
              fontSize: big ? 22 : 17,
              minHeight: big ? 96 : 56,
            },
          ]}
        />
      </Sticker>
      {hint ? (
        <Text style={{ color: colors.textMuted, fontFamily: fonts.body, fontSize: 14, lineHeight: 19 }}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  input: { paddingHorizontal: 14, paddingVertical: 12, textAlignVertical: 'top' },
});
