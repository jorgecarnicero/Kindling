import { useEffect, useState } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { colorOf, NONE, type Look } from './catalog';

/**
 * A player drawn in layers (back hair, hoodie, held item, head, front hair, face, glasses,
 * hat), Matchbox style: thick ink outlines, flat colors. Drawn in a 140×200 box.
 * New cosmetics = one more case in the layer for their slot.
 */
/** portrait = square profile picture: head centered, shoulders running off the bottom edge. */
type Crop = 'full' | 'bust' | 'head' | 'portrait';
const VIEWBOX: Record<Crop, [number, number, number, number]> = {
  full: [-12, 0, 164, 200],
  bust: [-12, 10, 164, 170],
  head: [14, 10, 112, 118],
  portrait: [5, 20, 130, 130],
};

type Props = {
  look: Look;
  /** Height in px; width follows the crop. */
  size: number;
  crop?: Crop;
  /** Where the eyes look: -1 left, 0 ahead, 1 right (toward the fire). */
  facing?: -1 | 0 | 1;
  /** Gentle bob and blinks (off with reduce motion). */
  animated?: boolean;
  ink?: string;
};

const CREAM = '#FFF4E6';
const BLUSH = '#FF8CC6';
const WOOD = '#A0643C';

export function Character({ look, size, crop = 'full', facing = 0, animated = false, ink = '#1E1B3A' }: Props) {
  const reduce = useReducedMotion();
  const move = animated && !reduce;
  const [x, y, w, h] = VIEWBOX[crop];
  const width = (size * w) / h;

  const bob = useSharedValue(0);
  useEffect(() => {
    if (!move) return;
    bob.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [move, bob]);
  const bobStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -4 * bob.value }] }));

  const [closed, setClosed] = useState(false);
  useEffect(() => {
    if (!move) return;
    let open: ReturnType<typeof setTimeout> | undefined;
    const id = setInterval(
      () => {
        setClosed(true);
        open = setTimeout(() => setClosed(false), 140);
      },
      3800 + Math.random() * 1500,
    );
    return () => {
      clearInterval(id);
      if (open) clearTimeout(open);
    };
  }, [move]);

  const skin = colorOf('skin', look.skin);
  const hair = colorOf('hairColor', look.hairColor);
  const hoodie = colorOf('hoodie', look.hoodie);
  const dx = facing * 4;
  const eyeL = 56 + dx;
  const eyeR = 84 + dx;
  const line = { stroke: ink, strokeWidth: 4, strokeLinejoin: 'round' as const };

  return (
    <Animated.View style={[{ width, height: size }, move ? bobStyle : null]} accessible={false}>
      <Svg width={width} height={size} viewBox={`${x} ${y} ${w} ${h}`}>
        <HairBack style={look.hair} color={hair} line={line} />
        <Path d="M30 200 L30 158 Q30 126 70 126 Q110 126 110 158 L110 200 Z" fill={hoodie} {...line} />
        {look.hoodie === 'hd_stripes' ? (
          <Path d="M31 160 L109 160 M30 176 L110 176 M30 192 L110 192" stroke={CREAM} strokeWidth={6} />
        ) : null}
        {look.hoodie === 'hd_flannel' ? (
          <Path
            d="M50 132 L50 200 M70 126 L70 200 M90 132 L90 200 M30 156 L110 156 M30 178 L110 178"
            stroke="#7A2730"
            strokeWidth={5}
            opacity={0.7}
          />
        ) : null}
        <Path d="M56 128 Q70 142 84 128" fill="none" stroke={ink} strokeWidth={3.5} strokeLinecap="round" />
        <Hold id={look.hold} ink={ink} />
        <Circle cx={70} cy={84} r={38} fill={skin} {...line} />
        <HairFront style={look.hair} color={hair} line={line} />
        <Ellipse cx={eyeL} cy={90} rx={4.5} ry={closed ? 1 : 6} fill={ink} />
        <Ellipse cx={eyeR} cy={90} rx={4.5} ry={closed ? 1 : 6} fill={ink} />
        <Circle cx={46 + dx} cy={104} r={5} fill={BLUSH} opacity={0.75} />
        <Circle cx={94 + dx} cy={104} r={5} fill={BLUSH} opacity={0.75} />
        <Path
          d={`M${62 + dx} 106 Q${70 + dx} 113 ${78 + dx} 106`}
          fill="none"
          stroke={ink}
          strokeWidth={3.5}
          strokeLinecap="round"
        />
        <Glasses id={look.glasses} left={eyeL} right={eyeR} ink={ink} />
        <Hat id={look.hat} ink={ink} />
      </Svg>
    </Animated.View>
  );
}

