// Formes originales de la carte (librement inspirées des romans) et utilitaires SVG.

export const NS = 'http://www.w3.org/2000/svg';
export const W = 2000, H = 1200;
export const el = (tag, attrs = {}, parent) => {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  parent?.appendChild(n); return n;
};
export function rng(seed) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); }

// Côtes : polygone grossier → déplacement du point médian → courbe lissée (aspect « dessiné »)
export function roughen(pts, rand, iter = 3, amp = .16) {
  for (let k = 0; k < iter; k++, amp *= .55) {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy), o = (rand() - .5) * 2 * amp * len;
      out.push(a, [(a[0] + b[0]) / 2 - dy / len * o, (a[1] + b[1]) / 2 + dx / len * o]);
    }
    pts = out;
  }
  return pts;
}
export function smoothPath(p) {
  let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
  for (let i = 0; i < p.length; i++) {
    const p0 = p[(i - 1 + p.length) % p.length], p1 = p[i], p2 = p[(i + 1) % p.length], p3 = p[(i + 2) % p.length];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + 'Z';
}
export const blob = (cx, cy, rx, ry, n, rand) => Array.from({ length: n }, (_, i) => {
  const a = i / n * Math.PI * 2, r = .75 + rand() * .5; return [cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r];
});

// Formes originales, librement inspirées de la géographie des romans.
export const SHAPES = {
  westeros: [[250, 70], [420, 48], [560, 78], [628, 140], [600, 228], [646, 300], [612, 380], [556, 425], [520, 470], [532, 520], [604, 552], [668, 600], [640, 662], [596, 700],
    [622, 760], [598, 822], [646, 880], [620, 942], [560, 962], [650, 1010], [600, 1062], [480, 1082], [376, 1072], [298, 1042], [246, 990], [282, 940], [236, 880], [198, 820],
    [230, 760], [204, 700], [262, 640], [236, 580], [302, 520], [332, 470], [282, 420], [222, 380], [196, 300], [168, 230], [204, 150]],
  essos: [[930, 300], [1050, 252], [1250, 232], [1500, 262], [1750, 228], [1960, 290], [1985, 500], [1950, 700], [1860, 852], [1760, 905], [1690, 860], [1600, 820], [1450, 880],
    [1380, 860], [1330, 760], [1250, 740], [1220, 820], [1180, 880], [1120, 900], [1060, 920], [980, 870], [930, 800], [905, 720], [870, 640], [905, 560], [870, 470], [910, 400]]
};
export const ISLANDS = {
  westeros: [[168, 618, 26, 20], [148, 650, 14, 10], [196, 596, 12, 9], [660, 712, 16, 12], [700, 905, 22, 10], [320, 1110, 30, 12]],
  essos: [[905, 375, 22, 18], [878, 395, 10, 8], [1080, 965, 34, 22], [1135, 985, 16, 10], [1030, 1000, 12, 8], [1440, 1010, 60, 22]]
};
// Chaînes de montagnes et forêts : segments sur lesquels on sème des symboles
export const RANGES = {
  westeros: { m: [[[470, 520], [610, 600]], [[300, 560], [250, 720]], [[330, 1000], [600, 990]], [[230, 190], [300, 120]]], f: [[[300, 200], [520, 260]], [[330, 340], [460, 380]], [[300, 820], [420, 900]], [[600, 860], [560, 910]]] },
  essos: { m: [[[1820, 360], [1900, 720]], [[1250, 330], [1400, 300]], [[1050, 340], [1000, 600]]], f: [[[960, 460], [1060, 520]], [[1600, 320], [1720, 300]], [[1500, 620], [1650, 700]]] }
};

export const DEFS = `
    <filter id="paper" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="3" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 .35  0 0 0 0 .24  0 0 0 0 .1  0 0 0 .22 0"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
    <filter id="stain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".004" numOctaves="4" seed="9"/>
      <feColorMatrix type="matrix" values="0 0 0 0 .42  0 0 0 0 .28  0 0 0 0 .1  0 0 0 -1.6 1.05"/>
    </filter>
    <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="9" result="b"/>
      <feFlood flood-color="#f1dc94" flood-opacity=".95"/><feComposite in2="b" operator="in" result="g"/>
      <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="blur30"><feGaussianBlur stdDeviation="30"/></filter>
    <filter id="edge"><feTurbulence baseFrequency=".02" numOctaves="2" seed="5"/><feDisplacementMap in="SourceGraphic" scale="18"/></filter>
    <linearGradient id="landGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9d9ae"/><stop offset="1" stop-color="#cdb27b"/></linearGradient>
    <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e3a1"/><stop offset=".5" stop-color="#d8b445"/><stop offset="1" stop-color="#a9821e"/></linearGradient>
    <radialGradient id="waxGrad" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#d0342a"/><stop offset=".55" stop-color="#8b0000"/><stop offset="1" stop-color="#4a0303"/></radialGradient>
    <pattern id="waves" width="90" height="46" patternUnits="userSpaceOnUse">
      <path d="M5 20 q10 -8 20 0 t20 0 M50 40 q8 -6 16 0 t16 0" fill="none" stroke="#5c5a4c" stroke-width="1.4" stroke-linecap="round" opacity=".35"/>
      <animateTransform attributeName="patternTransform" type="translate" from="0 0" to="90 0" dur="14s" repeatCount="indefinite"/>
    </pattern>
    <clipPath id="halfL" clipPathUnits="objectBoundingBox"><polygon points="0,0 .56,0 .44,.32 .6,.55 .43,.78 .53,1 0,1"/></clipPath>
    <clipPath id="halfR" clipPathUnits="objectBoundingBox"><polygon points=".56,0 1,0 1,1 .53,1 .43,.78 .6,.55 .44,.32"/></clipPath>
    <g id="mtn"><path d="M-14 6 L-3 -12 L4 -2 L8 -7 L16 6" fill="#d9c391" stroke="#5b4426" stroke-width="1.6" stroke-linejoin="round"/><path d="M-3 -12 L-1 6" stroke="#5b4426" stroke-width="1" opacity=".5"/></g>
    <g id="tree"><path d="M0 -10 L6 2 L-6 2Z M0 -4 L7 7 L-7 7Z" fill="#a69565" stroke="#5b4426" stroke-width="1.1"/></g>`;
