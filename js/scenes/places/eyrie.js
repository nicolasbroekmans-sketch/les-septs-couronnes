// LES EYRIÉ — le Val d'Arryn : vallée verte, la Porte de la Lune et son village au pied de la Lance du Géant,
// trois relais accrochés à la pente (Pierre, Neige, Ciel) et, tout en haut, le château blanc aux sept tours.
// On monte et on descend par le panier des vivres (plateforme à poulie), comme les intendants du château.
import { smooth, noise } from '../light/util.js';
import { village, road } from './kit.js';

import { room } from './rooms.js';
export const config = { hdri: 'kloppenheim_06_puresky', exposure: 1.05, bg: 1, env: 1, fog: ['#dfe8f0', .0022], hemi: ['#f0f6ff', '#56606a', .55], sun: ['#ffffff', 3, [.5, .7, .3]], bloom: [.4, .5, .88], tint: '#f6faff', bounds: [-200, -260, 200, 200] };

const PEAK = [0, -150], TOP = 180;
const mountain = (x, z) => { const r = Math.hypot(x - PEAK[0], z - PEAK[1]); return Math.min(TOP, 215 * Math.exp(-((r / 76) ** 2))) + (r > 32 ? noise(x, z) * 2.5 * smooth(32, 60, r) : 0); };
export const height = (x, z) => Math.max(mountain(x, z), noise(x * .6, z * .6) * 1.2 + 70 * smooth(230, 330, Math.hypot(x, z + 40)) + noise(x * 2, z) * 6 * smooth(230, 330, Math.hypot(x, z + 40)));

