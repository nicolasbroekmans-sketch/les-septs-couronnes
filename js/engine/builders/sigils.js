// Blasons dessinés à la main (silhouettes héraldiques originales) pour bannières et étendards.
import * as THREE from 'three';

const cache = new Map();
const PATHS = {
  wolf: g => { g.beginPath(); g.moveTo(40, 150); g.lineTo(58, 70); g.lineTo(70, 40); g.lineTo(80, 72); g.lineTo(96, 66); g.lineTo(110, 36); g.lineTo(118, 74); g.quadraticCurveTo(150, 92, 156, 128); g.lineTo(196, 150); g.lineTo(150, 162); g.quadraticCurveTo(128, 200, 96, 214); g.quadraticCurveTo(64, 196, 40, 150); g.fill(); },
  lion: g => { g.beginPath(); g.arc(100, 96, 46, 0, 7); g.fill(); g.beginPath(); g.moveTo(70, 130); g.lineTo(60, 210); g.lineTo(84, 200); g.lineTo(100, 140); g.lineTo(118, 200); g.lineTo(142, 210); g.lineTo(130, 130); g.fill(); for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28; g.beginPath(); g.moveTo(100 + Math.cos(a) * 40, 96 + Math.sin(a) * 40); g.lineTo(100 + Math.cos(a + .3) * 68, 96 + Math.sin(a + .3) * 68); g.lineTo(100 + Math.cos(a + .6) * 40, 96 + Math.sin(a + .6) * 40); g.fill(); } },
  stag: g => { g.beginPath(); g.ellipse(100, 140, 26, 44, 0, 0, 7); g.fill(); g.lineWidth = 9; g.lineCap = 'round'; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(100 + s * 14, 104); g.quadraticCurveTo(100 + s * 60, 70, 100 + s * 50, 20); g.moveTo(100 + s * 36, 74); g.lineTo(100 + s * 70, 60); g.moveTo(100 + s * 46, 46); g.lineTo(100 + s * 78, 30); g.stroke(); } },
  crow: g => { g.beginPath(); g.moveTo(20, 120); g.quadraticCurveTo(80, 70, 100, 90); g.quadraticCurveTo(120, 70, 180, 120); g.quadraticCurveTo(130, 110, 112, 130); g.lineTo(130, 190); g.lineTo(100, 160); g.lineTo(70, 190); g.lineTo(88, 130); g.quadraticCurveTo(70, 110, 20, 120); g.fill(); },
  falcon: g => { g.beginPath(); g.arc(100, 70, 34, .3, Math.PI * 2 - .3); g.arc(118, 64, 28, Math.PI * 2 - .5, .5, true); g.fill(); g.beginPath(); g.moveTo(100, 120); g.lineTo(30, 100); g.lineTo(70, 140); g.lineTo(100, 200); g.lineTo(130, 140); g.lineTo(170, 100); g.closePath(); g.fill(); },
  sun: g => { g.beginPath(); g.arc(100, 110, 42, 0, 7); g.fill(); for (let i = 0; i < 16; i++) { const a = i / 16 * 6.28; g.beginPath(); g.moveTo(100 + Math.cos(a) * 42, 110 + Math.sin(a) * 42); g.lineTo(100 + Math.cos(a + .2) * 78, 110 + Math.sin(a + .2) * 78); g.lineTo(100 + Math.cos(a + .39) * 42, 110 + Math.sin(a + .39) * 42); g.fill(); } g.fillStyle = '#d8b040'; g.fillRect(96, 10, 8, 200); g.beginPath(); g.moveTo(100, 0); g.lineTo(88, 24); g.lineTo(112, 24); g.fill(); },
  kraken: g => { g.beginPath(); g.ellipse(100, 70, 30, 40, 0, 0, 7); g.fill(); g.lineWidth = 9; g.lineCap = 'round'; for (let i = 0; i < 8; i++) { const x = 66 + i * 10; g.beginPath(); g.moveTo(x, 100); g.quadraticCurveTo(x + (i % 2 ? 26 : -26), 160, x + (i < 4 ? -20 : 20), 214); g.stroke(); } },
  dragon: g => { g.beginPath(); g.moveTo(100, 40); g.lineTo(130, 70); g.lineTo(190, 50); g.lineTo(150, 110); g.lineTo(170, 190); g.lineTo(110, 140); g.lineTo(100, 210); g.lineTo(90, 140); g.lineTo(30, 190); g.lineTo(50, 110); g.lineTo(10, 50); g.lineTo(70, 70); g.closePath(); g.fill(); },
  rose: g => { for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; g.beginPath(); g.ellipse(100 + Math.cos(a) * 28, 110 + Math.sin(a) * 28, 26, 18, a, 0, 7); g.fill(); } }
};
/** Texture de bannière : fond, bordure, figure. */
export function bannerTexture(kind, field, figure) {
  const key = kind + field + figure; if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas'); c.width = 200; c.height = 300; const g = c.getContext('2d');
  g.fillStyle = field; g.fillRect(0, 0, 200, 300);
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 10; g.strokeRect(5, 5, 190, 290);
  g.fillStyle = figure; g.strokeStyle = figure; g.save(); g.translate(0, 30); PATHS[kind]?.(g); g.restore();
  for (let i = 0; i < 2000; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * .06})`; g.fillRect(Math.random() * 200, Math.random() * 300, 2, 2); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; cache.set(key, t); return t;
}
export const HOUSES = {
  stark: ['wolf', '#4e555e', '#f4f2ec'], lannister: ['lion', '#8b0000', '#d8b040'], baratheon: ['stag', '#d8b040', '#141414'],
  garde: ['crow', '#141416', '#7a7a80'], tyrell: ['rose', '#3f6a34', '#d8b040'],
  arryn: ['falcon', '#5a7aa8', '#f4f2ec'], martell: ['sun', '#d97a2a', '#b0201a'], greyjoy: ['kraken', '#141416', '#d8b040'], targaryen: ['dragon', '#141414', '#b0201a']
};
