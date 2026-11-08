// Generates the app icon, Android adaptive icon layers, splash images and favicon
// from the campfire mark. Usage: npm run make:icons
// Geometry must match src/components/CampfireLogo.tsx.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = (name) => join(root, 'assets', name);

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
