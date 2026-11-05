import { kingslandingCity, avoidExtra } from './details/kingslandingCity.js';
import { height } from './details/klTerrain.js';
import { room } from './places/rooms.js';
import { walkHouse } from './places/houses.js';

// PORT-RÉAL — ville en pente vers la baie, Donjon Rouge sur la colline, Septuaire à dôme, port.
export const config = {
  hdri: 'qwantani_late_afternoon_puresky', exposure: 1, bg: 1, env: 1, skyRot: 1.2,
  fog: ['#d9bf95', .0042], hemi: ['#ffe2b8', '#6a4a2a', .45], sun: ['#ffc98a', 3, [-.55, .38, .45]],
  bloom: [.4, .5, .88], tint: '#fff0dc', bounds: [-170, -175, 170, 120]
};

export { height };

export async function build(ctx) {
  const { THREE, mat, rand } = ctx;
  const ground = mat('cobblestone_floor_01', { normal: 'cobblestone_floor_01_nor', uv: 3, color: '#d9c4a2' });
  const red = mat('castle_brick_02_red', { uv: 4, color: '#c46a52' });
  const marble = mat('plastered_wall', { uv: 6, color: '#f4efe6' });
  const wood = mat('weathered_planks', { uv: 3, color: '#a0846a' });
  ctx.terrain({ size: 640, seg: 200, height, mat: ground });
  ctx.water({ reflect: true, y: 0, z: 260, w: 900, d: 400, color: '#1f4752', sun: '#ffd9a0', distortion: 2.6 });

  // Donjon Rouge
  const kx = 55, kz = -118, ky = height(kx, kz);
  ctx.ring(kx - 32, kz - 26, kx + 32, kz + 26, { y: ky - 10, h: 24, t: 4, mat: red, gate: 'S', gateW: 7, round: true, towerW: 11, towerExtra: 6 });
  ctx.box(26, 30, 22, kx + 2, ky - 4, kz - 6, red);
  ctx.tower(kx - 12, kz - 12, { w: 10, h: 40, y: ky - 4, mat: red, round: true });
  ctx.tower(kx + 18, kz + 4, { w: 8, h: 34, y: ky - 4, mat: red, round: true });
  room(ctx, 'throne', { x: kx, z: kz + 31, yaw: Math.PI }, { label: 'Entrer dans la salle du trône', banner: 'baratheon', wall: 'castle_brick_02_red', wallColor: '#a85a44', title: 'La salle du trône', text: 'Au bout de la salle, un trône hérissé de lames fondues. On dit qu’il n’est pas fait pour qu’on s’y assoie confortablement — et que c’est voulu.' });
  ctx.poi(kx, kz + 34, 'Le Donjon Rouge', 'Sept tours de brique sang-de-bœuf sur la plus haute colline. On dit que ses murs ont des oreilles ; à vrai dire, ce sont surtout des passages secrets.', { color: '#ff7a5a' });
  // Grand escalier vers la porte
  let st = { x: kx, z: kz + 60 };
  for (let i = 0; i < 3; i++) { const y = height(st.x, st.z) - .3; st = ctx.stairs(st.x, y, st.z, { dir: 'N', n: 12, rise: .32, run: .7, w: 7, mat: red }); }

  // Grand Septuaire : tambour, dôme, sept tours
  const sx = -70, sz = -62, sy = height(sx, sz);
  ctx.cyl(16, 18, sx, sy - 4, sz, marble, { seg: 7 });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(15, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#e9e2d4', metalness: .3, roughness: .35 }));
  dome.position.set(sx, sy + 14, sz); dome.castShadow = true; ctx.add(dome);
  const crys = ctx.glow(sx, sy + 31, sz, '#fff2c0', 6);
  ctx.update(t => (crys.material.opacity = .7 + Math.sin(t * 1.5) * .3));
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; ctx.tower(sx + Math.cos(a) * 18, sz + Math.sin(a) * 18, { w: 4, h: 28, y: sy - 4, mat: marble, round: true, roof: mat(null, { color: '#d9c27a', metal: .6, rough: .4 }), roofH: 8 }); }
  ctx.poi(sx, sz + 24, 'Le Grand Septuaire', 'Sept tours, sept voix, un seul dôme de marbre. Les cloches y sonnent pour les mariages et pour les morts ; les habitants reconnaissent les deux sans regarder.');

  // Port : quais en bois et navires (modèle GLTF)
  for (const x of [-70, -30, 10, 50]) { ctx.box(6, 1.6, 34, x, -.6, 78, wood); for (let z = 64; z < 96; z += 6) ctx.cyl(.3, 4, x + 3.2, -3, z, wood, { solid: false }); }
  ctx.box(220, 1.6, 8, -10, -.6, 62, wood);
  const ship = await ctx.gltf('ship');
  [[-50, 80, 0], [-10, 84, .1], [30, 78, -.05], [80, 140, 1.2], [-120, 180, -.8], [10, 230, 2]].forEach(([x, z, r], i) => {
    const s = ship.clone(); s.position.set(x, -.9, z); s.rotation.y = r; ctx.add(s);
    ctx.update(t => { s.position.y = -.9 + Math.sin(t * .8 + i) * .15; s.rotation.z = Math.sin(t * .6 + i) * .03; });
    if (z < 100) ctx.collider(x - 2.4, -1, z - 7.5, x + 2.4, 4, z + 7.5);
  });
  ctx.poi(-12, 68, 'La porte de la Rivière', 'Les marins l’appellent la porte de la Gadoue. Ici débarquent le vin d’Arbor, les épices d’Essos et les rumeurs de partout.', { y: 1 });

  // La ville : grille irrégulière, ruelles étroites, toits de tuiles ocre
  const avoid = (x, z, w = 0, d = 0) => (Math.abs(x) < 19 + w / 2 && z > 30 - d / 2 && z < 50 + d / 2) || avoidExtra(x, z, w, d) || (Math.abs(x - kx) < 46 && z < kz + 40 && z > kz - 40) || Math.hypot(x - sx, z - sz) < 26 || (Math.abs(x - kx) < 7 && z > kz + 26 && z < kz + 90) || (Math.abs(x) < 6 && z > 20) || z > 56 || (Math.abs(z - 20) < 3 + d / 2 && x < 0);
  const city = ctx.cityGrid({ x0: -160, x1: 160, z0: -165, z1: 58, block: 13, street: 3.4, hMin: 4, hMax: 9, empty: .06, avoid });
  ctx.houses(city.lots, { style: 'couronne',
    wall: mat('plastered_wall', { uv: 4, instanced: true }), roof: mat('clay_roof_tiles', { uv: 2.5, instanced: true }),
    tints: ['#f2dfc0', '#e9cfa6', '#f6e7cf', '#e2c08f', '#f0d6b8'], roofTints: ['#ffffff', '#f0c8a8', '#e6b090'], roofH: .45, sink: 4, windows: '#3a2a1e'
  });
  const kl = { stone: '#c8b89a', plaster: '#f2e2c8', roofTex: 'clay_roof_tiles', roof: '#c87a50' };
  walkHouse(ctx, 13, 40, 3, { ...kl, house: 'baratheon', owner: 'Maître Pell, drapier', name: 'Une maison de Port-Réal', text: 'Une maison de marchand : boutique en bas, chambre à l’étage. La porte est ouverte.' }); walkHouse(ctx, -13, 40, 1, { ...kl, house: 'lannister', owner: 'Dame Ysilla' });
  ctx.poi(-20, -10, 'Culpucier', 'Le quartier des ruelles tordues, où l’odeur du ragoût de bol se mêle à celle du poisson. Ici, on vend de tout ; surtout ce qui n’appartient à personne.');
  ctx.poi(kx, kz + 92, 'Les escaliers du Roi', 'Trois volées de marches taillées pour les processions. Les petits gens les montent à genoux les jours de fête ; les seigneurs, à cheval.');

  // Cyprès, torches de fin de journée
  const trees = [];
  for (let i = 0; i < 80; i++) { const x = (rand() - .5) * 400, z = -170 - rand() * 100; trees.push([x, z, 1 + rand()]); }
  for (let i = 0; i < 20; i++) trees.push([kx - 40 + rand() * 80, kz + 34 + rand() * 6, .9 + rand() * .4]);
  ctx.trees(trees.filter(([x, z]) => !avoid(x, z) || z < -165), 'cypress', { leaf: '#3c4a2a' });
  for (let z = 56; z > -60; z -= 22) ctx.torch(5, height(5, z) + 2.6, z, { light: z > 20, color: '#ffb36a' });

  ctx.particles('dust', { color: '#ffd9a0' });
  kingslandingCity(ctx, [kx, kz, ky]);
  ctx.spawn(0, 58, 0);
  ctx.sound(
    { name: 'crowd', volume: .4 }, { name: 'waves', volume: .35, pos: [0, 0, 90], ref: 25 },
    { name: 'gull', volume: .5, every: [4, 10], randomPos: [0, 15, 70, 120], ref: 12 },
    { name: 'chime', volume: .5, rate: .5, pos: [sx, sy + 20, sz], every: [22, 40], ref: 30 }
  );
}