type Line = { stroke: string; strokeWidth: number; strokeLinejoin: 'round' };

function HairBack({ style, color, line }: { style: string; color: string; line: Line }) {
  switch (style) {
    case 'hair_long':
      return <Path d="M28 92 Q24 38 70 38 Q116 38 112 92 L114 150 L26 150 Z" fill={color} {...line} />;
    case 'hair_curly':
      return (
        <Path
          d="M22 84 Q14 60 30 46 Q30 24 54 22 Q70 10 86 22 Q110 24 110 46 Q126 60 118 84 Q120 104 104 110 L36 110 Q20 104 22 84 Z"
          fill={color}
          {...line}
        />
      );
    case 'hair_buns':
      return (
        <G>
          <Circle cx={36} cy={48} r={16} fill={color} {...line} />
          <Circle cx={104} cy={48} r={16} fill={color} {...line} />
        </G>
      );
    default:
      return null;
  }
}

function HairFront({ style, color, line }: { style: string; color: string; line: Line }) {
  switch (style) {
    case 'hair_long':
      return <Path d="M32 82 Q34 44 70 44 Q106 44 108 82 Q96 62 76 60 Q60 72 32 82 Z" fill={color} {...line} />;
    case 'hair_curly':
      return <Path d="M36 76 Q40 54 58 54 Q66 62 76 54 Q98 52 104 76 Q90 66 70 68 Q50 66 36 76 Z" fill={color} />;
    case 'hair_buns':
      return <Path d="M32 84 Q32 42 70 42 Q108 42 108 84 Q94 58 70 58 Q46 58 32 84 Z" fill={color} {...line} />;
    case 'hair_buzz':
      return (
        <Path d="M34 76 Q36 46 70 46 Q104 46 106 76 Q90 62 70 62 Q50 62 34 76 Z" fill={color} {...line} strokeWidth={3} />
      );
    case 'hair_short':
    default:
      return (
        <Path
          d="M34 86 Q30 52 50 46 Q70 36 92 46 Q110 54 106 86 Q96 70 82 66 Q66 74 50 68 Q40 74 34 86 Z"
          fill={color}
          {...line}
        />
      );
  }
}

function heart(cx: number, cy: number): string {
  return `M${cx} ${cy + 9} C${cx - 15} ${cy} ${cx - 9} ${cy - 11} ${cx} ${cy - 4} C${cx + 9} ${cy - 11} ${cx + 15} ${cy} ${cx} ${cy + 9} Z`;
}

