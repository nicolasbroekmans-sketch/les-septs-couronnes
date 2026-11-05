// BRAAVOS — cent îles, canaux réfléchissants (Water), ponts, façades colorées, le Titan à l'entrée du port.
export const config = {
  hdri: 'kloofendal_misty_morning_puresky', exposure: 1, bg: .95, env: 1,
  fog: ['#b7c2c6', .0024], hemi: ['#e6eef2', '#4b4a44', .5], sun: ['#ffe9cc', 2.2, [.4, .45, -.5]],
  bloom: [.45, .5, .85], tint: '#f3f6f8', bounds: [-140, -170, 140, 90], killY: -.8
};

export async function build(ctx) {
  const { THREE, mat, rand } = ctx;
  const quay = mat('large_sandstone_blocks', { uv: 4, color: '#b7aea0' });
  const pave = mat('cobblestone_floor_01', { normal: 'cobblestone_floor_01_nor', uv: 3, color: '#bdb5a8' });
  const stone = mat('castle_wall_slates', { normal: 'castle_wall_slates_nor', uv: 4, color: '#9c9890' });
  ctx.ground(() => -4);
  ctx.water({ reflect: true, y: 0, w: 1600, d: 1600, z: -200, color: '#22414a', sun: '#fff1d6', distortion: 1.4, scale: 3, speed: .4 });

  // Grille de canaux
  const xs = [-112, -76, -40, 0, 40, 76, 112], xw = [8, 8, 8, 14, 8, 8, 8];
  const zs = [-130, -94, -58, -22, 14, 50], zw = [8, 8, 8, 8, 8, 8];
  const isl = [];
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < zs.length - 1; j++) {
    const x0 = xs[i] + xw[i] / 2, x1 = xs[i + 1] - xw[i + 1] / 2, z0 = zs[j] + zw[j] / 2, z1 = zs[j + 1] - zw[j + 1] / 2;
    isl.push({ i, j, x0, x1, z0, z1, cx: (x0 + x1) / 2, cz: (z0 + z1) / 2 });
    ctx.box(x1 - x0, 5, z1 - z0, (x0 + x1) / 2, -3.5, (z0 + z1) / 2, quay, { cast: false });
    ctx.box(x1 - x0 - .2, .03, z1 - z0 - .2, (x0 + x1) / 2, 1.5, (z0 + z1) / 2, pave, { solid: false, cast: false });
  }
  const at = (i, j) => isl.find(o => o.i === i && o.j === j);
  const rail = mat('large_sandstone_blocks', { uv: 2, color: '#d8cfc0' });
  const bridgeM = mat('large_sandstone_blocks', { uv: 3, color: '#c9bfae' });
  // Balustrades (avec ouvertures aux ponts) + ponts
  const balu = (ax, az, bx, bz, gap) => {
    const len = Math.hypot(bx - ax, bz - az), alongX = az === bz, mx = (ax + bx) / 2, mz = (az + bz) / 2;
    const segs = gap ? [[-len / 2, -2.4], [2.4, len / 2]] : [[-len / 2, len / 2]];
    for (const [u0, u1] of segs) { const l = u1 - u0, c = (u0 + u1) / 2; ctx.box(alongX ? l : .45, 1.05, alongX ? .45 : l, mx + (alongX ? c : 0), 1.5, mz + (alongX ? 0 : c), rail, { cast: false }); }
  };
  for (const o of isl) {
    const E = at(o.i + 1, o.j), W = at(o.i - 1, o.j), N = at(o.i, o.j - 1), S = at(o.i, o.j + 1);
    balu(o.x0 + .2, o.z0 + .2, o.x1 - .2, o.z0 + .2, !!N); balu(o.x0 + .2, o.z1 - .2, o.x1 - .2, o.z1 - .2, !!S);
    balu(o.x0 + .2, o.z0 + .2, o.x0 + .2, o.z1 - .2, !!W); balu(o.x1 - .2, o.z0 + .2, o.x1 - .2, o.z1 - .2, !!E);
    if (E) bridge(ctx, o.x1, E.x0, o.cz, true, bridgeM, rail);
    if (S) bridge(ctx, o.z1, S.z0, o.cx, false, bridgeM, rail);
  }

  // Façades colorées : 4 quartiers par île, rue en croix vers les ponts
  const lots = [];
  for (const o of isl) {
    if ((o.i === 3 && o.j === 2) || (o.i === 1 && o.j === 3)) continue; // îles des monuments
    const hw = (o.x1 - o.x0) / 2, hd = (o.z1 - o.z0) / 2;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const qx = o.cx + sx * (hw + 2.5) / 2, qz = o.cz + sz * (hd + 2.5) / 2, qw = hw - 5.5, qd = hd - 5.5;
      const split = rand() < .5;
      for (let k = 0; k < 2; k++) {
        const w = split ? qw / 2 : qw, d = split ? qd : qd / 2;
        lots.push({ x: qx + (split ? (k - .5) * w : 0), z: qz + (split ? 0 : (k - .5) * d), w: w - .4, d: d - .4, h: 9 + rand() * 9, y: 1.5 });
      }
    }
  }
  ctx.houses(lots, { style: 'essos',
    wall: mat('painted_plaster_wall', { uv: 4, instanced: true }), roof: mat('clay_roof_tiles', { uv: 2.5, instanced: true }),
    tints: ['#c96f4a', '#d9a441', '#5d8a8c', '#a8574f', '#e2c9a4', '#7b8fb0', '#b9785a', '#e4b77a'], roofTints: ['#8a5040', '#6e4a3a', '#9a6a52'], windows: '#ffcf8a', sink: 0, roofH: .35
  });

  // Banque de Fer : colonnade et fronton sur l'île centrale
  const b = at(3, 2);
  ctx.box(24, 1.2, 20, b.cx, 1.5, b.cz - 1, stone);
  ctx.stairs(b.cx, 1.5, b.cz + 11, { dir: 'N', n: 4, rise: .3, run: .5, w: 16, mat: stone });
  ctx.box(22, 12.5, 12, b.cx, 2.7, b.cz - 5, stone);
  for (let k = -4; k <= 4; k++) ctx.cyl(.7, 11, b.cx + k * 2.6, 2.7, b.cz + 4, stone, { seg: 12 });
  ctx.box(24, 1.5, 3, b.cx, 13.7, b.cz + 4, stone, { solid: false });
  ctx.roof(17, 4, 24, b.cx, 15.2, b.cz - 3, mat('grey_roof_tiles', { uv: 3, color: '#7d8188' }), { rotY: Math.PI / 2 });
  ctx.poi(b.cx, b.cz + 13, 'La Banque de Fer', 'Elle ne lève pas d’armée et ne porte pas de couronne. Elle prête, simplement. Et la Banque de Fer finit toujours par être remboursée.');
  // Maison du Noir et du Blanc : temple sombre, porte noire et blanche
  const h = at(1, 3);
  ctx.box(18, 12, 18, h.cx, 1.5, h.cz, mat('volcanic_rock_tiles', { uv: 4, color: '#3a3a3c' }));
  const dome = new THREE.Mesh(new THREE.SphereGeometry(9, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#2a2a2e', roughness: .6 }));
  dome.position.set(h.cx, 13.5, h.cz); dome.castShadow = true; ctx.add(dome);
  ctx.box(1.6, 4, .2, h.cx - .8, 1.5, h.cz + 9.05, mat(null, { color: '#0d0d0f' }), { solid: false });
  ctx.box(1.6, 4, .2, h.cx + .8, 1.5, h.cz + 9.05, mat(null, { color: '#e8e4dc' }), { solid: false });
  ctx.poi(h.cx, h.cz + 12, 'La Maison du Noir et du Blanc', 'Une porte moitié ébène, moitié barral. Derrière, un bassin noir où l’on vient boire une dernière fois. Le Dieu Multiface ne refuse personne.', { color: '#c8c8d8' });

  // Le Titan : silhouette géante à l'entrée du port (modèle GLTF)
  const titan = await ctx.gltf('titan');
  titan.scale.setScalar(1.25); titan.position.set(0, 0, -470); titan.rotation.y = Math.PI; ctx.add(titan);
  for (const s of [-1, 1]) ctx.box(60, 30, 90, s * 80, -4, -470, mat('rock_face', { uv: 8, color: '#5e5f5c' }), { solid: false });
  ctx.poi(0, -128, 'Le Titan de Braavos', 'Mi-forteresse, mi-dieu de bronze, il enjambe la passe. Quand un navire approche, il rugit, et ses yeux s’allument comme deux phares.');

  // Navires (GLTF) et gondoles sur les canaux
  const ship = await ctx.gltf('ship');
  [[-60, -200, .4], [50, -230, -.3], [-20, -300, .1], [130, -170, 1.4]].forEach(([x, z, r], i) => {
    const s = ship.clone(); s.position.set(x, -.9, z); s.rotation.y = r; ctx.add(s);
    ctx.update(t => (s.position.y = -.9 + Math.sin(t * .7 + i) * .2));
  });
  const boatM = mat(null, { color: '#3a2a1e' });
  for (let k = 0; k < 7; k++) {
    const boat = new THREE.Group(), hull = new THREE.Mesh(new THREE.BoxGeometry(1.4, .5, 6), boatM); hull.position.y = .25; boat.add(hull);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 3.5), boatM); pole.position.set(.4, 1.6, -2); pole.rotation.x = .4; boat.add(pole);
    boat.traverse(o => (o.castShadow = true)); ctx.add(boat);
    const alongZ = k % 2 === 0, lane = alongZ ? xs[1 + (k % 5)] : zs[1 + (k % 4)], sp = 3 + rand() * 2, off = rand() * 300;
    if (!alongZ) boat.rotation.y = Math.PI / 2;
    ctx.update(t => { const u = ((t * sp + off) % 260) - 130; if (alongZ) boat.position.set(lane, .05, u - 40); else boat.position.set(u, .05, lane); });
  }
  ctx.poi(0, 8, 'Le Long Canal', 'La grande artère de la cité. Les statues des seigneurs de la mer la bordent, et les gondoles s’y croisent sans jamais se toucher.');
  for (let k = 0; k < 10; k++) { const z = -120 + k * 18; for (const s of [-1, 1]) ctx.torch(s * 7.6, 3.2, z, { light: false, size: .8 }); }

  ctx.particles('dust', { color: '#ffffff', opacity: .25, count: 900 });
  ctx.spawn(-8, -42, 0, 1.5);
  ctx.sound({ name: 'canal', volume: .5 }, { name: 'waves', volume: .25 }, { name: 'gull', volume: .45, every: [5, 12], randomPos: [0, 18, -60, 120], ref: 12 },
    { name: 'crowd', volume: .12 }, { name: 'chime', volume: .35, rate: .35, pos: [0, 60, -470], every: [25, 45], ref: 80 });
}

function bridge(ctx, a, b, c, alongX, m, rail) {
  const len = b - a, mid = (a + b) / 2;
  const [w, d, x, z] = alongX ? [len + 1, 4.4, mid, c] : [4.4, len + 1, c, mid];
  ctx.box(w, .5, d, x, 1.0, z, m);
  ctx.box(alongX ? len * .8 : 4.2, .8, alongX ? 4.2 : len * .8, x, .5, z, m, { solid: false });
  for (const s of [-1, 1]) ctx.box(alongX ? len + 1 : .35, 1.05, alongX ? .35 : len + 1, x + (alongX ? 0 : s * 2.1), 1.5, z + (alongX ? s * 2.1 : 0), rail, { cast: false });
}
