// Villages originaux entre les grandes cités : même plan (place, puits, marché, maisons en couronne, auberge,
// septuaire ou moulin), habillé selon la région (neige du Nord, prés du Conflans, côte, vergers, oasis de Dorne).
import { noise, smooth } from '../light/util.js';
import { village, road, harbor } from './kit.js';

const V = {
  combegivre: { hdri: 'kloofendal_overcast_puresky', ground: ['snow_02', '#eef2f6'], fog: ['#c3cad2', .006], sun: ['#e6ecf5', 1.5], tree: ['pine', '#2c3f33'], walls: ['#d8c6aa', '#cbbfae', '#e8d8c0'], roofs: ['#8a7a6a', '#6a5a4a'], banner: 'stark', particles: 'snow', sound: 'blizzard', feature: 'mill', hills: 14 },
  gue: { grass: 1, hdri: 'kloofendal_misty_morning_puresky', ground: ['grass_ground', '#c8ccb0'], fog: ['#cfd6d0', .007], sun: ['#fff0d8', 2.2], tree: ['round', '#4f7a3a'], walls: ['#e8d8c0', '#d8c6aa'], roofs: ['#8a6a4a', '#9a7a5a'], banner: 'baratheon', particles: 'dust', sound: 'wind', feature: 'river', hills: 6 },
  portsel: { grass: 1, hdri: 'kloofendal_overcast_puresky', ground: ['grass_ground', '#b8b8a0'], fog: ['#c8d0d4', .005], sun: ['#eef2f6', 2], tree: ['pine', '#3a5a44'], walls: ['#e6e2d8', '#d4d0c4'], roofs: ['#5a6a7a', '#4a5a6a'], banner: 'arryn', particles: 'dust', sound: 'waves', feature: 'port', hills: 8 },
  mielbois: { grass: 1, hdri: 'kloppenheim_06_puresky', ground: ['grass_ground', '#d8dcb0'], fog: ['#e0e8d8', .004], sun: ['#fff4dc', 3], tree: ['round', '#5a8a3a'], walls: ['#fbf2e2', '#f0e2c8'], roofs: ['#c08050', '#a86a40'], banner: 'tyrell', particles: 'petals', sound: 'wind', feature: 'orchard', hills: 5 },
  sablerouge: { hdri: 'qwantani_noon_puresky', ground: ['brown_mud', '#d8a070'], fog: ['#f0d0a8', .004], sun: ['#fff1d8', 4], tree: ['palm', '#4a7a3a'], walls: ['#e0b080', '#d8a070', '#e8c49a'], roofs: [], flat: true, banner: 'martell', particles: 'dust', sound: 'wind', feature: 'oasis', hills: 10 }
};
import { room } from './rooms.js';
import { walkHouse } from './houses.js';
export const config = id => { const v = V[id]; return { hdri: v.hdri, exposure: 1, bg: 1, env: 1, fog: v.fog, hemi: ['#f4f0e8', '#5a4a3a', .55], sun: [v.sun[0], v.sun[1], [.4, .6, .3]], bloom: [.4, .5, .88], tint: '#fff8f0', bounds: [-150, -150, 150, 150] }; };

