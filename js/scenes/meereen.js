// MEEREEN — Grande Pyramide à degrés, harpie de bronze, ville de briques sable, palmiers, lumière écrasante.
export const config = {
  hdri: 'qwantani_noon_puresky', exposure: 1.02, bg: 1.7, env: 1,
  fog: ['#e6cfa3', .0032], hemi: ['#fff1d6', '#8a6a44', .55], sun: ['#fff0d2', 4.2, [.25, 1, .35]],
  bloom: [.35, .5, .9], tint: '#fff3e2', bounds: [-160, -200, 160, 110]
};

export async function build(ctx) {
  const { THREE, mat, rand } = ctx;
  const sand = mat('coast_sand_01', { uv: 6, color: '#e8cf9e', rough: 1 });
  const blocks = mat('large_sandstone_blocks', { uv: 4, color: '#e4c79a' });
  const pave = mat('large_sandstone_blocks', { uv: 3, color: '#d9bd8e' });
  const bronze = mat(null, { color: '#7a5a2e', metal: .85, rough: .38 });
  ctx.terrain({ size: 800, seg: 120, height: (x, z) => { const d = Math.max(0, Math.hypot(x, z + 40) - 170); return Math.sin(x * .03) * Math.cos(z * .025) * d * .05 + d * .02; }, mat: sand, splat: { slope: 'rocky_terrain_02', slopeTint: '#e8c890' } });
  ctx.box(120, .05, 150, 0, 0, -10, pave, { solid: false, cast: false });

  // La Grande Pyramide : degrés colorés
  const px = 0, pz = -130, bands = ['#d8b88a', '#b5634b', '#e3cf9a', '#7d8f7c', '#a4825f', '#c99a5a', '#efe0bd'];
  let w = 120, y = 0;
  for (let t = 0; t < 12; t++) {
    ctx.box(w, 6, w, px, y, pz, mat('large_sandstone_blocks', { uv: 4, color: bands[t % bands.length] }));
    y += 6; w -= 9;
  }
  ctx.stairs(px, 0, pz + 60 + 13 * .7, { dir: 'N', n: 13, rise: .46, run: .7, w: 12, mat: blocks });
  ctx.poi(px, pz + 74, 'La Grande Pyramide', 'Trente-trois degrés de briques de toutes les couleurs, dit la légende ; personne n’a jamais eu le courage de les recompter sous ce soleil.');
  harpy(ctx, px, y, pz, 3.2, bronze);
  // Pyramides secondaires
  for (const [x, z, s] of [[-210, -180, .6], [220, -150, .5], [-260, 40, .45], [250, 70, .55]]) {
    let ww = 120 * s, yy = 0; for (let t = 0; t < 8; t++) { ctx.box(ww, 6 * s, ww, x, yy, z, blocks, { solid: false }); yy += 6 * s; ww -= 13 * s; }
  }

  // Fontaine de la Harpie au centre de la place
  ctx.cyl(7, .9, 0, 0, 10, blocks, { seg: 24 });
  const pool = new THREE.Mesh(new THREE.CircleGeometry(6.4, 32), new THREE.MeshStandardMaterial({ color: '#2f6b70', roughness: .05, metalness: .2 }));
  pool.rotation.x = -Math.PI / 2; pool.position.set(0, .82, 10); ctx.add(pool);
  ctx.box(1.6, 3, 1.6, 0, .9, 10, blocks);
  harpy(ctx, 0, 3.9, 10, .55, bronze);
  for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2 + .8; ctx.emitter('spray', Math.cos(a) * 2, .9, 10 + Math.sin(a) * 2, { scale: 1.2 }); }
  ctx.poi(0, 20, 'La fontaine de la Harpie', 'Une harpie de bronze, ailes déployées, chaînes dans les serres. Les enfants y jettent des pièces ; les anciens maîtres, des malédictions.');

  // Ville de briques : maisons cubiques à toits plats
  const avoid = (x, z) => (Math.abs(x) < 64 && z > -205 && z < 66) || Math.hypot(x - 105, z - 20) < 42;
  const city = ctx.cityGrid({ x0: -170, x1: 170, z0: -200, z1: 110, block: 15, street: 4, hMin: 4, hMax: 11, avoid });
  ctx.houses(city.lots, { style: 'dorne', wall: mat('large_sandstone_blocks', { uv: 4, instanced: true }), flat: true, tints: ['#f2d9ae', '#e9c891', '#f7e7c8', '#dcb383', '#e8b48a'], sink: 1 });
  for (const l of city.lots) if (rand() < .35) ctx.box(l.w + .4, .7, l.d + .4, l.x, l.h, l.z, blocks, { solid: false });

  // Arène de Daznak : gradins en ellipse
  const ax = 105, az = 20;
  for (let k = 0; k < 36; k++) {
    const a = k / 36 * Math.PI * 2, nx = Math.cos(a), nz = Math.sin(a);
    if (Math.abs(a - Math.PI) < .18) continue; // entrée côté ouest
    for (let r = 0; r < 3; r++) ctx.box(6, 3 + r * 3, 3, ax + nx * (24 + r * 3), 0, az + nz * (18 + r * 3), mat('large_sandstone_blocks', { uv: 4, color: r % 2 ? '#c98f6a' : '#e4c79a' }), { rotY: -a + Math.PI / 2 });
  }
  ctx.poi(ax - 30, az, 'L’arène de Daznak', 'Les gradins sont peints de rouge, de jaune et d’ocre. Le sable du fond, lui, n’a qu’une couleur, et on le change souvent.', { color: '#ff8a5a' });

  // Marché : auvents de toile colorée
  const cloth = ['#8b0000', '#c9a227', '#2f6b70', '#a4572f', '#5a3a6e'];
  for (let k = 0; k < 14; k++) {
    const x = -50 + (k % 7) * 15, z = 40 + Math.floor(k / 7) * 14;
    for (const [dx, dz] of [[-2.5, -2], [2.5, -2], [-2.5, 2], [2.5, 2]]) ctx.cyl(.1, 2.8, x + dx, 0, z + dz, mat(null, { color: '#5a4030' }), { seg: 5, solid: false });
    const tarp = new THREE.Mesh(new THREE.PlaneGeometry(6, 5, 4, 1), new THREE.MeshStandardMaterial({ color: cloth[k % cloth.length], side: THREE.DoubleSide, roughness: 1 }));
    tarp.rotation.x = -Math.PI / 2 + .12; tarp.position.set(x, 2.9, z); tarp.castShadow = true; ctx.add(tarp);
    ctx.box(3.5, .9, 1.4, x, 0, z, mat('weathered_planks', { uv: 2, color: '#c8a27c' }));
  }
  ctx.poi(-20, 54, 'Le marché aux épices', 'Safran, poivre noir, dattes et cuir tanné. Les marchands crient leurs prix en trois langues et les baissent dans une quatrième.');

  // Palmiers
  const palms = [];
  for (let k = 0; k < 16; k++) palms.push([-56, -60 + k * 8, 1 + rand() * .3], [56, -60 + k * 8, 1 + rand() * .3]);
  for (let k = 0; k < 40; k++) { const a = rand() * 6.28, r = 180 + rand() * 120; palms.push([Math.cos(a) * r, Math.sin(a) * r - 40, 1 + rand() * .4]); }
  ctx.trees(palms, 'palm', { leaf: '#5f7d3a', trunk: '#8a6a44' });
  ctx.poi(52, -30, 'L’allée des palmiers', 'Les jardins suspendus des pyramides déversent leurs vignes sur les terrasses ; en bas, les palmiers offrent la seule ombre gratuite de la ville.');

  ctx.particles('dust', { color: '#ffd090', count: 700, opacity: .35 });
  ctx.spawn(0, 60, 0);
  ctx.sound({ name: 'desert', volume: .55 }, { name: 'crowd', volume: .22 }, { name: 'canal', volume: .4, pos: [0, 1, 10], ref: 3 });
}

// Harpie de bronze stylisée : corps, tête, ailes en voile
function harpy(ctx, x, y, z, s, m) {
  const { THREE } = ctx, g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(.5, .8, 3, 8), m); body.position.y = 2.2; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.55, 10, 8), m); head.position.y = 4.1; g.add(head);
  const leg = new THREE.Mesh(new THREE.BoxGeometry(1.4, .9, .9), m); leg.position.y = .45; g.add(leg);
  const ws = new THREE.Shape(); ws.moveTo(0, 0); ws.lineTo(3.8, 2.6); ws.lineTo(4.4, .4); ws.lineTo(3.2, -.6); ws.lineTo(2.2, -.2); ws.lineTo(1.2, -1.2); ws.closePath();
  for (const sd of [-1, 1]) { const w = new THREE.Mesh(new THREE.ExtrudeGeometry(ws, { depth: .15, bevelEnabled: false }), m); w.position.set(sd * .4, 3, 0); w.scale.x = sd; w.rotation.y = sd * -.35; g.add(w); }
  g.scale.setScalar(s); g.position.set(x, y, z); g.traverse(o => (o.castShadow = true)); ctx.add(g);
}
