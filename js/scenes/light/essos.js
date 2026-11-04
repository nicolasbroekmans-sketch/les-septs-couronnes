// Lieux légers d'Essos : Pentos, Vaes Dothrak, Qarth, Volantis, Valyria.
import { smooth, noise } from './util.js';

export default {  // PENTOS : villa blanche en terrasses sur la mer
  async pentos(ctx) {
    const { mat, rand } = ctx;
    const white = mat('plastered_wall', { uv: 4, color: '#fbf3e6' }), pave = mat('large_sandstone_blocks', { uv: 3, color: '#ead8be' });
    const h = z => z < -10 ? 12 : z < 30 ? 12 - (z + 10) * .25 : z < 60 ? 2 - (z - 30) * .2 : -4;
    ctx.terrain({ size: 600, seg: 150, height: (x, z) => h(z) + noise(x, z) * .3, mat: mat('coast_sand_01', { uv: 6, color: '#e6d0a8' }) });
    ctx.water({ reflect: true, y: 0, z: 360, w: 1200, d: 600, color: '#24505e', sun: '#ffcf9a' });
    ctx.box(40, 1, 30, 0, 11.5, -30, pave, { cast: false });
    ctx.box(34, 9, 18, 0, 12.5, -38, white); ctx.roof(19, 4, 35, 0, 21.5, -38, mat('clay_roof_tiles', { uv: 2.5, color: '#e0a080' }), { rotY: Math.PI / 2 });
    for (let k = -4; k <= 4; k++) ctx.cyl(.5, 7, k * 4, 12.5, -27, white, { seg: 12 });
    ctx.box(36, 1, 2.5, 0, 19.5, -27, white, { solid: false });
    ctx.box(14, .2, 5, 0, 12.4, -20, mat(null, { color: '#4fa8b8', rough: .05 }), { solid: false });
    ctx.poi(0, -18, 'La villa du magistère', 'Fontaines, tapis de Myr, esclaves qu’on appelle serviteurs : à Pentos, on change les mots plus volontiers que les choses.');
    ctx.poi(0, 50, 'La plage', 'Des barques de pêcheurs tirées sur le sable, et au loin les voiles de Braavos. Ici, les rois en exil viennent attendre leur heure.');
    const ship = await ctx.gltf('ship');
    [[-40, 120, .6], [50, 180, -.4], [0, 260, 1.4]].forEach(([x, z, r], i) => { const s = ship.clone(); s.position.set(x, -.9, z); s.rotation.y = r; ctx.add(s); ctx.update(t => (s.position.y = -.9 + Math.sin(t * .7 + i) * .2)); });
    const trees = []; for (let k = 0; k < 40; k++) trees.push([(rand() - .5) * 120, -60 - rand() * 60, 1 + rand() * .5]);
    for (let k = 0; k < 10; k++) trees.push([-25 + k * 5.5, -55, 1]);
    ctx.trees(trees, 'cypress', { leaf: '#3c4a2a' });
    ctx.poi(-40, 10, 'Le jardin des cyprès', 'Les cyprès montent la garde comme des lanciers. Entre eux, une allée de pierre mène vers la mer, et vers l’Est.');
    ctx.particles('dust', { color: '#ffe0b0', count: 700 });
    ctx.spawn(0, 22, 0);
    ctx.sound({ name: 'waves', volume: .55 }, { name: 'gull', volume: .5, every: [5, 12], randomPos: [0, 15, 80, 120] }, { name: 'wind', volume: .2 });
  },

  // VAES DOTHRAK : steppe, porte des chevaux de bronze, avenue des dieux volés
  async vaesdothrak(ctx) {
    const { mat, rand } = ctx;
    ctx.terrain({ size: 900, seg: 150, height: (x, z) => Math.sin(x * .012) * Math.cos(z * .01) * 6 + noise(x, z) * .6 + 140 * Math.exp(-((x + 40) ** 2 + (z + 420) ** 2) / 12000), mat: mat('brown_mud', { uv: 6, color: '#b8b47a', rough: 1 }) });
    const horse = await ctx.gltf('horse');
    for (const s of [-1, 1]) { const h = horse.clone(); h.scale.setScalar(5); h.position.set(s * 16, ctx.engine.groundFn(s * 16, 40), 40); h.rotation.y = s > 0 ? Math.PI * .5 + .3 : -Math.PI * .5 - .3; ctx.add(h); ctx.collider(s * 16 - 8, 0, 32, s * 16 + 8, 30, 48); }
    ctx.poi(0, 50, 'La porte des Chevaux', 'Deux étalons de bronze se cabrent au-dessus de la route, sabots dressés. Entre eux, on entre dans la seule cité où nul ne peut tirer une lame.', { color: '#ffcf5a' });
    const stone = mat('rock_face', { uv: 3, color: '#a09484' });
    for (let k = 0; k < 14; k++) for (const s of [-1, 1]) {
      const z = 20 - k * 14, x = s * (12 + rand() * 3), y = ctx.engine.groundFn(x, z) - .5, t = rand();
      if (t < .4) ctx.box(2 + rand() * 2, 5 + rand() * 6, 2, x, y, z, stone);
      else if (t < .7) ctx.cyl(1.2, 6 + rand() * 5, x, y, z, stone, { seg: 6 });
      else { ctx.box(3, 2, 3, x, y, z, stone); ctx.cone(1.6, 4, x, y + 2, z, stone); }
    }
    ctx.poi(14, -40, 'L’avenue des dieux', 'Des dieux de tous les peuples conquis, arrachés à leurs temples et alignés ici comme des trophées. Personne ne les prie ; tout le monde les regarde.');
    const tentM = mat(null, { color: '#a07a50', flat: true });
    for (let k = 0; k < 40; k++) { const a = rand() * 6.28, r = 40 + rand() * 120, x = Math.cos(a) * r, z = Math.sin(a) * r - 120; if (Math.abs(x) < 22) continue; ctx.cone(3 + rand() * 2, 4 + rand() * 2, x, ctx.engine.groundFn(x, z), z, tentM, { seg: 7, solid: true }); }
    ctx.water({ y: 1.5, x: 120, z: -260, w: 120, d: 80, color: '#3a6a7a' });
    ctx.poi(-40, -220, 'La Mère des Montagnes', 'Au pied de la montagne sacrée dort un lac sans fond, le Ventre du Monde. Les cavaliers disent que le premier homme en est sorti à cheval.');
    ctx.particles('dust', { color: '#fff0c0', count: 1000 });
    ctx.spawn(0, 90, 0);
    ctx.sound({ name: 'wind', volume: .55 }, { name: 'desert', volume: .3 });
  },

  // QARTH : trois murailles sculptées dans le désert rouge
  async qarth(ctx) {
    const { THREE, mat, rand } = ctx;
    ctx.terrain({ size: 800, seg: 140, height: (x, z) => { const r = Math.hypot(x, z + 60); return (Math.sin(x * .03 + z * .02) * 4 + Math.sin(x * .011) * 6) * smooth(80, 140, r); }, mat: mat('coast_sand_01', { uv: 6, color: '#e09a6a', rough: 1 }) });
    const walls = [['#c0503a', 70, 18], ['#e6d2b0', 56, 22], ['#4a8a7a', 42, 26]];
    walls.forEach(([col, r, hh], k) => {
      const m = mat('yellow_stone_wall', { uv: 4, color: col });
      ctx.ring(-r, -60 - r, r, -60 + r, { h: hh, t: 3, mat: m, gate: 'S', gateW: 8, round: true, towerW: 9, towerExtra: 8 });
      for (let i = 0; i < 18; i++) if (Math.abs(-r + 4 + i * (2 * r - 8) / 17) > 8) ctx.box(4, 2, .3, -r + 4 + i * (2 * r - 8) / 17, hh * .55, -60 + r + 1.6, mat(null, { color: k === 1 ? '#c9a227' : '#f2e6c8', metal: .4, rough: .5 }), { solid: false });
    });
    for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28, x = Math.cos(a) * 22, z = -60 + Math.sin(a) * 22; ctx.cyl(2.2, 34, x, 0, z, mat('plastered_wall', { uv: 4, color: '#f6ead6' }), { seg: 12 });
      const d = new THREE.Mesh(new THREE.SphereGeometry(2.6, 16, 10), new THREE.MeshStandardMaterial({ color: k % 2 ? '#3a7a8a' : '#c9a227', metalness: .5, roughness: .35 })); d.position.set(x, 35, z); ctx.add(d); }
    ctx.poi(0, 16, 'La première muraille', 'Rouge et sculptée d’animaux qui chassent. On dit que Qarth est la plus grande cité qui fut et sera ; Qarth le dit, surtout.', { color: '#ff8a5a' });
    ctx.poi(0, 0, 'La deuxième muraille', 'Ivoire, gravée de scènes de guerre. Les marchands la franchissent avec des épices ; ils repartent avec des promesses.');
    ctx.poi(0, -16, 'La troisième muraille', 'Verte, couverte d’amants enlacés. Derrière, les Conjurateurs boivent une liqueur bleue et parlent aux ombres.', { color: '#7ad0b0' });
    ctx.particles('dust', { color: '#ffb880', count: 1600, vel: [2.5, .1, .5] });
    ctx.spawn(0, 120, 0);
    ctx.sound({ name: 'desert', volume: .6 }, { name: 'wind', volume: .3 }, { name: 'crowd', volume: .12 });
  },

  // VOLANTIS : le Long Pont sur la Rhoyne, le Mur Noir
  async volantis(ctx) {
    const { mat, rand } = ctx;
    const h = (x, z) => Math.abs(x) < 45 ? -5 : 1.5 + noise(x, z) * .3 * smooth(45, 60, Math.abs(x));
    ctx.terrain({ size: 600, seg: 150, height: h, mat: mat('large_sandstone_blocks', { uv: 4, color: '#d8c0a0' }) });
    ctx.water({ reflect: true, y: 0, w: 92, d: 900, color: '#3a5a4a', sun: '#ffd8a0' });
    const stone = mat('large_sandstone_blocks', { uv: 4, color: '#cdb594' });
    ctx.box(100, 1, 9, 0, .5, 0, stone);
    for (let k = -4; k <= 4; k++) ctx.box(4, 6, 6, k * 11, -5, 0, stone, { solid: false });
    for (const s of [-1, 1]) ctx.box(100, 1.1, .4, 0, 1.5, s * 4.3, stone);
    const lots = []; for (let k = 0; k < 12; k++) { if (k === 5 || k === 6) continue; lots.push({ x: -42 + k * 7.6, z: 6.5, w: 6.6, d: 4, h: 5 + rand() * 4, y: 1 }, { x: -42 + k * 7.6, z: -6.5, w: 6.6, d: 4, h: 5 + rand() * 4, y: 1 }); }
    for (const l of lots) ctx.box(l.w, 1, l.d + .2, l.x, -.2, l.z, stone, { solid: false });
    ctx.houses(lots, { wall: mat('painted_plaster_wall', { uv: 4, instanced: true }), roof: mat('clay_roof_tiles', { uv: 2.5, instanced: true }), tints: ['#e8b48a', '#d98c6a', '#f0d8b0', '#b88a6a', '#a8c0b0'], roofTints: ['#ffffff', '#e0a080'], sink: 0 });
    ctx.poi(0, 0, 'Le Long Pont', 'Des boutiques, des auberges et des temples, tous bâtis sur le pont lui-même. On peut y naître, y vivre et y mourir sans jamais toucher la rive.');
    const black = mat('volcanic_rock_tiles', { uv: 6, color: '#2a2a2c', rough: .3, metal: .3 });
    for (let k = 0; k < 40; k++) { const a = k / 40 * 6.28, x = 130 + Math.cos(a) * 60, z = -40 + Math.sin(a) * 45; ctx.box(10, 50, 6, x, 0, z, black, { rotY: a + Math.PI / 2 }); }
    ctx.poi(64, -10, 'Le Mur Noir', 'Une muraille ovale de pierre fondue, sans joint ni fissure, si large que six chars y roulent de front. Seuls les descendants de l’ancien sang y ont leur place.', { color: '#c8a0ff' });
    const city = ctx.cityGrid({ x0: -150, x1: -55, z0: -130, z1: 130, block: 14, street: 4, hMin: 5, hMax: 10, avoid: (x, z, w) => x + w / 2 > -54 });
    ctx.houses(city.lots, { wall: mat('painted_plaster_wall', { uv: 4, instanced: true }), roof: mat('clay_roof_tiles', { uv: 2.5, instanced: true }), tints: ['#e8b48a', '#d98c6a', '#f0d8b0', '#a8c0b0'], roofTints: ['#ffffff', '#e0a080'] });
    ctx.poi(-60, 20, 'La rive des marchands', 'Ici on vend des tatouages de larmes, des éléphants nains et des rumeurs de dragons à venir.');
    for (let k = -4; k <= 4; k += 2) ctx.torch(k * 10, 3.2, 4.4, { light: false });
    ctx.particles('dust', { color: '#ffe0b0', count: 900 });
    ctx.spawn(-50, 0, -Math.PI / 2);
    ctx.sound({ name: 'canal', volume: .5 }, { name: 'crowd', volume: .3 }, { name: 'gull', volume: .3, every: [8, 15], randomPos: [0, 15, 0, 100] });
  },

  // VALYRIA : ruines fumantes, failles de lave, brume
  async valyria(ctx) {
    const { THREE, mat, rand } = ctx;
    const rock = mat('volcanic_rock_tiles', { uv: 5, color: '#4a4442' });
    ctx.terrain({ size: 500, seg: 160, height: (x, z) => noise(x * 1.5, z * 1.5) * 1.6 + Math.sin(x * .02) * 4 - 6 * smooth(90, 130, Math.hypot(x, z)), mat: rock });
    const lava = new THREE.MeshStandardMaterial({ color: '#ff4a10', emissive: '#ff3a00', emissiveIntensity: 3 });
    for (let k = 0; k < 26; k++) {
      const a = rand() * 6.28, r = 10 + rand() * 80, x = Math.cos(a) * r, z = Math.sin(a) * r, L = 6 + rand() * 18;
      const m = new THREE.Mesh(new THREE.BoxGeometry(.6 + rand(), .2, L), lava); m.position.set(x, ctx.engine.groundFn(x, z) + .02, z); m.rotation.y = rand() * 3; ctx.add(m);
    }
    ctx.update(t => (lava.emissiveIntensity = 2.6 + Math.sin(t * 1.3) * .8));
    const marble = mat('plastered_wall', { uv: 4, color: '#8a8480' });
    for (let k = 0; k < 40; k++) { const x = -40 + (k % 10) * 9, z = -30 + Math.floor(k / 10) * 18, hh = rand() < .35 ? 9 : 1 + rand() * 6; if (rand() < .2) continue; ctx.cyl(.8, hh, x, ctx.engine.groundFn(x, z) - .5, z, marble, { seg: 10 }); }
    for (let k = 0; k < 6; k++) { const x = -60 + k * 24, z = 40 + (k % 2) * 10; ctx.box(2, 12, 2, x - 4, -.5, z, marble); ctx.box(2, 12 - k, 2, x + 4, -.5, z, marble); if (k % 2 === 0) ctx.box(10, 2, 2, x, 11.5, z, marble, { solid: false }); }
    for (let k = 0; k < 20; k++) { const x = (rand() - .5) * 160, z = (rand() - .5) * 160; ctx.box(2 + rand() * 4, 1 + rand() * 2, 2 + rand() * 4, x, ctx.engine.groundFn(x, z) - .5, z, marble, { rotY: rand() * 3 }); }
    for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28; ctx.emitter('smoke', Math.cos(a) * 50, 0, Math.sin(a) * 50, { box: [10, 50, 10], count: 60, opacity: .3, size: 7 }); ctx.glow(Math.cos(a) * 50, 1, Math.sin(a) * 50, '#ff5a20', 14); }
    ctx.poi(0, 0, 'Le forum des Seigneurs-Dragons', 'Il ne reste que des colonnes, et la marque noire des flammes sur le marbre. Quarante familles régnaient ici ; une seule nuit a suffi.', { color: '#ff7a4a' });
    ctx.poi(-48, 40, 'Les arches brisées', 'Les routes de pierre fondue partaient d’ici vers tous les horizons. Elles existent encore ; aucune ne mène plus nulle part.', { color: '#ff7a4a' });
    ctx.poi(40, -40, 'La brume rouge', 'Les marins jurent qu’on y entend des voix. Ceux qui ont respiré la fumée trop longtemps ne jurent plus rien.', { color: '#ff7a4a' });
    ctx.particles('ash', { count: 4000 }); ctx.particles('embers', { count: 800 });
    ctx.spawn(0, 70, 0);
    ctx.sound({ name: 'volcano', volume: .6 }, { name: 'wind', volume: .4 }, { name: 'fire', volume: .3 });
  }
};
