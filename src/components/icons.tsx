import Svg, { Path } from 'react-native-svg';

type IconProps = { size?: number; color: string };

const HEART =
  'M12 20.6l-1.3-1.2C6 15.2 3 12.4 3 8.9 3 6.1 5.2 4 7.9 4c1.6 0 3.1.7 4.1 1.9C13 4.7 14.5 4 16.1 4 18.8 4 21 6.1 21 8.9c0 3.5-3 6.3-7.7 10.5L12 20.6z';

export function HeartIcon({ size = 24, color, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={HEART}
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ShareIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <Path d="M12 3v12" strokeLinecap="round" />
      <Path d="M7.5 7.5L12 3l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 12v6.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V12" strokeLinecap="round" />
    </Svg>
  );
}
