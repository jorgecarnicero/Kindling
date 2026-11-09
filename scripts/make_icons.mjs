// Generates the app icon, Android adaptive icon layers, splash images and favicon
// from the campfire mark. Usage: npm run make:icons
// Geometry must match src/components/CampfireLogo.tsx.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = (name) => join(root, 'assets', name);
// Vector masters of every graphic (sharp at any size). The stores and phones need PNG,
// so PNGs are rendered from these at their final size.
mkdirSync(join(root, 'design'), { recursive: true });
const saveSvg = (pngName, svgText) => {
  const name = pngName.replace(/\.png$/, '.svg');
  writeFileSync(join(root, 'design', name), svgText.trim() + '\n');
};

const LOGS = 'M24 96L92 80M96 96L28 80';
const FLAME = 'M60 14c11 14 24 23 24 42 0 15-11 26-24 26S36 71 36 56c0-11 8-17 12-26 2 8 6 12 11 12 0-10-4-18 1-28z';
const CORE = 'M60 52c5 6 10 10 10 17 0 7-5 11-10 11s-10-4-10-11c0-7 5-11 10-17z';

const DAY = { ink: '#1E1B3A', log: '#C9874A', flame: '#FF6B35', core: '#FFF8EE', badge: '#FFD23F', spark: '#FF6B35', sparkOutline: true };
const NIGHT = { ink: '#0D0C22', log: '#A86B3C', flame: '#FF8A3D', core: '#FFC857', badge: '#2E2752', spark: '#FFC857', sparkOutline: false };

/** The mark in a 120×120 box. */
function mark(p, { sparks = true } = {}) {
  const sparkStroke = p.sparkOutline ? ` stroke="${p.ink}" stroke-width="2.5"` : '';
  return `
    <path d="${LOGS}" stroke="${p.ink}" stroke-width="17" stroke-linecap="round" fill="none"/>
    <path d="${LOGS}" stroke="${p.log}" stroke-width="9" stroke-linecap="round" fill="none"/>
    <path d="${FLAME}" fill="${p.flame}" stroke="${p.ink}" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="${CORE}" fill="${p.core}" stroke="${p.ink}" stroke-width="3.5" stroke-linejoin="round"/>
    ${sparks ? `<circle cx="24" cy="32" r="4" fill="${p.spark}"${sparkStroke}/><circle cx="96" cy="24" r="3" fill="${p.spark}"${sparkStroke}/>` : ''}`;
}

/** White silhouette for Android's themed (monochrome) icon. */
function silhouette() {
  return `
    <path d="${LOGS}" stroke="#FFFFFF" stroke-width="17" stroke-linecap="round" fill="none"/>
    <path d="${FLAME}" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="4.5" stroke-linejoin="round"/>`;
}

/** Wraps content drawn in a 120 box, scaled by `scale` around the centre, onto a `size` canvas. */
function svg(size, content, { bg, scale = 1 } = {}) {
  const offset = (120 - 120 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 120 120">
    ${bg ? `<rect width="120" height="120" fill="${bg}"/>` : ''}
    <g transform="translate(${offset} ${offset}) scale(${scale})">${content}</g>
  </svg>`;
}

/** The sticker badge (rounded square, ink outline, offset shadow) holding the mark. */
function badge(p) {
  return `
    <rect x="11" y="11" width="100" height="100" rx="24" fill="${p.ink}"/>
    <rect x="7.5" y="7.5" width="100" height="100" rx="24" fill="${p.badge}" stroke="${p.ink}" stroke-width="3"/>
    <g transform="translate(13.5 13.5) scale(0.73)">${mark(p)}</g>`;
}

function render(name, svgText) {
  saveSvg(name, svgText);
  const png = new Resvg(svgText, { fitTo: { mode: 'original' } }).render().asPng();
  writeFileSync(out(name), png);
  console.log(`wrote assets/${name} (${Math.round(png.length / 1024)} KB)`);
}

// iOS / default icon: full-bleed square (the OS rounds the corners).
render('icon.png', svg(1024, mark(DAY), { bg: DAY.badge, scale: 0.86 }));
// Android adaptive icon: the mark stays inside the safe zone (centre ~66%).
render('android-icon-background.png', svg(1024, '', { bg: DAY.badge }));
render('android-icon-foreground.png', svg(1024, mark(DAY), { scale: 0.6 }));
render('android-icon-monochrome.png', svg(1024, silhouette(), { scale: 0.6 }));
// Splash: the sticker badge on the welcome color (day) or the night sky.
render('splash-icon.png', svg(512, badge(DAY)));
render('splash-icon-night.png', svg(512, badge(NIGHT)));
// Web favicon.
render('favicon.png', svg(64, mark(DAY, { sparks: false }), { bg: DAY.badge, scale: 0.95 }));

// ---- Google Play store graphics (not bundled in the app) → store/ ----
const storeOut = (name) => join(root, 'store', name);
mkdirSync(join(root, 'store'), { recursive: true });
const fontFiles = [
  join(root, 'node_modules/@expo-google-fonts/bricolage-grotesque/800ExtraBold/BricolageGrotesque_800ExtraBold.ttf'),
  join(root, 'node_modules/@expo-google-fonts/figtree/600SemiBold/Figtree_600SemiBold.ttf'),
];

/** Embeds the two fonts so the SVG masters render the same on any computer. */
const fontFaces = `<style>
  @font-face { font-family: 'Bricolage Grotesque'; font-weight: 800; src: url(data:font/ttf;base64,${readFileSync(fontFiles[0]).toString('base64')}) format('truetype'); }
  @font-face { font-family: 'Figtree'; font-weight: 600; src: url(data:font/ttf;base64,${readFileSync(fontFiles[1]).toString('base64')}) format('truetype'); }
</style>`;

function renderStore(name, svgText) {
  // The saved master embeds its fonts; resvg renders with the font files directly.
  saveSvg(name, svgText.includes('<text') ? svgText.replace(/(<svg[^>]*>)/, `$1${fontFaces}`) : svgText);
  const png = new Resvg(svgText, {
    fitTo: { mode: 'original' },
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Figtree' },
  })
    .render()
    .asPng();
  writeFileSync(storeOut(name), png);
  console.log(`wrote store/${name} (${Math.round(png.length / 1024)} KB)`);
}

// Play's hi-res icon: 512×512, same art as the app icon.
renderStore('play-icon-512.png', svg(512, mark(DAY), { bg: DAY.badge, scale: 0.86 }));

/** 1024×500 feature graphic: welcome-orange, sticker badge, title and slogan. */
function featureGraphic([line1, line2]) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
    <rect width="1024" height="500" fill="#FF6B35"/>
    <circle cx="70" cy="520" r="210" fill="#FF8A5C"/>
    <circle cx="1010" cy="40" r="150" fill="#FF8A5C"/>
    <g transform="translate(110 110) scale(2.4)">${badge(DAY)}</g>
    <text x="430" y="232" font-family="Bricolage Grotesque" font-weight="800" font-size="118" fill="${DAY.ink}" letter-spacing="-3">Kindling</text>
    <text x="436" y="302" font-family="Figtree" font-weight="600" font-size="40" fill="${DAY.ink}">${line1}</text>
    <text x="436" y="352" font-family="Figtree" font-weight="600" font-size="40" fill="${DAY.ink}">${line2}</text>
  </svg>`;
}
// The slogan on two lines so it fits in both languages.
renderStore('feature-graphic-en.png', featureGraphic(['Every good talk', 'starts small.']));
renderStore('feature-graphic-es.png', featureGraphic(['Toda buena charla', 'empieza pequeña.']));
