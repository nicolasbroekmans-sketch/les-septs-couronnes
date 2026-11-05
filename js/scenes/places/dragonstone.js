// PEYREDRAGON — île volcanique de la baie de la Néra. Plage et port de pêcheurs au sud, une rampe entre deux
// falaises jusqu'au plateau, puis un long escalier taillé dans le rocher jusqu'au château perché à 75 m :
// le Tambour de Pierre, la tour du Dragon des Mers, la tour du Ver-du-Vent, gargouilles et dragons de pierre.
// Derrière, Montdragon fume encore.
import { smooth, noise } from '../light/util.js';
import { village, harbor } from './kit.js';
import { room } from './rooms.js';

export const config = { hdri: 'wasteland_clouds_puresky', exposure: 1.05, bg: .85, env: .95, fog: ['#6d7074', .0028], hemi: ['#c8ccd4', '#3a3430', .75], sun: ['#ffd2a8', 2, [-.4, .45, .6]], bloom: [.6, .5, .78], tint: '#eef0f2', bounds: [-170, -200, 170, 220], killY: -3 };

const CRAG = [0, -90], TOP = 74, PLAT = 38;
export function height(x, z) {
  const r = Math.hypot(x, z + 20), n = noise(x, z);
  let h = -6 + 9 * smooth(190, 165, r) + (PLAT - 3) * smooth(142, 122, r) + n * 1.2 * smooth(150, 120, r);
  const ramp = Math.abs(x) < 9 && z > 95 && z < 168; if (ramp) h = Math.max(3, Math.min(h, 3 + (PLAT - 3) * smooth(160, 100, z)));
  const c = Math.hypot(x - CRAG[0], (z - CRAG[1]) * .8);
  h = Math.max(h, PLAT + (TOP - PLAT) * smooth(48, 30, c) + n * 2 * smooth(30, 48, c));
  if (Math.abs(x) < 3.5 && z > -66 && z < -22) h = Math.min(h, PLAT); // entaille de l'escalier
  return Math.max(h, 140 * Math.exp(-((x - 95) ** 2 + (z + 175) ** 2) / 3000) - 4);
}

