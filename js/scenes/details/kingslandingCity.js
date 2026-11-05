// Port-Réal, détails inspirés de la série : Fosse aux Dragons en ruine, porte des Dieux et remparts,
// place du marché, étendards lion et cerf, quais encombrés, lanternes, charrettes.
import { height } from './klTerrain.js';

export const PLAZA = [-32, 38], PIT = [112, -72], FLEA = [-22, -8];
export const avoidExtra = (x, z, w = 0, d = 0) => Math.hypot(x - PLAZA[0], z - PLAZA[1]) < 14 + Math.max(w, d) / 2 || Math.hypot(x - PIT[0], z - PIT[1]) < 34 + Math.max(w, d) / 2 || Math.hypot(x - FLEA[0], z - FLEA[1]) < 9 + Math.max(w, d) / 2 || x - w / 2 < -158;

export function kingslandingCity(ctx, keep) {
  const { THREE, mat, props: P } = ctx, red = mat('castle_brick_02_red', { uv: 4, color: '#c46a52' }), stone = mat('large_sandstone_blocks', { uv: 4, color: '#d8c8a8' });
  // Fosse aux Dragons : tambour circulaire éventré et dôme effondré
  const [px, pz] = PIT, py = height(px, pz);
  for (let i = 0; i < 28; i++) { if (i % 7 === 3) continue; const a = i / 28 * 6.28, hgt = 10 + ((i * 37) % 9); ctx.box(5.2, hgt, 3, px + Math.cos(a) * 24, py - 2, pz + Math.sin(a) * 24, stone, { rotY: -a + Math.PI / 2 }); }
  const dome = new THREE.Mesh(new THREE.SphereGeometry(25, 28, 12, 0, Math.PI * 1.3, 0, Math.PI * .32), new THREE.MeshStandardMaterial({ color: '#c8b898', roughness: .9, side: THREE.DoubleSide }));
  dome.position.set(px, py + 4, pz); dome.rotation.y = .7; dome.castShadow = true; ctx.add(dome);
  for (let i = 0; i < 12; i++) ctx.box(2 + i % 3, 1 + i % 2, 2, px - 10 + (i * 7) % 20, py - .5, pz - 8 + (i * 5) % 16, stone, { rotY: i });
  ctx.poi(px - 28, pz + 8, 'La Fosse aux Dragons', 'On y gardait les dragons des Targaryen. Le dôme s’est effondré il y a plus d’un siècle ; les enfants jurent qu’on y entend encore des battements d’ailes.');
  // Porte des Dieux et remparts ouest (segments qui suivent la pente)
  for (let z = -150; z < 50; z += 20) {
    if (Math.abs(z + 10 - 20) < 12) continue;
    const y = Math.min(height(-165, z), height(-165, z + 20)) - 3;
    ctx.wall(-165, z, -165, z + 20, { h: height(-165, z + 10) - y + 9, t: 3, y, mat: red, outward: [-1, 0] });
  }
  for (const [a, b] of [[0, 8.5], [31.5, 40]]) { const y = Math.min(height(-165, a), height(-165, b)) - 3; ctx.wall(-165, a, -165, b, { h: height(-165, (a + b) / 2) - y + 9, t: 3, y, mat: red, outward: [-1, 0] }); }
  const gy = height(-165, 20) - 2;
  for (const s of [-1, 1]) ctx.tower(-165, 20 + s * 8, { w: 7, h: 16, y: gy, mat: red, round: true });
  ctx.box(3, 4, 12, -165, gy + 9, 20, red, { solid: false });
  for (const s of [-1, 1]) P.banner(-163.3, gy + 14, 20 + s * 8, 'baratheon', Math.PI / 2, 1.3);
  ctx.poi(-158, 20, 'La porte des Dieux', 'La porte de l’ouest, flanquée de deux tours. Au-delà, la route qui mène aux collines… et aux bandits.');
  // Place du marché
  P.market(PLAZA[0], PLAZA[1], 9, 7, ['#8b0000', '#c9a227', '#2f6b70', '#5a3a6e', '#c8702a', '#4f7a3a', '#6a2a5a']);
  ctx.poi(PLAZA[0], PLAZA[1] + 12, 'Le marché de la porte', 'Oranges de Dorne, soie de Myr, pain chaud et couteaux bon marché. Surveillez votre bourse.');
  // Étendards : Donjon Rouge (lion et cerf), avenue principale
  const [kx, kz, ky] = keep;
  for (let i = -2; i <= 2; i++) P.banner(kx + i * 9, ky + 13, kz + 26.3, i % 2 ? 'lannister' : 'baratheon', 0, 2);
  for (let z = 50; z > 0; z -= 12) { P.standard(-5.4, z, z % 24 ? 'baratheon' : 'lannister', 6); P.lantern(5.4, z - 6, 3.2); }
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; (i % 2 ? P.crate : P.barrel)(FLEA[0] + Math.cos(a) * 8, FLEA[1] + Math.sin(a) * 8, 1, a); }
  P.cart(FLEA[0] + 5, FLEA[1] + 3, .7);
  // Quais : tonneaux, caisses, sacs, charrettes
  for (let i = 0; i < 26; i++) { const x = -90 + i * 7.3, z = 59 + (i % 3) * .9; i % 3 === 0 ? P.barrel(x, z) : i % 3 === 1 ? P.crate(x, z, 1, i * .4) : P.sack(x, z); }
  P.cart(-38, 54, 1.4); P.cart(24, 54, -1.3); P.cart(PLAZA[0] + 14, PLAZA[1] + 6, .3);
}
