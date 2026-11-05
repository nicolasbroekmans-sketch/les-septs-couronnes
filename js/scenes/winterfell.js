import { winterfellCastle } from './details/winterfellCastle.js';
import { winterfellTown } from './details/winterfellTown.js';
import { winterfellLore } from './details/winterfellLore.js';
import { room } from './places/rooms.js';
import { walkHouse } from './places/houses.js';

// WINTERFELL — double enceinte, Grand Hall, forge, bois sacré, sources chaudes, Winter Town.
export const config = {
  hdri: 'kloofendal_overcast_puresky', exposure: 1.05, bg: .9, env: 1.1,
  fog: ['#c3cad2', .0068], hemi: ['#dfe7f0', '#4a4440', .5], sun: ['#e6ecf5', 1.4, [.35, .55, .5]],
  bloom: [.55, .6, .82], tint: '#eef3ff', bounds: [-130, -130, 130, 185]
};

export async function build(ctx) {
  const { THREE, mat, rand } = ctx;
  const stone = mat('castle_wall_slates', { normal: 'castle_wall_slates_nor', uv: 5, color: '#c8ccd0' });
  const darkStone = mat('castle_wall_slates', { normal: 'castle_wall_slates_nor', uv: 4, color: '#8d9298' });
  const wood = mat('weathered_planks', { uv: 3, color: '#e0cdb4' });
  const roofM = mat('grey_roof_tiles', { uv: 3, color: '#d7dde2' });
  const snow = mat('snow_02', { uv: 6, color: '#eef2f6', rough: .85 });
  const mud = mat('brown_mud', { uv: 4, color: '#c4b8aa', rough: 1 });
  const cobble = mat('cobblestone_floor_01', { normal: 'cobblestone_floor_01_nor', uv: 3, color: '#a8a8aa' });

  // Terrain : plat dans la ville et le château, collines enneigées au-delà
  const n2 = (x, z) => Math.sin(x * .021) * Math.cos(z * .017) * 6 + Math.sin(x * .05 + z * .03) * 2;
  const h = (x, z) => { const d = Math.max(0, Math.max(Math.abs(x) - 120, Math.abs(z - 20) - 160)); return n2(x, z) * Math.min(1, d / 40) + d * .08; };
  ctx.terrain({ size: 800, seg: 160, height: h, mat: snow });

  // Sol pavé/boue dans les enceintes
  ctx.box(76, .05, 76, 0, 0, -30, cobble, { solid: false, cast: false });
  ctx.box(110, .03, 110, 0, 0, -30, mud, { solid: false, cast: false });

  // Double enceinte
  ctx.ring(-55, -85, 55, 25, { h: 10, t: 3, mat: stone, gate: 'S', gateW: 8, towerW: 8, towerExtra: 6, both: false });
  ctx.ring(-38, -68, 38, 8, { h: 14, t: 3.5, mat: darkStone, gate: 'S', gateW: 7, towerW: 9, towerExtra: 7 });
  // Escaliers vers le chemin de ronde extérieur (côté intérieur du mur sud)
  ctx.stairs(10.5, 0, 22.2, { dir: 'E', n: 34, rise: .3, run: .45, w: 2.4, mat: stone });
  ctx.stairs(-10.5, 0, 22.2, { dir: 'O', n: 34, rise: .3, run: .45, w: 2.4, mat: stone });
  ctx.poi(12, 18.5, 'Le chemin de ronde', 'Montez : depuis les créneaux, on voit Winter Town fumer sous la neige et, par temps clair, la ligne sombre du Bois-aux-Loups.');

  // Grand Donjon & Grand Hall
  ctx.box(24, 18, 18, -8, 0, -52, stone);
  ctx.roof(25, 8, 19, -8, 18, -52, roofM);
  ctx.tower(-22, -58, { w: 7, h: 26, mat: stone, roof: roofM });
  ctx.box(14, 11, 30, 18, 0, -40, stone);
  ctx.roof(15, 7, 31, 18, 11, -40, roofM);
  ctx.box(4, 5, .6, 18, 0, -24.7, wood, { solid: false });
  ctx.torch(15.5, 3.4, -24.4); ctx.torch(20.5, 3.4, -24.4, { light: false });
  room(ctx, 'hall', { x: 18, z: -22.6, yaw: Math.PI }, { label: 'Entrer dans le Grand Hall', banner: 'stark', wall: 'castle_wall_slates', wallColor: '#8d9298', title: 'Le Grand Hall', text: 'Des tables de bois noirci, le feu au fond, les bannières au loup. Ici on mange, on juge et on se souvient.' });
  ctx.poi(18, -21, 'Le Grand Hall', 'Sous ses poutres noircies, on a mangé, juré et pleuré des rois. Les bancs sont usés en creux, à la place exacte où chaque famille s’assoit depuis des siècles.');
  // Tour brisée (ronde, sans toit)
  ctx.tower(-30, 0, { w: 8, h: 22, mat: darkStone, round: true });

  // Forge : appentis ouvert, braises, enclume
  const fx = 26, fz = -4;
  ctx.box(10, 4.5, .5, fx, 0, fz - 3.5, wood); ctx.box(.5, 4.5, 7, fx + 5, 0, fz, wood);
  ctx.roof(11, 2.2, 8, fx, 4.5, fz, roofM);
  ctx.box(3, 1, 2, fx + 2, 0, fz - 1.8, darkStone);
  const coals = ctx.box(2.4, .2, 1.4, fx + 2, 1, fz - 1.8, mat(null, { color: '#ff5a10', emissive: '#ff4a00', ei: 3 }), { solid: false });
  ctx.fire(fx + 2, 1.1, fz - 1.8, .6, { intensity: 40 });
  ctx.box(.6, .8, 1.1, fx - 1, 0, fz, mat(null, { color: '#2b2b2e', metal: .8, rough: .4 }));
  ctx.update(t => (coals.material.emissiveIntensity = 2.5 + Math.sin(t * 3) * .8));
  ctx.poi(fx - 2, fz + 3, 'La forge', 'Le forgeron dit que l’acier du Nord se trempe dans la neige fondue. C’est faux, mais personne n’a jamais osé le contredire.');

  // Bois sacré : pins + barral au visage sculpté + source chaude
  const pines = [];
  for (let i = 0; i < 70; i++) { const x = -36 + rand() * 24, z = -64 + rand() * 58; if (Math.hypot(x + 24, z + 22) > 6 && Math.hypot(x + 18, z + 10) > 5.5 && !(x > -27 && z < -40) && Math.hypot(x + 30, z) > 5.5) pines.push([x, z, .9 + rand() * .6]); }
  for (let i = 0; i < 220; i++) { const a = rand() * 6.28, r = 190 + rand() * 140; pines.push([Math.cos(a) * r, Math.sin(a) * r + 10, 1 + rand()]); }
  ctx.trees(pines, 'pine', { leaf: '#2c3f33' });
  weirwood(ctx, -24, -22);
  ctx.poi(-24, -17.5, 'Le barral', 'Un arbre blanc aux feuilles couleur de sang. Le visage gravé dans son écorce pleure une sève rouge. On ne ment pas devant lui — pas longtemps.', { color: '#ff6a5a' });
  const pool = new THREE.Mesh(new THREE.CircleGeometry(4, 32), new THREE.MeshStandardMaterial({ color: '#3b6f6a', roughness: .1, metalness: .1, transparent: true, opacity: .9 }));
  pool.rotation.x = -Math.PI / 2; pool.position.set(-18, .06, -10); ctx.add(pool);
  for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28; ctx.box(1, .5, 1, -18 + Math.cos(a) * 4.4, 0, -10 + Math.sin(a) * 4.4, darkStone, { solid: false }); }
  ctx.emitter('steam', -18, 0, -10, { box: [7, 8, 7], count: 90 });
  ctx.poi(-13, -10, 'Les sources chaudes', 'L’eau monte des profondeurs, tiède même au cœur de l’hiver. Les murs du château en sont chauffés, comme un animal qui garde sa chaleur.', { color: '#9fc4d6' });

  // Cour : mannequins d'entraînement, chariots, torches
  for (let i = 0; i < 4; i++) { ctx.box(.3, 2, .3, -4 + i * 3, 0, -20, wood); ctx.box(1.4, .25, .25, -4 + i * 3, 1.5, -20, wood, { solid: false }); }
  for (const [x, z] of [[-4, 5], [4, 5], [-4, 24], [4, 24], [-6, -12], [6, -12]]) ctx.torch(x, 3, z, { light: Math.abs(z) < 20 });


  // Winter Town : grille irrégulière de maisons en bois et pierre
  const city = ctx.cityGrid({ x0: -110, x1: 110, z0: 36, z1: 172, block: 14, street: 4.5, hMin: 3.2, hMax: 6.5, avoid: (x, z, w = 0, d = 0) => Math.abs(x) < 7 + w / 2 || Math.hypot(x, z - 98) < 16 || (Math.abs(z - 126) < 8 + d / 2 && Math.abs(x) < 25 + w / 2) || (Math.abs(x) < 20 + w / 2 && z > 36 - d / 2 && z < 86 + d / 2) || x + w / 2 > 110 || z + d / 2 > 172 });
  ctx.houses(city.lots, { style: 'nord',
    wall: mat('weathered_planks', { uv: 3, instanced: true }), roof: mat('grey_roof_tiles', { uv: 3, instanced: true }),
    tints: ['#e8d8c0', '#d8c6aa', '#f2e8d8', '#cbbfae'], roofTints: ['#e9eef2', '#dfe5ea', '#cfd6dc'], windows: '#ffb05a', roofH: .6
  });
  for (const st of city.streets) ctx.box(st.w, .04, st.d, st.x, .01, st.z, mud, { solid: false, cast: false });
  ctx.box(9, .05, 140, 0, .02, 104, mud, { solid: false, cast: false });
  winterfellCastle(ctx); winterfellTown(ctx, city.lots); winterfellLore(ctx);
  // maisons à étage où l'on entre à pied, de part et d'autre de la grand-rue de Winter Town
  const owners = ['Gage le charpentier', 'Mère Tessa', 'Vieille Nell la conteuse', 'Jory le tanneur', 'Bethany la tisserande', 'Harwin le palefrenier'];
  [46, 62, 78].forEach((z, i) => { walkHouse(ctx, 13, z, 3, { house: 'stark', owner: owners[i * 2], name: i ? undefined : 'Une maison de Winter Town', text: 'La porte est ouverte. En bas, l’âtre et la table ; l’escalier mène à la chambre, sous le toit.' }); walkHouse(ctx, -13, z, 1, { house: i === 1 ? 'stark' : null, owner: owners[i * 2 + 1], blanket: '#3a4a5a' }); });
  // fumées de cheminées
  for (let i = 0; i < 10; i++) { const l = city.lots[Math.floor(rand() * city.lots.length)]; ctx.emitter('smoke', l.x, l.h + 2, l.z, { count: 30, opacity: .12, box: [5, 22, 5] }); }
  for (let z = 40; z < 130; z += 18) { ctx.torch(-5, 2.8, z, { light: z < 60 }); ctx.torch(5, 2.8, z + 9, { light: false }); }
  ctx.poi(0, 44, 'Winter Town', 'Quand l’hiver vient, les villages vident leurs granges et montent ici, sous la protection des murs. Les maisons attendent, à moitié vides, que la neige ramène leurs familles.');

  ctx.particles('snow');
  ctx.spawn(0, 120, 0);
  ctx.sound(
    { name: 'wind', volume: .55 },
    { name: 'fire', volume: .7, pos: [fx + 2, 1, fz - 1.8], ref: 3 },
    { name: 'anvil', volume: .8, pos: [fx - 1, 1, fz], every: [1.4, 2.6], ref: 5 },
    { name: 'raven', volume: .6, every: [7, 15], randomPos: [0, 18, -30, 80], ref: 10 },
    { name: 'canal', volume: .35, pos: [-18, 0, -10], ref: 2, rate: .7 }
  );
}