export async function build(ctx, id) {
  const v = V[id], { mat, props: P, rand } = ctx;
  const h = (x, z) => noise(x, z) * .5 + v.hills * smooth(70, 150, Math.hypot(x, z)) * (1 + noise(x * .3, z * .3) * .3) - (v.feature === 'port' ? 6 * smooth(40, 70, z) : 0) - (v.feature === 'river' ? 2.4 * (1 - smooth(4, 9, Math.abs(z - 45))) : 0);
  ctx.terrain({ size: 600, seg: 150, height: h, mat: mat(v.ground[0], { uv: 6, color: v.ground[1], rough: 1 }), splat: { slope: 'rocky_terrain_02' } });
  if (v.grass) ctx.grass({ area: [-110, -110, 110, 110], count: 36000, avoid: (x, z) => Math.hypot(x, z) < 44 || Math.abs(x) < 4 || (v.feature === 'river' && Math.abs(z - 45) < 8) || (v.feature === 'port' && z > 34) || Math.hypot(x, z + 56) < 16 });
  const wall = mat('plastered_wall', { uv: 4, instanced: true }), roof = mat(v.flat ? null : 'clay_roof_tiles', { uv: 2.5, instanced: true });
  village(ctx, 0, 0, { style: { combegivre: 'nord', gue: 'nord', portsel: 'fer', mielbois: 'bief', sablerouge: 'dorne' }[id], houses: 22, radius: 22, banner: v.banner, wall, roof, tints: v.walls, roofTints: v.roofs, flat: v.flat, avoid: (x, z) => Math.abs(x) < 5 && z > 0 || (v.feature === 'port' && z > 36) || (v.feature === 'river' && Math.abs(z - 45) < 7) });
  road(ctx, 0, 140, 0, 8, { w: 4.5 });
  const warm = !!v.flat, style = warm ? { stone: '#c8a070', plaster: '#e8c49a', roofTex: 'clay_roof_tiles', roof: '#b0704a' } : { stone: '#9a9690', plaster: '#e6dcc8', roof: v.roofs[0] ?? '#7a6a5a' };
  walkHouse(ctx, -9, -56, 0, { ...style, house: v.banner, owner: 'La veuve du meunier', name: 'Une maison du village' }); walkHouse(ctx, 9, -56, 0, { ...style, owner: 'Le forgeron du village' }); road(ctx, -140, -10, -8, -4, { w: 4 });
  // auberge : grande maison à étage, enseigne, bancs
  const inn = mat('weathered_planks', { uv: 3, color: '#b09070' });
  ctx.box(12, 7, 9, -14, h(-14, 8) - .5, 8, inn); ctx.roof(13, 3.5, 10, -14, h(-14, 8) + 6.5, 8, mat('grey_roof_tiles', { uv: 3, color: '#7a6a5a' }));
  ctx.box(1.6, 1, .1, -14, h(-14, 8) + 3.4, 12.6, mat(null, { color: '#c9a227' }), { solid: false }); P.bench(-10, 14); P.bench(-18, 14); ctx.torch(-9.5, h(-14, 8) + 2.8, 12.8, { light: true });
  room(ctx, 'inn', { x: -14, z: 14.4, yaw: Math.PI }, { label: 'Entrer dans l’auberge', title: 'Dans l’auberge', text: 'Une salle basse, enfumée, chaude. Les habitués lèvent à peine les yeux ; l’aubergiste, lui, vous a déjà jaugé.' });
  ctx.poi(-14, 16, 'L’auberge', 'Un feu, une soupe, des rumeurs et un lit qui ne grince pas trop. Le patron connaît tout le monde, et surtout leurs dettes.');
  const F = v.feature, wood = mat('weathered_planks', { uv: 2, color: '#8a6a4a' });
  if (F === 'mill') { ctx.tower(30, -30, { w: 6, h: 10, mat: inn, roof: mat(null, { color: '#5a4a3a' }), roofH: 4 }); const blades = ctx.box(.4, 14, 1, 30, h(30, -30) + 8, -26.8, wood, { solid: false }); ctx.update(t => (blades.rotation.z = t * .4)); ctx.poi(30, -24, 'Le moulin', 'Ses ailes tournent même quand tout gèle. Le meunier dit que c’est le vent du Nord qui lui doit une faveur.'); }
  if (F === 'river') { ctx.water({ x: 0, z: 45, y: -1, w: 600, d: 12, color: '#3a5a5a' }); ctx.box(5, .5, 14, 0, -.2, 45, wood, { solid: false }); ctx.poi(0, 38, 'Le gué', 'L’eau arrive aux genoux en été, à la poitrine au printemps. Les corbeaux, eux, n’ont jamais quitté les arbres.'); }
  if (F === 'port') { ctx.water({ reflect: true, y: 0, z: 300, w: 900, d: 500, color: '#2a4a5a' }); await harbor(ctx, [[20, 70, 1.4], [-30, 90, 2]], { piers: [[0, 56, 26, 0], [-24, 56, 20, 0]] }); for (let i = 0; i < 8; i++) P.barrel(-6 + i * 1.5, 46); ctx.poi(0, 44, 'Le port', 'Des filets qui sèchent, des barques retournées et des pêcheurs qui jurent que la mer était plus poissonneuse avant.'); }
  if (F === 'orchard') { const o = []; for (let i = 0; i < 12; i++) for (let j = 0; j < 6; j++) o.push([40 + i * 5, -40 + j * 6, .7]); ctx.trees(o, 'round', { leaf: '#6a9a3a' }); for (let i = 0; i < 6; i++) ctx.box(.8, .9, .8, 36, h(36, -40 + i * 6), -40 + i * 6, mat(null, { color: '#d8b040' })); ctx.poi(60, -46, 'Les vergers et les ruches', 'Pommes, poires et miel doré. À la saison, tout le village sent la compote.'); }
  if (F === 'oasis') { ctx.water({ x: 30, z: -30, y: -.2, w: 26, d: 18, color: '#2a8a90' }); const p = []; for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28; p.push([30 + Math.cos(a) * 17, -30 + Math.sin(a) * 13, .9 + rand() * .3]); } ctx.trees(p, 'palm', { leaf: '#4a7a3a' }); ctx.poi(30, -14, 'L’oasis', 'Le seul bleu à dix lieues à la ronde. Celui qui trouble l’eau du puits est chassé du village — avant le coucher du soleil.'); }
  const trees = []; for (let i = 0; i < 160; i++) { const a = rand() * 6.28, r = 60 + rand() * 120; trees.push([Math.cos(a) * r, Math.sin(a) * r, .9 + rand() * .6]); }
  ctx.trees(trees.filter(([x, z]) => Math.abs(x) > 8 && !(F === 'port' && z > 30)), v.tree[0], { leaf: v.tree[1] });
  ctx.particles(v.particles);
  ctx.spawn(0, 60, 0);
  ctx.sound({ name: v.sound, volume: .4 }, { name: 'crowd', volume: .15 });
}
