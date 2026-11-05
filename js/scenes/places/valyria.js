// VALYRIA — d'après l'image de référence : un large chenal d'eau noire noyé de brume, bordé de deux rangées
// d'arcades colossales en ruine (piles de 30 à 40 m, arcs brisés, sommets déchiquetés), jungle sombre, tours
// effondrées au loin, barques échouées. Quelques failles de lave rappellent la Catastrophe ; cendres et braises.
import { smooth, noise } from '../light/util.js';

export const config = { hdri: 'kloofendal_misty_morning_puresky', exposure: 1.1, bg: .7, env: .8, fog: ['#4c5a58', .0085], hemi: ['#9ab0b0', '#242a28', 1.35], sun: ['#d8e8e0', 1.5, [.2, .5, .7]], bloom: [.7, .55, .7], tint: '#dfeee8', sat: .62, contrast: 1.18, bounds: [-120, -200, 120, 120], killY: -25 };
// chenal nord-sud (x ≈ 0), berges à ±22 m
export const height = (x, z) => -3 + 5.5 * smooth(14, 24, Math.abs(x + Math.sin(z * .02) * 6)) + noise(x, z) * .8 * smooth(24, 40, Math.abs(x)) + 4 * smooth(70, 120, Math.abs(x));

export async function build(ctx) {
  const { THREE, mat, rand } = ctx;
  const ground = mat('forest_ground_04', { uv: 6, color: '#7a8270', rough: 1 }), stone = mat('old_stone_wall', { normal: 'old_stone_wall_nor', uv: 6, color: '#5e6460' });
  const moss = mat('rock_face', { uv: 4, color: '#4a5a40' });
  ctx.terrain({ size: 600, seg: 200, height, mat: ground, splat: { slope: 'rocky_terrain_02', slopeTint: '#6a7068' } });
  ctx.water({ y: -.6, w: 60, d: 700, color: '#1a2624', opacity: .95 });
  // deux arcades colossales le long du chenal
  for (const side of [-1, 1]) for (let i = 0; i < 9; i++) {
    const z = -180 + i * 34, x = side * (26 + Math.sin(z * .02) * 6), y = height(x, z) - 2, H = 30 + rand() * 10;
    for (const dz of [-11, 11]) { ctx.box(6, H, 6, x, y, z + dz, stone); ctx.box(6.6, 3, 6.6, x, y, z + dz, moss, { solid: false }); }
    if (rand() < .75) { // arc et tablier, parfois brisés
      const broken = rand() < .35, top = y + H - 6;
      for (let k = 0; k < 9; k++) { if (broken && k > 3 && k < 7) continue; const a = k / 8 * Math.PI, ax = 11 * Math.cos(a), ay = 8 * Math.sin(a); ctx.box(5.4, 2.4, 3, x, top - 8 + ay, z + ax, stone, { solid: false, rotY: 0 }); }
      ctx.box(5.6, 4, 28, x, top, z, stone, { solid: false });
      for (let k = 0; k < 5; k++) if (rand() < .6) ctx.box(2 + rand() * 2, 2 + rand() * 6, 2 + rand() * 2, x + (rand() - .5) * 3, top + 4, z - 12 + k * 6, stone, { solid: false, rotY: rand() });
    }
  }
  // tours et dômes effondrés au loin, colonnes brisées sur les berges
  for (let i = 0; i < 10; i++) { const x = (rand() < .5 ? -1 : 1) * (60 + rand() * 50), z = -190 + rand() * 300; ctx.tower(x, z, { w: 8 + rand() * 6, h: 20 + rand() * 30, y: height(x, z) - 2, mat: stone, round: rand() < .5 }); }
  for (let i = 0; i < 40; i++) { const x = (rand() < .5 ? -1 : 1) * (30 + rand() * 30), z = -190 + rand() * 300; ctx.cyl(1, 2 + rand() * 9, x, height(x, z) - .5, z, stone, { seg: 10 }); }
  // jungle sombre
  const trees = []; for (let i = 0; i < 520; i++) { const x = (rand() < .5 ? -1 : 1) * (36 + rand() * 80), z = -200 + rand() * 320; trees.push([x, z, 1 + rand() * .9]); }
  ctx.trees(trees, 'round', { leaf: '#2a3a2a' }); ctx.trees(trees.slice(0, 160).map(([x, z, s]) => [x + 3, z + 4, s * 1.2]), 'pine', { leaf: '#1c2a22' });
  // failles de lave sur les berges, fumées
  const lava = new THREE.MeshStandardMaterial({ color: '#ff4a10', emissive: '#ff3a00', emissiveIntensity: 3 });
  for (let k = 0; k < 10; k++) { const x = (rand() < .5 ? -1 : 1) * (40 + rand() * 40), z = -180 + rand() * 280, m = new THREE.Mesh(new THREE.BoxGeometry(.6 + rand(), .15, 6 + rand() * 14), lava); m.position.set(x, height(x, z) + .03, z); m.rotation.y = rand() * 3; ctx.add(m); ctx.emitter('smoke', x, height(x, z), z, { count: 25, opacity: .25, box: [4, 24, 4] }); }
  ctx.update(t => (lava.emissiveIntensity = 2.6 + Math.sin(t * 1.3) * .8));
  // barques échouées et quai d'arrivée
  const hull = mat('medieval_wood', { uv: 2, color: '#5a4630' });
  for (const [x, z, r] of [[4, 60, .1], [-8, -40, -.3], [10, -120, .4]]) { const b = ctx.box(2, .8, 6, x, -.7, z, hull, { solid: false, merge: false, rotY: r }); ctx.box(.15, 5, .15, x, 0, z, hull, { solid: false }); ctx.update(t => (b.position.y = -.7 + Math.sin(t * .8 + x) * .08)); }
  ctx.box(14, .6, 10, 0, -.2, 104, stone);
  ctx.poi(0, 96, 'Le chenal des Seigneurs-Dragons', 'Les arcades de l’ancienne cité se dressent encore au-dessus de l’eau noire. Elles portaient des routes ; elles ne portent plus que de la mousse et le silence.', { color: '#a8c8c0' });
  ctx.poi(28, -10, 'Les arches brisées', 'Des arcs assez hauts pour qu’un dragon y passe en vol. Certains se sont effondrés dans la nuit de la Catastrophe ; les autres attendent leur tour.', { color: '#a8c8c0' });
  ctx.poi(-60, -120, 'La brume rouge', 'Les marins jurent qu’on y entend des voix. Ceux qui ont respiré la fumée trop longtemps ne jurent plus rien.', { color: '#ff7a4a' });
  ctx.particles('ash', { count: 2500 }); ctx.particles('embers', { count: 300 });
  for (let k = 0; k < 8; k++) ctx.emitter('steam', (rand() - .5) * 30, -.5, -180 + k * 40, { box: [30, 6, 30], count: 60, opacity: .22 });
  ctx.spawn(0, 104, 0);
  ctx.sound({ name: 'canal', volume: .4 }, { name: 'wind', volume: .4 }, { name: 'volcano', volume: .2 });
}