// Barral : tronc blanc torsadé, visage gravé, frondaison rouge
function weirwood(ctx, x, z) {
  const { THREE } = ctx;
  const c = document.createElement('canvas'); c.width = 256; c.height = 512; const g = c.getContext('2d');
  g.fillStyle = '#ece8df'; g.fillRect(0, 0, 256, 512);
  for (let i = 0; i < 160; i++) { g.strokeStyle = `rgba(120,110,100,${Math.random() * .25})`; g.lineWidth = 1 + Math.random() * 2; const px = Math.random() * 256; g.beginPath(); g.moveTo(px, 0); g.bezierCurveTo(px + 10, 150, px - 10, 350, px + 5, 512); g.stroke(); }
  const fx = 96; // visage
  g.fillStyle = '#3a1410';
  g.beginPath(); g.ellipse(fx - 18, 250, 11, 6, -.3, 0, 7); g.fill(); g.beginPath(); g.ellipse(fx + 18, 250, 11, 6, .3, 0, 7); g.fill();
  g.beginPath(); g.moveTo(fx - 20, 320); g.quadraticCurveTo(fx, 300, fx + 20, 320); g.quadraticCurveTo(fx, 335, fx - 20, 320); g.fill();
  g.strokeStyle = '#8b0000'; g.lineWidth = 4; [[fx - 18, 256], [fx + 18, 256]].forEach(([a, b]) => { g.beginPath(); g.moveTo(a, b); g.bezierCurveTo(a - 2, b + 40, a + 3, b + 70, a, b + 110); g.stroke(); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const geo = new THREE.CylinderGeometry(.9, 1.4, 7, 24, 12);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i), a = y * .18, px = p.getX(i), pz = p.getZ(i); p.setXYZ(i, px * Math.cos(a) - pz * Math.sin(a) + Math.sin(y * .8) * .15, y, px * Math.sin(a) + pz * Math.cos(a)); }
  geo.computeVertexNormals();
  const bark = new THREE.MeshStandardMaterial({ map: t, roughness: .8 });
  const trunk = new THREE.Mesh(geo, bark); trunk.position.set(x, 3.5, z); trunk.rotation.y = Math.PI * .2; trunk.castShadow = true; ctx.add(trunk);
  ctx.collider(x - 1.2, 0, z - 1.2, x + 1.2, 8, z + 1.2);
  const branchM = new THREE.MeshStandardMaterial({ color: '#e6e1d6', roughness: .8 });
  const leafM = new THREE.MeshStandardMaterial({ color: '#a3150f', emissive: '#4a0505', roughness: .7, flatShading: true });
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * 6.28, b = new THREE.Mesh(new THREE.CylinderGeometry(.12, .3, 4.5, 6), branchM);
    b.position.set(x + Math.cos(a) * 1.6, 7.6, z + Math.sin(a) * 1.6); b.rotation.set(Math.sin(a) * .8, 0, -Math.cos(a) * .8); b.castShadow = true; ctx.add(b);
  }
  const leaves = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), leafM, 40), M = new THREE.Matrix4();
  for (let i = 0; i < 40; i++) {
    const a = Math.random() * 6.28, r = Math.random() * 4.2, s = .9 + Math.random() * 1.1;
    M.makeRotationY(Math.random() * 6).setPosition(x + Math.cos(a) * r, 8.2 + Math.random() * 2.6, z + Math.sin(a) * r); M.scale(new THREE.Vector3(s, s * .7, s)); leaves.setMatrixAt(i, M);
  }
  leaves.castShadow = true; ctx.add(leaves);
  ctx.emitter('petals', x, 2, z, { box: [10, 9, 10], count: 60, vel: [.3, -.6, .2], color: '#b01a12', local: true, opacity: .9, size: .12 });
}
