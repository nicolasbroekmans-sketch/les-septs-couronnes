// Port-Réal, détails inspirés de la série : Fosse aux Dragons en ruine, porte des Dieux et remparts,
// place du marché, étendards lion et cerf, quais encombrés, lanternes, charrettes.
import { height } from './klTerrain.js';

export const PLAZA = [-32, 38], PIT = [95, -118], FLEA = [-22, -8];
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
  // Tour de la Main, dans l'enceinte du Donjon Rouge
  const brick = red;
  ctx.tower(kx - 20, kz - 14, { w: 9, h: 30, y: ky - 4, mat: brick, roof: ctx.mat('clay_roof_tiles', { uv: 2, color: '#b0603a' }), roofH: 8 });
  P.banner(kx - 20, ky + 20, kz - 9.4, 'baratheon', 0, 1.6);
  ctx.poi(kx - 20, kz - 6, 'La tour de la Main', 'Ici vit la Main du Roi, celle qui gouverne pendant que le roi chasse. On dit que ses occupants meurent rarement de vieillesse.');
  // Rue de l'Acier : forges en bord de rue, enclumes, braises
  const coal = ctx.mat(null, { color: '#ff5a10', emissive: '#ff4a00', ei: 2.5 }), dark = ctx.mat(null, { color: '#2b2b2e', metal: .8, rough: .4 }), st = ctx.mat('castle_wall_slates', { uv: 2, color: '#7a7a7a' });
  for (const x of [-30, -48, -66, -84]) {
    const y = height(x, 22.4); ctx.box(1.6, .9, 1, x, y, 22.4, st); ctx.box(1.3, .12, .7, x, y + .9, 22.4, coal, { solid: false }); ctx.fire(x, y + 1, 22.4, .35, { intensity: 10 });
    ctx.box(.5, .6, .9, x + 1.8, y, 22, dark); for (let k = 0; k < 3; k++) ctx.box(.04, 1, .05, x - 1.5 + k * .25, y + .4, 23, dark, { solid: false });
  }
  ctx.poi(-48, 18, 'La rue de l’Acier', 'Le chant des marteaux du matin au soir. Les meilleurs forgerons du royaume ont leur échoppe ici — et leurs prix aussi.', { color: '#ff8a4a' });
  // Statue devant le Grand Septuaire
  const sx = -70, sz = -40, sy = height(sx, sz), marble = ctx.mat('plastered_wall', { uv: 3, color: '#ece6d8' });
  ctx.box(3, 2, 3, sx, sy, sz, marble); ctx.cyl(.7, 3.6, sx, sy + 2, sz, marble, { seg: 10, rTop: .45 }); ctx.box(.5, .55, .5, sx, sy + 5.6, sz, marble);
  for (const s of [-1, 1]) ctx.box(.25, 1.4, .25, sx + s * .6, sy + 4.3, sz + .3, marble, { rotY: s * .3, solid: false });
  ctx.poi(sx, sz + 4, 'La statue de Baelor', 'Un roi en prière, les bras tendus vers la foule. Il jeûnait pour les Sept ; le peuple, lui, jeûnait sans le vouloir.');
  // Rempart nord : la Vieille Porte et la porte des Dieux (on sort vers la route royale et le Bois-du-Roi)
  for (let x = -165; x < 160; x += 20) {
    if (Math.abs(x + 10 - -30) < 12 || Math.abs(x + 10 - 60) < 12) continue;
    const y = Math.min(height(x, -168), height(x + 20, -168)) - 3; ctx.wall(x, -168, x + 20, -168, { h: height(x + 10, -168) - y + 9, t: 3, y, mat: red, outward: [0, -1] });
  }
  for (const [gx, name, txt] of [[-30, 'La Vieille Porte', 'La plus ancienne porte de la ville. Elle ouvre sur la route royale, qui monte vers le Nord : mille lieues jusqu’au Mur.'], [60, 'La porte des Dieux', 'Ses statues des Sept regardent passer les voyageurs. Au-delà commencent les collines et le Bois-du-Roi.']]) {
    const y = height(gx, -168) - 2; for (const s of [-1, 1]) ctx.tower(gx + s * 8, -168, { w: 7, h: 16, y, mat: red, round: true });
    ctx.box(12, 4, 3, gx, y + 9, -168, red, { solid: false }); for (const s of [-1, 1]) P.banner(gx + s * 8, y + 14, -164.4, 'baratheon', 0, 1.3);
    ctx.poi(gx, -160, name, txt);
  }
}