function star(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.48;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join(' L')} Z`;
}

function Glasses({ id, left, right, ink }: { id: string; left: number; right: number; ink: string }) {
  const mid = (left + right) / 2;
  const bridge = <Path d={`M${left + 10} 90 L${right - 10} 90`} stroke={ink} strokeWidth={3} />;
  switch (id) {
    case 'gl_round':
      return (
        <G>
          <Circle cx={left} cy={90} r={11} fill="none" stroke={ink} strokeWidth={3} />
          <Circle cx={right} cy={90} r={11} fill="none" stroke={ink} strokeWidth={3} />
          {bridge}
        </G>
      );
    case 'gl_sun':
      return (
        <G>
          <Rect x={left - 12} y={82} width={24} height={16} rx={6} fill={ink} />
          <Rect x={right - 12} y={82} width={24} height={16} rx={6} fill={ink} />
          <Path d={`M${left + 10} 88 L${right - 10} 88`} stroke={ink} strokeWidth={3} />
          <Path d={`M${left - 7} 86 L${left - 2} 86`} stroke={CREAM} strokeWidth={2} strokeLinecap="round" />
        </G>
      );
    case 'gl_heart':
      return (
        <G>
          <Path d={heart(left, 89)} fill="#FF6B7A" stroke={ink} strokeWidth={3} strokeLinejoin="round" />
          <Path d={heart(right, 89)} fill="#FF6B7A" stroke={ink} strokeWidth={3} strokeLinejoin="round" />
          <Path d={`M${left + 9} 88 L${right - 9} 88`} stroke={ink} strokeWidth={3} />
        </G>
      );
    case 'gl_star':
      return (
        <G>
          <Path d={star(left, 90, 13)} fill="#FFD23F" stroke={ink} strokeWidth={3} strokeLinejoin="round" />
          <Path d={star(right, 90, 13)} fill="#FFD23F" stroke={ink} strokeWidth={3} strokeLinejoin="round" />
          <Path d={`M${mid - 3} 90 L${mid + 3} 90`} stroke={ink} strokeWidth={3} />
        </G>
      );
    case NONE:
    default:
      return null;
  }
}

function Hat({ id, ink }: { id: string; ink: string }) {
  const line = { stroke: ink, strokeWidth: 4, strokeLinejoin: 'round' as const };
  switch (id) {
    case 'hat_beanie':
      return (
        <G>
          <Path d="M32 70 Q34 34 70 34 Q106 34 108 70 Z" fill="#7C8BFF" {...line} />
          <Rect x={28} y={64} width={84} height={12} rx={6} fill={CREAM} stroke={ink} strokeWidth={3} />
          <Circle cx={70} cy={30} r={8} fill={CREAM} stroke={ink} strokeWidth={3} />
        </G>
      );
    case 'hat_cap':
      return (
        <G>
          <Path d="M32 70 Q32 36 70 36 Q108 36 108 70 Z" fill="#FF6B7A" {...line} />
          <Path d="M96 66 L132 64 Q136 72 128 74 L96 74 Z" fill="#FF6B7A" {...line} />
        </G>
      );
    case 'hat_bucket':
      return (
        <G>
          <Path d="M40 66 Q40 32 70 32 Q100 32 100 66 Z" fill="#2CC7B4" {...line} />
          <Path d="M20 70 Q70 56 120 70 L114 80 Q70 70 26 80 Z" fill="#2CC7B4" {...line} />
        </G>
      );
    case 'hat_explorer':
      return (
        <G>
          <Path d="M40 64 Q42 26 70 26 Q98 26 100 64 Z" fill="#E3B27D" {...line} />
          <Rect x={40} y={52} width={60} height={12} fill={WOOD} stroke={ink} strokeWidth={3} />
          <Ellipse cx={70} cy={66} rx={52} ry={10} fill="#E3B27D" {...line} />
        </G>
      );
    case 'hat_crown':
      return (
        <Path d="M36 68 L36 38 L50 52 L62 30 L70 48 L78 30 L90 52 L104 38 L104 68 Z" fill="#FFD23F" {...line} />
      );
    case 'hat_party':
      return (
        <G>
          <Path d="M48 60 L70 10 L92 60 Z" fill="#FF6B7A" {...line} />
          <Path d="M56 44 L84 44 M62 30 L78 30" stroke={CREAM} strokeWidth={4} />
          <Circle cx={70} cy={10} r={7} fill={CREAM} stroke={ink} strokeWidth={3} />
        </G>
      );
    case NONE:
    default:
      return null;
  }
}

function Hold({ id, ink }: { id: string; ink: string }) {
  const line = { stroke: ink, strokeWidth: 3.5, strokeLinejoin: 'round' as const };
  switch (id) {
    case 'hold_mug':
      return (
        <G>
          <Path d="M104 156 Q116 156 116 164 Q116 172 104 172" fill="none" stroke={ink} strokeWidth={3.5} />
          <Rect x={82} y={150} width={24} height={26} rx={5} fill={CREAM} {...line} />
          <Path d="M88 144 Q86 138 90 134 M98 144 Q96 138 100 134" fill="none" stroke={CREAM} strokeWidth={3} strokeLinecap="round" />
        </G>
      );
    case 'hold_mallow':
      return (
        <G>
          <Path d="M40 176 L6 110" stroke={WOOD} strokeWidth={5} strokeLinecap="round" />
          <Rect x={-4} y={88} width={20} height={24} rx={8} fill={CREAM} {...line} transform="rotate(-28 6 100)" />
        </G>
      );
    case 'hold_guitar':
      return (
        <G>
          <Path d="M56 160 L122 112" stroke="#5A3520" strokeWidth={8} strokeLinecap="round" />
          <Circle cx={36} cy={176} r={20} fill="#C9874A" {...line} />
          <Circle cx={54} cy={160} r={14} fill="#C9874A" {...line} />
          <Circle cx={42} cy={170} r={5} fill={ink} />
        </G>
      );
    case 'hold_lantern':
      return (
        <G>
          <Path d="M112 140 Q122 128 132 140" fill="none" stroke={ink} strokeWidth={3.5} />
          <Rect x={110} y={140} width={24} height={8} rx={3} fill={ink} />
          <Rect x={112} y={148} width={20} height={26} rx={6} fill="#FFC857" {...line} />
          <Rect x={110} y={172} width={24} height={7} rx={3} fill={ink} />
        </G>
      );
    case NONE:
    default:
      return null;
  }
}
