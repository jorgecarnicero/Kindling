import { useColorScheme } from 'react-native';

const palette = {
  ember: '#E8590C',
  emberSoft: '#F7A26B',
  charcoal: '#1F1B18',
  charcoalRaised: '#2B2622',
  cream: '#FBF5EC',
  creamRaised: '#FFFFFF',
  stone: '#8A7F75',
};

export const lightColors = {
  background: palette.cream,
  surface: palette.creamRaised,
  text: palette.charcoal,
  textMuted: palette.stone,
  accent: palette.ember,
  onAccent: palette.cream,
  border: '#EADFD0',
  switchThumb: palette.creamRaised,
};

export type Colors = typeof lightColors;

export const darkColors: Colors = {
  background: palette.charcoal,
  surface: palette.charcoalRaised,
  text: palette.cream,
  textMuted: '#B3A89D',
  accent: palette.emberSoft,
  onAccent: palette.charcoal,
  border: '#3A332D',
  switchThumb: palette.cream,
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

export const radius = { md: 12, lg: 20, pill: 999 };

export const fontSize = { body: 17, title: 28, display: 40 };

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return { colors: isDark ? darkColors : lightColors, isDark, spacing, radius, fontSize };
}
