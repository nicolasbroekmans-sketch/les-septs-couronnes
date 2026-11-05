// CASTRAL ROC — une montagne dorée posée sur la mer du Couchant. À ses pieds, Port-Lannis : remparts,
// port plein de navires, septuaire à dôme, marché, ruelles ; dans la falaise, la gueule de la porte du Lion ;
// au sommet, les tours rouge et or des Lannister.
import { smooth, noise } from '../light/util.js';
import { dome, harbor, road } from './kit.js';

import { room } from './rooms.js';
export const config = { hdri: 'belfast_sunset_puresky', exposure: .9, bg: .8, env: 1, fog: ['#c89a70', .0018], hemi: ['#ffd9b0', '#5a3a20', .5], sun: ['#ffb46a', 3.2, [-.8, .3, .2]], bloom: [.35, .5, .9], tint: '#fff0dc', bounds: [-150, -170, 230, 190], skyRot: 2.2 };

const rockH = (x, z) => 150 * smooth(28, 80, x + Math.sin(z * .03) * 10) * smooth(-190, -110, z) * (1 - smooth(70, 150, z)) + noise(x, z) * 5 * smooth(30, 60, x);
export const height = (x, z) => x < -118 ? -5 + smooth(-170, -118, x) * 6 : Math.max(1 + noise(x, z) * .15, rockH(x, z));