export async function build(ctx) {
  const { mat, props: P, rand } = ctx;
  const rock = mat('volcanic_rock_tiles', { uv: 6, color: '#8e8a86' }), dark = mat('volcanic_rock_tiles', { uv: 4, color: '#3e3c3c' }), basalt = mat('old_stone_wall', { uv: 4, color: '#5a5856' });
  ctx.terrain({ size: 700, seg: 240, height, mat: rock, splat: { slope: 'cliff_side', slopeTint: '#5a5858', scale: 12 } });
  ctx.water({ reflect: true, y: 0, color: '#1c2a30', w: 1600, d: 1600, sun: '#ffd2a8', distortion: 3 });
  // rampe de la plage au plateau : marches de basalte et dragons de pierre
  for (let z = 160; z > 100; z -= 1.2) ctx.box(14, .12, .5, 0, height(0, z) - .05, z, dark, { solid: false, cast: false });
  for (const z of [150, 132, 114]) for (const s of [-1, 1]) { const x = s * 10, y = height(x, z); ctx.box(2.4, 1.6, 4, x, y, z, dark); ctx.cone(1, 3, x, y + 1.6, z - 1.6, dark, { seg: 5 }); for (const e of [-1, 1]) ctx.box(.3, 2.4, 3, x + e * 1.4, y + 1.4, z, dark, { rotY: e * .5, solid: false }); }
  ctx.poi(0, 122, 'La montée des dragons', 'Entre deux falaises noires, des marches de basalte. Des dragons de pierre vous regardent monter ; on jurerait qu’ils respirent.', { color: '#ff7a3a' });
  // escalier taillé dans le rocher jusqu'au château
  ctx.stairs(0, PLAT, -22, { dir: 'N', n: 92, rise: .39, run: .47, w: 5.5, mat: basalt });
  for (let z = -26; z > -64; z -= 6) for (const s of [-1, 1]) ctx.torch(s * 3.2, PLAT + (-22 - z) / .47 * .39 + 2.2, z, { light: false });
  ctx.poi(0, -18, 'L’escalier de Peyredragon', 'Quatre-vingt-douze marches taillées dans la roche, sans rampe, au-dessus du vide. Les visiteurs arrivent essoufflés devant le trône ; c’est voulu.');
  // château sur le rocher
  const [cx, cz] = CRAG, y = TOP - .5;
  ctx.ring(cx - 30, cz - 26, cx + 30, cz + 26, { y: y - 2, h: 16, t: 3, mat: dark, gate: 'S', gateW: 6, round: true, towerW: 9, towerExtra: 10 });
  ctx.tower(cx, cz - 4, { w: 18, h: 26, y, mat: basalt, round: true }); ctx.cone(10, 9, cx, y + 26, cz - 4, dark, { seg: 20, rotY: 0 });
  ctx.poi(cx, cz + 10, 'Le Tambour de Pierre', 'Le grand donjon rond, ainsi nommé parce qu’il gronde par gros temps. Au sommet, la Table Peinte : tout Westeros taillé dans le bois.', { y });
  for (const [x, z, h, name] of [[22, -112, 34, 'la tour du Dragon des Mers'], [-22, -112, 30, 'la tour du Ver-du-Vent']]) {
    ctx.tower(x, z, { w: 8, h, y, mat: basalt, round: true }); ctx.box(3, 2.4, 5, x, y + h, z + 1, dark); for (const e of [-1, 1]) ctx.cone(.5, 3, x + e * 1.2, y + h + 2.4, z - 1, dark, { seg: 5 });
    ctx.poi(x, z + 8, name[0].toUpperCase() + name.slice(1), 'Une tour coiffée d’une tête de dragon : la pierre a été coulée, pas taillée. Le feu des anciens dragons l’a façonnée comme de la cire.', { y });
  }
  for (let i = 0; i < 28; i++) { const a = i / 28 * 6.28, x = cx + Math.cos(a) * 31, z = cz + Math.sin(a) * 27; if (Math.abs(x) < 6 && z > cz) continue; ctx.cone(.6, 2.2, x, y + 15.5, z, dark, { seg: 4 }); ctx.box(.9, .8, 1.4, x, y + 14, z, dark, { solid: false, rotY: -a }); }
  for (const x of [-12, 0, 12]) P.banner(cx + x, y + 12, cz + 27.7, 'targaryen', 0, 1.8);
  room(ctx, 'throne', { x: cx, z: cz + 6, yaw: Math.PI }, { label: 'Entrer dans le Tambour de Pierre', banner: 'targaryen', wall: 'volcanic_rock_tiles', wallColor: '#4a4848', floorColor: '#5a5858', title: 'La salle de la Table Peinte', text: 'Une table immense, taillée comme une carte de Westeros. Celui qui s’y penche voit tout le royaume ; celui qui la regarde trop longtemps veut le posséder.' });
  // Montdragon : fumées et lueur
  ctx.emitter('smoke', 95, 132, -175, { count: 60, opacity: .3, box: [20, 50, 20] }); ctx.glow(95, 134, -175, '#ff5a1a', 14);
  ctx.particles('ash'); ctx.particles('embers', { count: 300 });
  ctx.poi(60, -130, 'Montdragon', 'La montagne fume depuis toujours. On dit que des dragons dorment encore dans ses entrailles ; les pêcheurs, eux, disent que c’est juste du soufre.', { color: '#ff5a1a' });
  // port de pêcheurs sur la plage sud
  village(ctx, 60, 140, { style: 'fer', houses: 16, radius: 14, banner: 'targaryen', wall: mat('plastered_wall', { uv: 4, instanced: true }), roof: mat('grey_roof_tiles', { uv: 3, instanced: true }), avoid: (x, z) => height(x, z) > 9 || height(x, z) < 1, name: 'Le port de Peyredragon', text: 'Quelques maisons de pierre noire, des filets, des barques. Les pêcheurs ne lèvent jamais les yeux vers le château.' });
  await harbor(ctx, [[30, 205, .3], [-40, 210, -.4], [90, 200, 1.4]], { piers: [[10, 184, 22, 0], [50, 182, 18, 0]] });
  ctx.spawn(0, 168, 0);
  ctx.sound({ name: 'waves', volume: .5 }, { name: 'wind', volume: .45 }, { name: 'volcano', volume: .3, pos: [95, 120, -175], ref: 60 }, { name: 'gull', volume: .35, every: [8, 16], randomPos: [0, 10, 180, 80] });
}
