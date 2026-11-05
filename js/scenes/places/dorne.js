// DORNE — les Jardins Aquatiques : palais de marbre rose à coupoles, arcades, bassins en terrasses qui
// descendent vers la mer, orangers et palmiers ; à l'ouest, la ville d'Ombre de Lancehélion, maisons de terre
// à toits plats, la tour du Soleil et la tour de la Lance.
import { smooth, noise } from '../light/util.js';
import { dome, road } from './kit.js';

import { room } from './rooms.js';
export const config = { hdri: 'qwantani_noon_puresky', exposure: 1.02, bg: 1.6, env: 1, fog: ['#f0dcc0', .0022], hemi: ['#fff4e0', '#a07a5a', .55], sun: ['#fff1d8', 4, [.3, 1, .2]], bloom: [.35, .5, .9], tint: '#fff4e8', bounds: [-230, -160, 150, 190] };
export const height = (x, z) => 1.2 + noise(x * .5, z * .5) * .4 * smooth(70, 120, Math.hypot(x + 40, z)) - 7 * smooth(130, 175, z) + 14 * smooth(150, 260, -z);

export async function build(ctx) {
  const { THREE, mat, props: P, rand } = ctx;
  const sand = mat('brown_mud', { uv: 6, color: '#e8cfa0', rough: 1 }), pink = mat('plastered_wall', { uv: 5, color: '#f2d6c8' }), marble = mat('plastered_wall', { uv: 4, color: '#fbf2ea' });
  const goldDome = mat(null, { color: '#e0b050', metal: .6, rough: .35 }), copper = mat(null, { color: '#5aa08a', metal: .5, rough: .4 }), tile = mat('cobblestone_floor_01', { uv: 2.5, color: '#f0dcc8' });
  ctx.terrain({ size: 800, seg: 180, height, mat: sand, splat: { slope: 'rocky_terrain_02', slopeTint: '#e8c090' } });
  ctx.water({ reflect: true, y: 0, color: '#1f6a7a', w: 1200, d: 500, z: 420, sun: '#fff1d8' });

  // --- le palais ---
  const PX = 0, PZ = -40;
  ctx.box(70, .3, 46, PX, 1.1, PZ, tile, { solid: false, cast: false });
  const lawn = mat('brown_mud', { uv: 3, color: '#7aa04a', rough: 1 });
  for (const s of [-1, 1]) ctx.box(22, .08, 92, PX + s * 33, height(PX, PZ + 60) + .05, PZ + 62, lawn, { solid: false, cast: false });
  ctx.box(8, .06, 100, PX, height(PX, PZ + 60) + .04, PZ + 66, tile, { solid: false, cast: false });
  ctx.box(40, 12, 22, PX, 1, PZ - 6, pink); dome(ctx, PX, 13, PZ - 6, 9, goldDome, { sy: 1.25, spire: goldDome });
  for (const s of [-1, 1]) { ctx.box(14, 9, 16, PX + s * 25, 1, PZ - 4, pink); dome(ctx, PX + s * 25, 10, PZ - 4, 6, copper, { sy: 1.3, spire: goldDome }); ctx.tower(PX + s * 34, PZ - 14, { w: 5, h: 22, mat: pink, round: true }); dome(ctx, PX + s * 34, 23, PZ - 14, 2.8, goldDome, { sy: 1.4 }); }
  for (let i = 0; i < 13; i++) { const x = PX - 30 + i * 5; ctx.cyl(.45, 6, x, 1, PZ + 9, marble, { seg: 10 }); }
  ctx.box(64, 1, 3, PX, 7, PZ + 9, marble, { solid: false });
  for (const x of [-20, -10, 0, 10, 20]) P.banner(PX + x, 11.5, PZ + 5.2, 'martell', 0, 1.2);
  room(ctx, 'hall', { x: PX, z: PZ + 7, yaw: Math.PI }, { label: 'Entrer dans le palais', banner: 'martell', wall: 'plastered_wall', wallColor: '#f2d6c8', floorColor: '#f0dcc8', title: 'La salle des fontaines', text: 'Des arcades ouvertes sur la mer, des coussins, des oranges sanguines dans des coupes d’argent.' });
  ctx.poi(PX, PZ + 14, 'Le palais des Jardins Aquatiques', 'Marbre rose, coupoles d’or, colonnades où le vent de la mer passe comme une caresse. Un prince de Dorne l’a bâti pour sa femme, venue d’un pays sans pluie.', { color: '#ffb070' });

  // --- bassins en terrasses ---
  for (let k = 0; k < 4; k++) {
    const z = PZ + 26 + k * 20, y = height(PX, z) - k * .3;
    for (const s of [-1, 1]) {
      const x = PX + s * 14;
      ctx.box(18, .5, 12, x, y - .2, z, marble, { solid: false });
      ctx.water({ x, z, y: y + .15, w: 16, d: 10, color: '#3aa0b0', opacity: .85 });
      ctx.emitter('steam', x, y + .2, z, { box: [1, 3, 1], count: 25, opacity: .35 });
    }
  }
  ctx.poi(PX, PZ + 40, 'Les bassins', 'Des bassins de marbre qui descendent en cascade vers la mer. Les enfants de toutes conditions s’y baignent ensemble : c’est la loi du palais, et la plus belle de Dorne.', { color: '#6ad0e0' });
  // orangers en allées, palmiers sur la plage
  const oranges = []; for (let k = 0; k < 8; k++) for (const s of [-1, 1]) oranges.push([PX + s * 30, PZ + 20 + k * 11, .8 + rand() * .2]);
  ctx.trees(oranges, 'round', { leaf: '#4a7a2a' });
  const fruit = new THREE.InstancedMesh(new THREE.SphereGeometry(.12, 6, 5), new THREE.MeshStandardMaterial({ color: '#ff9a1a', roughness: .6 }), oranges.length * 10), M = new THREE.Matrix4();
  oranges.forEach(([x, z], i) => { for (let j = 0; j < 10; j++) fruit.setMatrixAt(i * 10 + j, M.makeTranslation(x + (rand() - .5) * 3, height(x, z) + 3 + rand() * 1.6, z + (rand() - .5) * 3)); }); ctx.add(fruit);
  const palms = []; for (let i = 0; i < 70; i++) palms.push([-200 + rand() * 340, 128 + rand() * 30, .9 + rand() * .4]); ctx.trees(palms, 'palm', { leaf: '#4a7a3a' });

  // --- Lancehélion : ville d'Ombre (toits plats), tour du Soleil, tour de la Lance ---
  const SX = -140, avoid = (x, z, w = 0, d = 0) => Math.abs(z - 20) < 4 + d / 2 || Math.hypot(x - SX, z + 60) < 24 || Math.abs(x - SX) < 4 + w / 2;
  const city = ctx.cityGrid({ x0: -215, x1: -70, z0: -110, z1: 110, block: 13, street: 3.2, hMin: 3.5, hMax: 8, empty: .08, avoid });
  ctx.houses(city.lots, { style: 'dorne', wall: mat('plastered_wall', { uv: 4, instanced: true }), tints: ['#e8cca0', '#dcb888', '#f0dcb8', '#d8a878'], flat: true, windows: '#3a2a1e', sink: 2 });
  ctx.tower(SX, -60, { w: 14, h: 30, mat: pink, round: true }); dome(ctx, SX, 31, -60, 9, goldDome, { sy: 1.2, spire: goldDome });
  ctx.poi(SX, -40, 'La tour du Soleil', 'Sous son dôme de verre et d’or siègent les princes de Dorne. Au sol, une mosaïque du soleil percé d’une lance : on ne marche jamais sur la lance.', { color: '#ffb070' });
  ctx.tower(SX + 26, -70, { w: 6, h: 46, mat: pink, round: true }); ctx.cyl(.25, 10, SX + 26, 46, -70, goldDome, { seg: 6, solid: false });
  ctx.poi(SX + 26, -60, 'La tour de la Lance', 'Une tour fine comme une lance, coiffée d’une lance d’or. Les Dorniens disent que leur royaume ne s’est jamais agenouillé ; ils ont presque raison.');
  P.market(SX, 20, 10, 8, ['#d97a2a', '#b0201a', '#e0b050', '#2f6b70', '#7a3a6e']);
  ctx.poi(SX, 34, 'Le marché de la ville d’Ombre', 'Piment, dattes, vin rouge épais comme du sang et poignards à lame courbe. Tout se marchande, même les sourires.');
  for (const z of [-80, -20, 40, 90]) P.banner(-72, 6, z, 'martell', Math.PI / 2, 1.2);
  road(ctx, -70, 20, PX - 30, 20, { w: 5, color: '#d8c090', lanterns: true });
  ctx.particles('dust', { color: '#ffe2a0' });
  ctx.spawn(PX, 74, 0);
  ctx.sound({ name: 'waves', volume: .5, pos: [0, 0, 170], ref: 30 }, { name: 'crowd', volume: .25, pos: [SX, 0, 20], ref: 40 }, { name: 'gull', volume: .4, every: [6, 12], randomPos: [0, 15, 160, 120] });
}