export async function build(ctx) {
  const { mat, props: P, rand } = ctx;
  const gold = mat('rock_face', { uv: 12, color: '#f4cc84' }), sand = mat('yellow_stone_wall', { uv: 4, color: '#f0d8a8' });
  const red = mat('clay_roof_tiles', { uv: 2, color: '#b8502a' }), wall = mat('yellow_stone_wall', { uv: 5, color: '#e8cc98' }), cob = mat('cobblestone_floor_01', { uv: 3, color: '#cdb48c' });
  ctx.terrain({ size: 800, seg: 230, height, mat: gold, splat: { slope: 'cliff_side', slopeTint: '#f2c88a', scale: 14 } });
  ctx.box(240, .05, 320, -40, 1.02, 10, cob, { solid: false, cast: false });
  ctx.water({ reflect: true, y: 0, color: '#2c4a5a', w: 900, d: 1200, x: -580, sun: '#ffb46a' });

  // --- le château au sommet ---
  const top = (x, z) => height(x, z) - 3;
  for (const [x, z, w, hh] of [[110, -40, 14, 46], [140, -10, 10, 38], [100, 20, 9, 34], [150, -60, 9, 30], [125, 40, 8, 30], [85, -80, 8, 28], [160, 25, 7, 26]]) ctx.tower(x, z, { w, h: hh, y: top(x, z), mat: sand, roof: red, roofH: w * 1.2 });
  ctx.box(46, 20, 30, 125, top(125, -20), -20, sand); ctx.roof(47, 9, 31, 125, top(125, -20) + 20, -20, red);
  for (const [x, z] of [[110, -40], [140, -10], [100, 20]]) P.banner(x - 5.2, top(x, z) + 30, z, 'lannister', -Math.PI / 2, 2);
  ctx.poi(60, 120, 'Castral Roc', 'Le Roc fait trois fois la hauteur du Mur, dit-on à Port-Lannis — ce qui est faux, mais personne ne le vérifie. Les Lannister y vivent au-dessus de tout, y compris de leurs ennemis.', { color: '#ffcf5a' });

  // --- la porte du Lion : gueule de pierre dans la falaise ---
  const black = mat(null, { color: '#120c08' });
  ctx.box(4, 16, 18, 30, 0, 0, black, { solid: false });
  for (const s of [-1, 1]) { ctx.box(8, 22, 5, 27, 0, s * 11.5, sand); ctx.cone(2.2, 5, 27, 22, s * 11.5, red, { seg: 4 }); }
  ctx.box(8, 6, 28, 27, 16, 0, sand, { solid: false });
  const eye = ctx.glow(26, 19, 0, '#ffd27a', 6); ctx.update(t => (eye.material.opacity = .55 + Math.sin(t) * .2));
  P.standard(20, -9, 'lannister', 9); P.standard(20, 9, 'lannister', 9);
  room(ctx, 'hall', { x: 21, z: 0, yaw: Math.PI / 2 }, { label: 'Entrer dans le Roc', banner: 'lannister', wall: 'yellow_stone_wall', wallColor: '#e8cc98', title: 'Les galeries du Roc', text: 'Des salles taillées dans la montagne, éclairées à la torche. L’or brille dans la pierre des murs.' });
  ctx.poi(18, 0, 'La porte du Lion', 'Une gueule ouverte dans la roche, assez large pour huit cavaliers de front. Derrière, des lieues de couloirs ; les Lannister jurent qu’ils les connaissent tous.', { color: '#ffcf5a' });
  ctx.box(5, 6, 4, 34, 0, 92, black, { solid: false }); const mine = ctx.glow(32, 3, 92, '#ffb030', 5); ctx.update(t => (mine.material.opacity = .45 + Math.sin(t * 2) * .2));
  for (let i = 0; i < 3; i++) P.cart(24 - i * 4, 92 + i, .3);
  ctx.poi(22, 96, 'Les mines d’or', 'L’or court dans la roche comme des veines. Les mineurs remontent couverts de poussière dorée ; on dit qu’à Port-Lannis, même les mendiants brillent.', { color: '#ffb030' });

  // --- Port-Lannis : remparts, ville, septuaire, marché ---
  ctx.ring(-112, -110, 22, 160, { h: 9, t: 2.5, mat: wall, gate: 'S', gateW: 8, towerW: 7, towerExtra: 5, towerRoof: red });
  const SEPT = [-78, -55], MARKET = [-12, 40];
  const avoid = (x, z, w = 0, d = 0) => Math.abs(x + 45) < 5 + w / 2 || Math.abs(z - 100) < 4 + d / 2 || Math.hypot(x - SEPT[0], z - SEPT[1]) < 26 || Math.hypot(x - MARKET[0], z - MARKET[1]) < 18 || x + w / 2 > 14 || x - w / 2 < -104;
  const city = ctx.cityGrid({ x0: -104, x1: 14, z0: -100, z1: 150, block: 15, street: 3.6, hMin: 5, hMax: 11, empty: .05, avoid });
  ctx.houses(city.lots, { style: 'ouest', wall: mat('plastered_wall', { uv: 4, instanced: true }), roof: mat('clay_roof_tiles', { uv: 2.5, instanced: true }), tints: ['#f2dfc0', '#e9cfa6', '#f6e7cf', '#e2c08f'], roofTints: ['#ffffff', '#e8a080', '#d88a60'], windows: '#3a2a1e', roofH: .5, sink: 2 });
  ctx.cyl(15, 14, SEPT[0], 1, SEPT[1], sand, { seg: 7 }); dome(ctx, SEPT[0], 15, SEPT[1], 14, mat(null, { color: '#e8c060', metal: .6, rough: .35 }), { spire: mat(null, { color: '#ffd27a', metal: .8, rough: .3 }) });
  ctx.poi(SEPT[0], SEPT[1] + 18, 'Le Grand Septuaire de Port-Lannis', 'Un dôme doré que les marins voient de vingt lieues en mer. Les Lannister l’ont payé, et les Sept le savent.', { color: '#ffd27a' });
  P.market(MARKET[0], MARKET[1], 11, 8, ['#8b0000', '#c9a227', '#8b0000', '#d8b040', '#6a2a1a']);
  ctx.poi(MARKET[0], MARKET[1] + 14, 'Le marché aux lions', 'Vin d’Arbor, soieries de Myr, épées de Port-Lannis. Ici on paie en or ; le cuivre fait rire les marchands.');
  for (let z = -90; z < 150; z += 16) { P.lantern(-50, z); P.lantern(-40, z + 8); }
  road(ctx, -45, 175, -45, -100, { w: 7, color: '#c8b08a' });
  for (const z of [-80, -20, 60, 120]) P.banner(-112 + 1.4, 8, z, 'lannister', Math.PI / 2, 1.3);

  // --- le port ---
  await harbor(ctx, [[-150, -40, 1.6], [-160, 20, 1.4], [-140, 80, 1.7], [-190, 120, 2.6], [-230, -90, .8]], { piers: [[-126, -40, 30, Math.PI / 2], [-126, 20, 30, Math.PI / 2], [-126, 80, 30, Math.PI / 2]] });
  for (let i = 0; i < 12; i++) P.barrel(-114 + rand() * 3, -60 + i * 12); for (let i = 0; i < 8; i++) P.crate(-113, -50 + i * 18, 1, rand());
  ctx.poi(-120, 50, 'Le port de Port-Lannis', 'Les navires de l’Ouest repartent lourds d’or et de vin. Les Fer-nés, eux, passent parfois sans demander la permission.');
  const cyp = []; for (let i = 0; i < 70; i++) cyp.push([-100 + rand() * 110, 160 + rand() * 30, .9 + rand() * .5]); ctx.trees(cyp, 'cypress', { leaf: '#4a5a2a' });
  ctx.particles('dust', { color: '#ffd28a' });
  ctx.spawn(-45, 178, 0);
  ctx.sound({ name: 'waves', volume: .6, pos: [-130, 0, 0], ref: 30 }, { name: 'crowd', volume: .35 }, { name: 'gull', volume: .5, every: [5, 11], randomPos: [-120, 15, 0, 120] }, { name: 'chime', volume: .4, rate: .55, pos: [SEPT[0], 20, SEPT[1]], every: [25, 45], ref: 30 });
}