export async function build(ctx) {
  const { THREE, mat, props: P, rand } = ctx;
  const grass = mat('grass_ground', { uv: 6, color: '#d0d8b0', rough: 1 }), white = mat('plastered_wall', { uv: 5, color: '#f6f4ee' });
  const grey = mat('castle_wall_slates', { normal: 'castle_wall_slates_nor', uv: 5, color: '#c8ccd2' }), blue = mat('grey_roof_tiles', { uv: 2, color: '#7a94b4' });
  ctx.terrain({ size: 900, seg: 230, height, mat: grass, splat: { slope: 'cliff_side', slopeTint: '#c8c8c4', high: 'snow_03', highY: 125, scale: 12 } });
  ctx.grass({ area: [-130, 30, 130, 200], count: 40000, avoid: (x, z) => Math.abs(x) < 5 || Math.hypot(x, z - 100) < 46 || (Math.abs(x) < 32 && z < 52) });
  // neige et roche sur les hauteurs (anneau de pics + Lance du Géant)
  const rock = mat('rock_face', { uv: 8, color: '#9a9c9e' });
  for (let i = 0; i < 26; i++) { const a = rand() * 6.28, r = 40 + rand() * 50, x = PEAK[0] + Math.cos(a) * r, z = PEAK[1] + Math.sin(a) * r; ctx.cone(6 + rand() * 6, 14 + rand() * 18, x, height(x, z) - 6, z, rock, { seg: 5, solid: false, rotY: rand() * 3 }); }

  // --- Porte de la Lune : château gardant l'entrée de la montagne ---
  const gy = height(0, 25);
  ctx.ring(-26, 4, 26, 44, { y: gy - 1, h: 12, t: 3, mat: grey, gate: 'S', gateW: 6, round: true, towerW: 7, towerExtra: 6, towerRoof: blue });
  ctx.box(18, 14, 12, 0, gy - 1, 14, grey); ctx.roof(19, 6, 13, 0, gy + 13, 14, blue);
  ctx.tower(-12, 12, { w: 6, h: 24, y: gy - 1, mat: grey, round: true, roof: blue, roofH: 7 });
  for (const x of [-6, 0, 6]) P.banner(x, gy + 11, 20.2, 'arryn', 0, 1.3);
  P.standard(-5, 48, 'arryn', 8); P.standard(5, 48, 'arryn', 8);
  ctx.poi(0, 50, 'La Porte de la Lune', 'Le château d’hiver des Arryn, au pied de la montagne. Quand la neige ferme la route, toute la cour descend ici — à dos de mule, en grommelant.', { color: '#a8c4ff' });

  // --- village au pied du château ---
  village(ctx, 0, 100, { style: 'bief', houses: 24, radius: 28, banner: 'arryn', wall: mat('plastered_wall', { uv: 4, instanced: true }), roof: mat('grey_roof_tiles', { uv: 3, instanced: true }),
    tints: ['#f2ece0', '#e6dccb', '#ece6da'], roofTints: ['#7a94b4', '#8aa0bc', '#6a8098'], avoid: (x, z) => Math.abs(x) < 6, name: 'Le village de la Porte', text: 'Des fermiers du Val, des muletiers, une auberge qui sent le pain chaud. Tout ce qui monte aux Eyrié passe d’abord par ici.' });
  road(ctx, 0, 160, 0, 46, { w: 5, lanterns: true });
  const trees = [];
  for (let i = 0; i < 260; i++) { const x = (rand() - .5) * 420, z = 60 + rand() * 160; if (Math.abs(x) > 50 || z > 150) trees.push([x, z, .9 + rand() * .6]); }
  ctx.trees(trees, 'round', { leaf: '#5a8a3a' });
  const pines = []; for (let i = 0; i < 300; i++) { const a = rand() * 6.28, r = 95 + rand() * 120, x = PEAK[0] + Math.cos(a) * r, z = PEAK[1] + Math.sin(a) * r; if (z < 10 && Math.abs(x) > 8) pines.push([x, z, 1 + rand() * .7]); }
  ctx.trees(pines, 'pine', { leaf: '#2c4a36' });

  // --- relais sur la pente : Pierre, Neige, Ciel ---
  for (const [name, r, a, txt] of [['Pierre', 110, .6, 'Le premier relais : une tour carrée, des mules, un feu.'], ['Neige', 76, -.55, 'Le vent y siffle à travers les meurtrières. On y change de mules.'], ['Ciel', 46, .25, 'Un simple mur et une cour de pierre au bord du vide. Au-dessus, plus rien que le château.']]) {
    const x = PEAK[0] + Math.sin(a) * r, z = PEAK[1] + Math.cos(a) * r, y = height(x, z) - 3;
    ctx.tower(x, z, { w: 6, h: 12, y, mat: grey, roof: blue, roofH: 5 }); ctx.box(10, 4, .8, x, y, z + 4, grey, { solid: false });
    ctx.torch(x + 3.4, y + 6, z + 3.3, { light: false });
    ctx.poi(x, z + 6, 'Le relais du ' + name, txt);
  }

  // --- LES EYRIÉ : sept tours blanches sur le sommet ---
  const [px, pz] = PEAK, y = TOP;
  ctx.box(56, .3, 56, px, y - .15, pz, mat('cobblestone_floor_01', { uv: 3, color: '#e0e2e6' }), { solid: false, cast: false });
  // sept tours élancées à étages, balcons et flèches (d'après la peinture) : la plus haute au centre
  const spire = (x, z, r, h) => {
    ctx.cyl(r, h, x, y, z, white, { seg: 16 }); ctx.cyl(r * 1.25, .8, x, y + h * .62, z, white, { seg: 16, solid: false });
    ctx.cyl(r * .72, h * .35, x, y + h, z, white, { seg: 14 }); ctx.cyl(r * .95, .7, x, y + h * 1.35, z, white, { seg: 14, solid: false });
    ctx.cone(r * .8, r * 4.5, x, y + h * 1.35 + .7, z, blue, { seg: 14, rotY: 0 });
    for (let k = 0; k < 6; k++) { const a2 = k / 6 * 6.28; ctx.box(.5, 1.6, .2, x + Math.cos(a2) * r * .73, y + h * 1.15, z + Math.sin(a2) * r * .73, mat(null, { color: '#2a3a4a', emissive: '#ffd890', ei: .3 }), { rotY: -a2 + Math.PI / 2, solid: false }); }
  };
  spire(px, pz - 4, 5, 46);
  for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28 + .3; spire(px + Math.cos(a) * 18, pz + Math.sin(a) * 18, 2.6, 26 + (i % 3) * 8); }
  ctx.box(16, 10, 9, px - 6, y, pz + 8, white); ctx.roof(17, 4, 10, px - 6, y + 10, pz + 8, blue);
  for (let i = 0; i < 40; i++) { const a = i / 40 * 6.28; if (Math.abs(a - Math.PI / 2) < .2) continue; ctx.box(4.2, 1.2, .8, px + Math.cos(a) * 27, y, pz + Math.sin(a) * 27, white, { rotY: -a + Math.PI / 2 }); }
  for (const a of [.9, 2.2, 3.6, 5]) P.banner(px + Math.cos(a) * 8.6, y + 22, pz - 4 + Math.sin(a) * 8.6, 'arryn', -a + Math.PI / 2, 1.4);
  // la Porte de la Lune (trappe sur le vide), le jardin et la statue
  const hole = new THREE.Mesh(new THREE.CircleGeometry(2.2, 32), new THREE.MeshBasicMaterial({ color: '#cfe4ff', transparent: true, opacity: .55 })); hole.rotation.x = -Math.PI / 2; hole.position.set(px - 6, y + .05, pz + 15); ctx.add(hole);
  ctx.update(t => (hole.material.opacity = .45 + Math.sin(t * 1.4) * .15));
  room(ctx, 'hall', { x: px, z: pz + 3.4, yaw: Math.PI }, { label: 'Entrer dans la Grande Salle', banner: 'arryn', wall: 'plastered_wall', wallColor: '#f0eee8', floorColor: '#d8dce2', title: 'La Grande Salle des Eyrié', text: 'Marbre blanc veiné de bleu, des colonnes fines comme des lances, et la lumière froide du ciel.' });
  ctx.poi(px - 6, pz + 18, 'La Porte de la Lune', 'Dans la salle haute, une porte de barral ouverte… sur rien. Six cents mètres de vide. Les Arryn y rendent la justice ; personne n’a jamais fait appel.', { color: '#cfe4ff' });
  ctx.box(10, .3, 8, px + 10, y, pz + 12, mat('brown_mud', { uv: 2, color: '#8fae6a' }), { solid: false }); ctx.box(1.2, 4.5, 1.2, px + 10, y, pz + 12, white);
  ctx.poi(px + 10, pz + 17, 'Le jardin des Eyrié', 'Un carré d’herbe et une statue de pleureuse, au cœur du château. Les enfants Arryn y apprennent à marcher sans jamais regarder par-dessus le mur.');

  // --- panier des vivres : monter / descendre ---
  const base = { x: 0, z: -8 }, top = { x: px, z: pz + 24 }, wood = mat('weathered_planks', { uv: 2, color: '#8a6a4a' }), by = height(base.x, base.z);
  for (const [p, yy] of [[base, by], [top, y]]) { ctx.box(3, .3, 3, p.x, yy, p.z, wood, { solid: false }); for (const s of [-1, 1]) ctx.box(.2, 4, .2, p.x + s * 1.4, yy, p.z, wood, { solid: false }); ctx.box(3, .2, .2, p.x, yy + 4, p.z, wood, { solid: false }); ctx.glow(p.x, yy + 1, p.z, '#ffe8a0', 1.5); }
  ctx.poi(base.x, base.z + 4, 'Le panier des vivres', 'Montez sur la plateforme : le treuil vous hisse jusqu’aux Eyrié. Six cents mètres de corde. Ne regardez pas en bas.', { color: '#ffe8a0' });
  let cd = 0;
  ctx.update((t, dt, pl) => {
    if (!pl || (cd -= dt) > 0) return;
    for (const [from, to, ty] of [[base, top, y], [top, base, by]]) if (Math.hypot(pl.pos.x - from.x, pl.pos.z - from.z) < 1.3) { pl.pos.x = to.x; pl.pos.z = to.z + (to === top ? -2.5 : 2.5); pl.pos.y = ty + .2; pl.vy = 0; cd = 3; break; }
  });
  ctx.particles('dust', { color: '#ffffff' });
  ctx.spawn(0, 150, 0);
  ctx.sound({ name: 'wind', volume: .5 }, { name: 'chime', volume: .3, rate: .7, pos: [0, 30, 20], every: [25, 45], ref: 30 });
}
