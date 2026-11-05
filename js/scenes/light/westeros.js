// Lieux légers de Westeros : Peyredragon, Castral Roc, Hautjardin, Jardins Aquatiques, Les Eyrié, Pyk.
import { smooth, noise } from './util.js';

export default {  // PEYREDRAGON : île volcanique, château aux gargouilles, long escalier vers la mer
  async dragonstone(ctx) {
    const { mat, rand } = ctx;
    const rock = mat('volcanic_rock_tiles', { uv: 6, color: '#6a6866' }), dark = mat('volcanic_rock_tiles', { uv: 4, color: '#4a4848' });
    const h = (x, z) => { const r = Math.hypot(x, (z + 30) * 1.1); return r < 125 ? 26 + noise(x, z) * 1.5 : 26 - 32 * smooth(125, 140, r) + noise(x, z) * 2 * (1 - smooth(125, 140, r)); };
    ctx.terrain({ size: 700, seg: 180, height: h, mat: rock });
    ctx.water({ y: 0, color: '#1c2a30', w: 1600, d: 1600 });
    ctx.ring(-45, -95, 45, -15, { y: h(0, -55) - 2, h: 16, t: 4, mat: dark, gate: 'S', round: true, towerW: 10 });
    ctx.box(30, 26, 22, 0, h(0, -60) - 2, -62, dark);
    for (let k = 0; k < 10; k++) { const x = -40 + k * 9; ctx.cone(1.2, 4, x, h(0, -55) + 14, -15.5, mat(null, { color: '#2a2828', flat: true }), { seg: 5, rotY: 0 }); }
    ctx.box(4, 2.2, 95, 0, -1, 182.5, dark);
    ctx.stairs(0, .9, 136, { dir: 'N', n: 87, rise: .29, run: .6, w: 4, mat: dark });
    for (const z of [150, 170, 190, 210]) ctx.torch(2.4, 3.6, z, { light: z < 175 });
    ctx.poi(0, 222, 'Le chemin de la mer', 'Une chaussée de basalte noir, puis des marches, encore des marches. Ceux qui viennent ici en suppliants arrivent essoufflés, ce qui est sans doute le but.');
    ctx.poi(0, 78, 'La porte des Dragons', 'La pierre a été coulée, pas taillée : le feu des anciens dragons l’a façonnée comme de la cire. Des gargouilles en guettent chaque arrivant.', { color: '#ff7a3a' });
    ctx.poi(0, -30, 'La Table Peinte', 'Une table taillée comme une carte du continent. Celui qui s’y penche voit tout le royaume ; celui qui la regarde trop longtemps veut le posséder.');
    ctx.particles('ash'); ctx.particles('embers', { count: 400 });
    ctx.spawn(0, 228, 0, 1.2);
    ctx.sound({ name: 'waves', volume: .5 }, { name: 'wind', volume: .4 }, { name: 'volcano', volume: .25 }, { name: 'gull', volume: .35, every: [8, 16], randomPos: [0, 10, 180, 80] });
  },

  // CASTRAL ROC : falaise dorée face à la mer du couchant
  async casterly(ctx) {
    const { mat, rand } = ctx;
    const gold = mat('rock_face', { uv: 10, color: '#e0b468' }), stone = mat('yellow_stone_wall', { uv: 4, color: '#f0d8a8' });
    const h = (x, z) => x < -30 ? -4 + smooth(-80, -30, x) * 5.5 : x < -18 ? 1.5 + noise(x, z) * .1 : 1.5 + 72 * smooth(-18, 10, x) + noise(x, z) * 4 * smooth(-18, 0, x);
    ctx.terrain({ size: 600, seg: 200, height: h, mat: gold });
    ctx.water({ y: 0, color: '#2c4a5a', w: 900, d: 900, x: -480 });
    for (let k = 0; k < 6; k++) ctx.tower(20 + (k % 3) * 18, -60 + k * 22, { w: 8, h: 26 + rand() * 14, y: 72, mat: stone, roof: mat('clay_roof_tiles', { uv: 2, color: '#d8a060' }) });
    ctx.box(10, 9, 3, -16.5, 1.5, 0, mat(null, { color: '#1a1410' }), { solid: false });
    ctx.box(14, 14, 2, -17, 0, -6, stone); ctx.box(14, 14, 2, -17, 0, 6, stone);
    const lion = ctx.glow(-17, 12, 0, '#ffd27a', 5); ctx.update(t => (lion.material.opacity = .6 + Math.sin(t) * .2));
    ctx.poi(-24, 0, 'La porte du Lion', 'Une gueule de pierre ouverte dans la falaise. On dit que le Roc est creux comme une ruche et qu’il faut une vie entière pour en connaître tous les couloirs.', { color: '#ffcf5a' });
    ctx.box(4, 5, 3, -17, 1.5, 60, mat(null, { color: '#1a1410' }), { solid: false });
    const g = ctx.glow(-15, 3, 60, '#ffb030', 6); ctx.update(t => (g.material.opacity = .5 + Math.sin(t * 2) * .2));
    ctx.poi(-22, 60, 'Les mines d’or', 'Au fond des galeries, l’or brille dans la roche comme des veines. Les Lannister n’ont jamais eu besoin de marchander : il leur suffit de creuser.', { color: '#ffb030' });
    const lots = []; for (let k = 0; k < 18; k++) lots.push({ x: -37 + rand() * 2, z: -140 + k * 7, w: 5, d: 5.5, h: 4 + rand() * 3 });
    ctx.houses(lots, { style: 'ouest', wall: mat('plastered_wall', { uv: 4, instanced: true }), roof: mat('clay_roof_tiles', { uv: 2.5, instanced: true }), tints: ['#f2dfc0', '#e9cfa6'], roofTints: ['#ffffff', '#e0b090'] });
    ctx.poi(-24, -100, 'Port-Lannis', 'La ville du port vit à l’ombre du Roc. Ses marchands jurent fidélité au lion, et vendent ses reflets dorés à tous les navires qui passent.');
    ctx.particles('dust', { color: '#ffd28a' });
    ctx.spawn(-24, 110, 0);
    ctx.sound({ name: 'waves', volume: .6, pos: [-60, 0, 0], ref: 30 }, { name: 'wind', volume: .3 }, { name: 'gull', volume: .5, every: [5, 11], randomPos: [-40, 15, 0, 120] });
  },

  // HAUTJARDIN : château blanc, labyrinthe de haies, roseraies
  async highgarden(ctx) {
    const { THREE, mat, rand } = ctx;
    const grass = mat('brown_mud', { uv: 5, color: '#9fbf6a', rough: 1 }), white = mat('plastered_wall', { uv: 5, color: '#fbf6ec' });
    const hedge = mat(null, { color: '#3f6a34', rough: 1 }), roofM = mat('grey_roof_tiles', { uv: 3, color: '#7fa0a8' });
    ctx.terrain({ size: 700, seg: 120, height: (x, z) => noise(x, z) * smooth(90, 160, Math.hypot(x, z)), mat: grass });
    ctx.ring(-40, -120, 40, -60, { h: 12, t: 3, mat: white, gate: 'S', round: true, towerRoof: roofM });
    ctx.box(30, 20, 20, 0, 0, -95, white); ctx.roof(31, 8, 21, 0, 20, -95, roofM);
    ctx.tower(-12, -100, { w: 7, h: 32, mat: white, round: true, roof: roofM, roofH: 10 }); ctx.tower(12, -100, { w: 7, h: 28, mat: white, round: true, roof: roofM, roofH: 9 });
    // Labyrinthe : grille + murs aléatoires
    const N = 9, S = 5, ox = -22, oz = -40;
    for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) {
      if (i < N && rand() < .55 && !(j === N && i === 4) && !(j === 0 && i === 4)) ctx.box(S, 2.4, .8, ox + i * S + S / 2, 0, oz + j * S, hedge);
      if (j < N && rand() < .5) ctx.box(.8, 2.4, S, ox + i * S, 0, oz + j * S + S / 2, hedge);
    }
    ctx.poi(0, 12, 'Le labyrinthe de haies', 'On dit qu’on y perd les prétendants indésirables. Les dames Tyrell, elles, en connaissent tous les détours, et s’y racontent des secrets.', { color: '#ffd0e0' });
    // Roseraies
    const roses = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.45, 1), new THREE.MeshStandardMaterial({ roughness: .8 }), 900), M = new THREE.Matrix4(), col = new THREE.Color();
    for (let k = 0; k < 900; k++) {
      const row = k % 12, xi = -60 + (k / 12 | 0) * 1.6, x = xi + (xi > -6 ? 12 : 0), z = 20 + row * 3 + (rand() - .5);
      M.makeTranslation(x, .5 + rand() * .3, z); roses.setMatrixAt(k, M); roses.setColorAt(k, col.set(['#c0102a', '#e8476a', '#f2c0c8', '#d4a017', '#ffffff'][(rand() * 5) | 0]));
    }
    roses.castShadow = true; ctx.add(roses);
    for (let r = 0; r < 12; r++) { ctx.collider(-61, 0, 19.5 + r * 3, -6, .9, 20.5 + r * 3, { noMap: true }); ctx.collider(6, 0, 19.5 + r * 3, 73, .9, 20.5 + r * 3, { noMap: true }); }
    ctx.poi(-5, 18, 'Les roseraies', 'Des roses d’or, de sang et de neige, rangées comme des armées. Ici, même la politique sent bon.', { color: '#ff7aa0' });
    ctx.cyl(4, .8, 0, 0, -50, white, { seg: 20 }); ctx.emitter('spray', 0, .8, -50, { scale: 1.5 });
    const trees = []; for (let k = 0; k < 120; k++) { const a = rand() * 6.28, r = 110 + rand() * 150; trees.push([Math.cos(a) * r, Math.sin(a) * r, 1 + rand()]); }
    ctx.trees(trees, 'round', { leaf: '#4f7a3a' });
    ctx.poi(0, -54, 'La cour de la Rose', 'Les Tyrell ne gagnent pas les guerres : ils nourrissent ceux qui les gagnent. Et finissent toujours à la table du vainqueur.');
    ctx.particles('petals');
    ctx.spawn(0, 70, 0);
    ctx.sound({ name: 'desert', volume: .35 }, { name: 'wind', volume: .2 }, { name: 'canal', volume: .35, pos: [0, 1, -50], ref: 3 });
  },

  // JARDINS AQUATIQUES (Dorne) : patios, bassins, fontaines, arcades
  async dorne(ctx) {
    const { THREE, mat, rand } = ctx;
    const marble = mat('plastered_wall', { uv: 4, color: '#f6e2d6' }), pave = mat('large_sandstone_blocks', { uv: 3, color: '#f0d0b8' });
    ctx.terrain({ size: 600, seg: 80, height: (x, z) => z > 70 ? -4 * smooth(70, 90, z) : noise(x, z) * .5 * smooth(70, 120, Math.hypot(x, z)), mat: mat('coast_sand_01', { uv: 6, color: '#ecd2a8' }) });
    ctx.water({ y: -1, z: 400, w: 1200, d: 600, color: '#2a6a7a' });
    ctx.box(120, .3, 120, 0, 0, 0, pave, { solid: false, cast: false });
    for (let i = -2; i <= 2; i++) for (let j = -2; j <= 1; j++) {
      const x = i * 20, z = j * 20 + 10;
      ctx.box(12, .6, 8, x, 0, z, marble, { cast: false });
      const w = new THREE.Mesh(new THREE.PlaneGeometry(11, 7), new THREE.MeshStandardMaterial({ color: '#3fa0b0', roughness: .05, metalness: .1, transparent: true, opacity: .85 }));
      w.rotation.x = -Math.PI / 2; w.position.set(x, .62, z); ctx.add(w);
      ctx.mapMark(x - 6, z - 4, x + 6, z + 4, '#8fbcc4');
      if ((i + j) % 2 === 0) ctx.emitter('spray', x, .6, z, { scale: 1 });
    }
    for (let k = -6; k <= 6; k++) for (const z of [-45, 45]) ctx.cyl(.45, 5, k * 7, 0, z, marble, { seg: 10 });
    ctx.box(96, 1, 4, 0, 5, -45, marble, { solid: false }); ctx.box(96, 1, 4, 0, 5, 45, marble, { solid: false });
    ctx.box(50, 10, 20, 0, 0, -65, marble); ctx.box(50, 2, 22, 0, 10, -65, pave, { solid: false });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(7, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#e6b88a', roughness: .5 }));
    dome.position.set(0, 12, -65); ctx.add(dome);
    ctx.poi(0, 0, 'Les bassins', 'Les enfants de nobles et de pêcheurs y nagent ensemble. Un prince l’a voulu ainsi, pour qu’aucun ne grandisse en croyant l’eau réservée à quelques-uns.', { color: '#7ad0e0' });
    ctx.poi(0, -50, 'Le palais rose', 'Des arcades de marbre rose, des voilages qui bougent à peine. Ici, la chaleur rend tout le monde lent, sauf les complots.');
    ctx.poi(0, 62, 'La terrasse sur la mer', 'L’air sent l’orange sanguine et le sel. À Dorne, le soleil est un seigneur qu’on respecte, pas qu’on affronte.');
    const palms = []; for (let k = 0; k < 30; k++) palms.push([(rand() - .5) * 140, (rand() - .5) * 140, 1 + rand() * .3]);
    ctx.trees(palms.filter(([x, z]) => Math.abs(x) > 52 || Math.abs(z) > 52), 'palm', { leaf: '#5f8a3a', trunk: '#9a7a54' });
    ctx.particles('dust', { color: '#fff0d0', count: 800 });
    ctx.spawn(0, 40, 0);
    ctx.sound({ name: 'canal', volume: .55 }, { name: 'desert', volume: .35 }, { name: 'waves', volume: .2 });
  },

  // LES EYRIÉ : château perché au-dessus d'une mer de nuages
  async eyrie(ctx) {
    const { THREE, mat, rand } = ctx;
    const rock = mat('rock_face', { uv: 8, color: '#9a968e' }), white = mat('plastered_wall', { uv: 5, color: '#f4f4f0' });
    const h = (x, z) => { const peak = 120 * Math.exp(-((x) ** 2 + (z + 60) ** 2) / 2200); const ridge = 80 - Math.abs(x) * 1.2 + noise(x, z) * 3; return Math.max(peak, Math.max(ridge, 10 + noise(x * 2, z * 2) * 20)); };
    ctx.terrain({ size: 600, seg: 200, height: h, mat: rock });
    for (let k = 0; k < 7; k++) { const a = k / 7 * 6.28; ctx.tower(Math.cos(a) * 9, -60 + Math.sin(a) * 9, { w: 6, h: 24 + (k % 3) * 6, y: 112, mat: white, round: true, roof: mat(null, { color: '#7a9ab8' }) }); }
    ctx.cyl(12, 20, 0, 112, -60, white, { seg: 24 });
    const cloud = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .75, depthWrite: false }));
    cloud.rotation.x = -Math.PI / 2; cloud.position.y = 45; ctx.add(cloud);
    ctx.emitter('steam', 0, 40, 40, { box: [200, 20, 200], count: 300, size: 14, opacity: .2, vel: [1, .1, .3] });
    ctx.poi(0, -36, 'La Porte de la Lune', 'Une trappe dans le sol de la grande salle, ouverte sur six cents pieds de vide. La justice des Arryn est rapide, et elle tombe toujours dans le même sens.', { color: '#c8dcff', y: h(0, -36) });
    ctx.poi(0, 40, 'Le chemin des nuages', 'Le sentier étroit grimpe de relais en relais. Les mules connaissent la route mieux que les hommes, et ne regardent jamais en bas.');
    ctx.poi(-8, 0, 'Le Val d’Arryn', 'Sous les nuages, le Val est vert et riche. D’ici, on ne voit que le ciel, ce qui convient parfaitement à ses seigneurs.');
    ctx.particles('snow', { count: 1500, opacity: .6 });
    ctx.spawn(0, 70, 0);
    ctx.sound({ name: 'blizzard', volume: .4 }, { name: 'wind', volume: .4 });
  },

  // PYK : tours sur des récifs, ponts de corde, tempête
  async pyke(ctx) {
    const { THREE, mat, rand } = ctx;
    const rock = mat('rock_face', { uv: 6, color: '#5a5e62' }), stone = mat('castle_wall_slates', { normal: 'castle_wall_slates_nor', uv: 4, color: '#7a7e84' }), plank = mat('weathered_planks', { uv: 2, color: '#8a7460' });
    ctx.ground(() => -50);
    ctx.water({ reflect: true, y: 0, color: '#18262c', w: 1600, d: 1600, distortion: 6, speed: 1.2 });
    const isles = [[0, 40, 18], [-30, 0, 12], [12, -30, 12], [-10, -70, 14], [40, -60, 10]];
    for (const [x, z, r] of isles) { ctx.cyl(r, 50, x, -26, z, rock, { seg: 9, rTop: r * .85 }); ctx.tower(x, z, { w: r * .8, h: 16, y: 24, mat: stone, round: true, roof: mat(null, { color: '#3a3e44' }) }); }
    for (let k = 0; k < isles.length - 1; k++) {
      const [ax, az, ar] = isles[k], [bx, bz, br] = isles[k + 1], dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L;
      const sx = ax + ux * ar * .82, sz = az + uz * ar * .82, ex = bx - ux * br * .82, ez = bz - uz * br * .82, len = Math.hypot(ex - sx, ez - sz), n = Math.ceil(len / .8);
      for (let i = 0; i < n; i++) {
        const t = (i + .5) / n, sag = Math.sin(t * Math.PI) * 1.2, x = sx + (ex - sx) * t, z = sz + (ez - sz) * t;
        const b = ctx.box(2.2, .15, .7, x, 23.85 - sag, z, plank, { rotY: Math.atan2(ux, uz), solid: false });
        ctx.collider(x - .55, 23 - sag, z - .55, x + .55, 24 - sag, z + .55, { noMap: true });
        if (i % 3 === 0) ctx.update(t2 => (b.position.y = 23.92 - sag + Math.sin(t2 * 2 + i) * .04));
      }
      const rope = new THREE.CatmullRomCurve3([0, .5, 1].map(t => new THREE.Vector3(sx + (ex - sx) * t, 25 - Math.sin(t * Math.PI) * 1.2, sz + (ez - sz) * t)));
      for (const s of [-1, 1]) { const tube = new THREE.Mesh(new THREE.TubeGeometry(rope, 12, .05, 4), mat(null, { color: '#4a3a2a' })); tube.position.set(-uz * s * 1.1, 0, ux * s * 1.1); ctx.add(tube); }
      for (let i = 0; i < n; i++) { const t = (i + .5) / n, x = sx + (ex - sx) * t, z = sz + (ez - sz) * t, sag = Math.sin(t * Math.PI) * 1.2; for (const s of [-1, 1]) ctx.collider(x - uz * s * 1.15 - .1, 23.9 - sag, z + ux * s * 1.15 - .1, x - uz * s * 1.15 + .1, 25.5 - sag, z + ux * s * 1.15 + .1, { noMap: true }); }
    }
    ctx.poi(-15, 20, 'Le pont de corde', 'Il gémit à chaque rafale. Les Fer-nés le traversent sans se tenir : chez eux, la peur se noie avec le reste.', { y: 23 });
    ctx.poi(-10, -66, 'Le donjon de la Mer', 'La tour la plus avancée, battue par les vagues. On y entend les noyés chanter, disent les prêtres. Les autres disent que c’est le vent.', { y: 24 });
    ctx.poi(5, 45, 'La salle du Trône de Grès', 'Un siège taillé dans une pierre noire et huileuse, venue d’on ne sait où. Ce qui est mort ne saurait mourir.', { y: 24 });
    const ship = await ctx.gltf('ship');
    [[60, 60, .8], [-60, 70, -.5], [-70, -50, 2.2]].forEach(([x, z, r], i) => { const s = ship.clone(); s.position.set(x, -.9, z); s.rotation.y = r; ctx.add(s); ctx.update(t => { s.rotation.z = Math.sin(t * 1.2 + i) * .08; s.position.y = -.9 + Math.sin(t * 1.4 + i) * .5; }); });
    // éclairs
    const flash = new THREE.HemisphereLight('#dfe8ff', '#202830', 0); ctx.add(flash);
    let next = 4, last = -9;
    ctx.update(t => { if (t > next) { last = t; next = t + 6 + Math.random() * 10; } flash.intensity = t - last < .25 ? Math.random() * 4 : 0; });
    ctx.particles('rain');
    ctx.spawn(-9, 48, 0, 24);
    ctx.sound({ name: 'blizzard', volume: .6 }, { name: 'waves', volume: .7 });
  }
};
