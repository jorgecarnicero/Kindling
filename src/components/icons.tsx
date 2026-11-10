import Svg, { Circle, Path } from 'react-native-svg';

type IconProps = { size?: number; color: string };

const HEART =
  'M12 20.6l-1.3-1.2C6 15.2 3 12.4 3 8.9 3 6.1 5.2 4 7.9 4c1.6 0 3.1.7 4.1 1.9C13 4.7 14.5 4 16.1 4 18.8 4 21 6.1 21 8.9c0 3.5-3 6.3-7.7 10.5L12 20.6z';

/** Heart; `fill` colors the inside when saved. */
export function HeartIcon({ size = 24, color, filled = false, fill }: IconProps & { filled?: boolean; fill?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={HEART} fill={filled ? (fill ?? color) : 'none'} stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  );
}

export function ShareIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2}>
      <Path d="M12 3v12" strokeLinecap="round" />
      <Path d="M7.5 7.5L12 3l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 12v6.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V12" strokeLinecap="round" />
    </Svg>
  );
}

export function GearIcon({ size = 22, color }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
    >
      <Circle cx={12} cy={12} r={3.2} />
      <Path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7" />
    </Svg>
  );
}

export function BackIcon({ size = 20, color }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M15 5l-7 7 7 7" />
    </Svg>
  );
}

export function PlayIcon({ size = 64, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill={color} />
    </Svg>
  );
}

export function PencilIcon({ size = 22, color }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5 4 20z" />
      <Path d="M13.5 7l3 3" />
    </Svg>
  );
}

const FLAME = 'M50 6c10 14 26 25 26 47 0 22-15 37-26 37S24 75 24 53c0-14 10-21 14-31 2 9 7 14 12 14 0-11-4-20 0-30z';

/** A category's little flame. */
export function FlameIcon({ size = 20, color, outline }: IconProps & { outline: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path d={FLAME} fill={color} stroke={outline} strokeWidth={7} strokeLinejoin="round" />
    </Svg>
  );
}

/** Speaker; `on` adds sound waves, off adds a cross. */
export function SpeakerIcon({ size = 22, color, on }: IconProps & { on: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill={color} />
      {on ? (
        <>
          <Path d="M15.5 9a4 4 0 0 1 0 6" />
          <Path d="M18 6.5a7.5 7.5 0 0 1 0 11" />
        </>
      ) : (
        <Path d="M16 9.5l5 5M21 9.5l-5 5" />
      )}
    </Svg>
  );
}

/** A road running into the distance, for Road trip. */
export function RoadIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round">
      <Path d="M9 3L4 21M15 3l5 18" />
      <Path d="M12 5v2.5M12 11v2.5M12 17v3" />
    </Svg>
  );
}

export function LockIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round">
      <Path d="M6.5 11h11a1.5 1.5 0 0 1 1.5 1.5v6A2.5 2.5 0 0 1 16.5 21h-9A2.5 2.5 0 0 1 5 18.5v-6A1.5 1.5 0 0 1 6.5 11z" />
      <Path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Svg>
  );
}

export function CheckIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 12.5l4.5 4.5L19 7.5" />
    </Svg>
  );
}

/** A die showing five: "random". */
export function DiceIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinejoin="round">
      <Path d="M7 3.5h10A3.5 3.5 0 0 1 20.5 7v10a3.5 3.5 0 0 1-3.5 3.5H7A3.5 3.5 0 0 1 3.5 17V7A3.5 3.5 0 0 1 7 3.5z" />
      <Circle cx={8.5} cy={8.5} r={1.4} fill={color} stroke="none" />
      <Circle cx={15.5} cy={8.5} r={1.4} fill={color} stroke="none" />
      <Circle cx={12} cy={12} r={1.4} fill={color} stroke="none" />
      <Circle cx={8.5} cy={15.5} r={1.4} fill={color} stroke="none" />
      <Circle cx={15.5} cy={15.5} r={1.4} fill={color} stroke="none" />
    </Svg>
  );
}
