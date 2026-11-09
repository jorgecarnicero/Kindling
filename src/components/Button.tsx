import { Text } from 'react-native';
import { useTheme } from '@/theme';
import { PressableSticker } from './Sticker';

type Props = {
  label: string;
  onPress: () => void;
  /** primary = ember accent, sunny = yellow/gold, secondary = sticker paper. */
  variant?: 'primary' | 'sunny' | 'secondary';
  disabled?: boolean;
  /** Bigger display type for the main call to action. */
  big?: boolean;
  accessibilityHint?: string;
};

export function Button({ label, onPress, variant = 'primary', disabled = false, big = false, accessibilityHint }: Props) {
  const { colors, fonts, radius } = useTheme();
  const bg = variant === 'primary' ? colors.accent : variant === 'sunny' ? colors.sunny : colors.surface;
  const fg = variant === 'secondary' ? colors.text : colors.onColor;
  return (
    <PressableSticker
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityHint={accessibilityHint}
      bg={bg}
      radius={radius.md}
      faceStyle={{
        minHeight: big ? 58 : 52,
        paddingHorizontal: big ? 10 : 18,
        paddingVertical: 6,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        style={{
          color: fg,
          fontFamily: big || variant !== 'secondary' ? fonts.display : fonts.bodyBold,
          fontSize: big ? 19 : 17,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </PressableSticker>
  );
}
