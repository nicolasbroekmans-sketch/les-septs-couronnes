// Accessoires de décor (fusionnés en géométrie statique) : tonneaux, caisses, charrettes, étals,
// bannières armoriées, lanternes, puits, meules de foin, clôtures, bois, cibles d'archerie, bancs.
import * as THREE from 'three';
import { bannerTexture, HOUSES } from './sigils.js';

export function propBuilders(E, ctx) {
  const wood = () => ctx.mat('weathered_planks', { uv: 1.5, color: '#9a7a5a' }), dark = () => ctx.mat(null, { color: '#3a2a1c' });
  const iron = () => ctx.mat(null, { color: '#2e2e32', metal: .7, rough: .5 }), y0 = (x, z) => E.physics.groundFn(x, z);
  const P = {
    barrel(x, z, s = 1) { ctx.placeModel(ctx.rand() < .5 ? 'barrel_03' : 'wine_barrel_01', x, z, { s }); },
    crate(x, z, s = 1, rot = 0) { ctx.placeModel('wooden_crate_01', x, z, { s: s * 1.4, rot }); },
    sack(x, z) { const m = new THREE.Mesh(new THREE.SphereGeometry(.35, 8, 6).scale(1, .75, .8), ctx.mat(null, { color: '#b8a070', rough: 1 })); m.position.set(x, y0(x, z) + .25, z); m.castShadow = true; m.userData.merge = true; E.scene.add(m); },
    cart(x, z, rot = 0) {
      const g = new THREE.Group(), w = wood(); g.position.set(x, y0(x, z), z); g.rotation.y = rot;
      const add = (geo, m, px, py, pz, rx = 0, rz = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(px, py, pz); o.rotation.set(rx, 0, rz); o.castShadow = true; o.userData.merge = true; g.add(o); };
      add(new THREE.BoxGeometry(1.6, .12, 2.6), w, 0, .8, 0); add(new THREE.BoxGeometry(1.6, .5, .08), w, 0, 1.1, 1.26); add(new THREE.BoxGeometry(1.6, .5, .08), w, 0, 1.1, -1.26);
      add(new THREE.BoxGeometry(.08, .5, 2.6), w, .78, 1.1, 0); add(new THREE.BoxGeometry(.08, .5, 2.6), w, -.78, 1.1, 0);
      for (const s of [-1, 1]) add(new THREE.CylinderGeometry(.55, .55, .1, 12), dark(), s * .9, .55, .3, 0, Math.PI / 2);
      add(new THREE.BoxGeometry(.1, .1, 1.8), w, .3, .7, -2); add(new THREE.BoxGeometry(.1, .1, 1.8), w, -.3, .7, -2);
      E.scene.add(g); g.updateMatrixWorld(); ctx.colliderFrom(g);
    },
    stall(x, z, rot = 0, cloth = '#8b0000') {
      const c = Math.cos(rot), s = Math.sin(rot), at = (dx, dz) => [x + dx * c + dz * s, z - dx * s + dz * c];
      for (const [dx, dz] of [[-1.4, -1], [1.4, -1], [-1.4, 1], [1.4, 1]]) { const [px, pz] = at(dx, dz); ctx.cyl(.07, 2.5, px, y0(px, pz), pz, dark(), { seg: 5, solid: false }); }
      ctx.box(3, .9, 1.2, x, y0(x, z), z, wood(), { rotY: rot });
      const t = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.6, 4, 1), new THREE.MeshStandardMaterial({ color: cloth, side: THREE.DoubleSide, roughness: 1 }));
      t.rotation.set(-Math.PI / 2 + .15, rot, 0, 'YXZ'); t.position.set(x, y0(x, z) + 2.55, z); t.castShadow = true; E.scene.add(t);
      for (let i = 0; i < 4; i++) { const [px, pz] = at(-1 + i * .65, 0); const b = new THREE.Mesh(new THREE.SphereGeometry(.13, 6, 5), ctx.mat(null, { color: ['#c8401a', '#d8a020', '#6a8a3a', '#8a3a6a'][i] })); b.position.set(px, y0(x, z) + 1, pz); b.userData.merge = true; E.scene.add(b); }
    },
    banner(x, y, z, house = 'stark', rot = 0, size = 1) {
      const [kind, field, fig] = HOUSES[house] ?? HOUSES.stark;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4 * size, 2.4 * size, 1, 6), new THREE.MeshStandardMaterial({ map: bannerTexture(kind, field, fig), side: THREE.DoubleSide, roughness: .95 }));
      m.position.set(x, y - 1.2 * size, z); m.rotation.y = rot; m.castShadow = true; E.scene.add(m);
      const pos = m.geometry.attributes.position, base = Float32Array.from(pos.array), ph = Math.random() * 6;
      ctx.update(t => { for (let i = 0; i < pos.count; i++) { const yy = base[i * 3 + 1], k = (1.2 * size - yy) / (2.4 * size); pos.setZ(i, Math.sin(t * 2 + ph + yy * 2) * .12 * k); } pos.needsUpdate = true; });
      ctx.box(1.6 * size, .08, .08, x, y, z, dark(), { rotY: rot, solid: false });
    },
    /** Étendard sur mât, planté au sol. */
    standard(x, z, house, h = 6) { ctx.cyl(.07, h, x, y0(x, z), z, dark(), { seg: 6 }); P.banner(x + .75, y0(x, z) + h - .2, z, house, 0, .8); },
    lantern(x, z, h = 3) { ctx.cyl(.06, h, x, y0(x, z), z, iron(), { seg: 5 }); ctx.box(.3, .4, .3, x, y0(x, z) + h - .1, z, iron(), { solid: false }); ctx.glow(x, y0(x, z) + h + .1, z, '#ffb060', 1.2); },
    well(x, z) { ctx.placeModel('wooden_bucket_01', x + 1.4, z + .6, { s: 1.2 }); const y = y0(x, z), st = ctx.mat('castle_wall_slates', { uv: 2, color: '#9a9a9a' }); ctx.cyl(1, .9, x, y, z, st, { seg: 14 }); for (const s of [-1, 1]) ctx.box(.15, 2.4, .15, x + s * .9, y, z, wood(), { solid: false }); ctx.roof(2.4, .8, 1.4, x, y + 2.4, z, ctx.mat('grey_roof_tiles', { uv: 1.5 }), { rotY: Math.PI / 2 }); },
    hay(x, z, s = 1) { const m = new THREE.Mesh(new THREE.CylinderGeometry(.9 * s, 1 * s, 1.2 * s, 10), ctx.mat(null, { color: '#c8a85a', rough: 1 })); m.rotation.z = Math.PI / 2; m.position.set(x, y0(x, z) + .9 * s, z); m.castShadow = true; m.userData.merge = true; E.scene.add(m); ctx.collider(x - .7 * s, y0(x, z), z - 1 * s, x + .7 * s, y0(x, z) + 1.8 * s, z + 1 * s); },
    fence(x1, z1, x2, z2) { const n = Math.ceil(Math.hypot(x2 - x1, z2 - z1) / 2), a = Math.atan2(x2 - x1, z2 - z1); for (let i = 0; i <= n; i++) { const x = x1 + (x2 - x1) * i / n, z = z1 + (z2 - z1) * i / n; ctx.box(.15, 1.2, .15, x, y0(x, z), z, wood(), { cast: false }); if (i < n) { const mx = x + (x2 - x1) / n / 2, mz = z + (z2 - z1) / n / 2; for (const hh of [.45, .95]) ctx.box(.08, .12, 2.05, mx, y0(mx, mz) + hh, mz, wood(), { rotY: a, solid: hh > .5, cast: false }); } } },
    woodpile(x, z, rot = 0) { if (ctx.rand() < .35) ctx.placeModel('wooden_axe', x + .9, z + .4, { s: 1 }); for (let r = 0; r < 3; r++) for (let i = 0; i < 6 - r; i++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(.14, .14, 1.4, 6), ctx.mat(null, { color: '#7a5a3a' })); m.rotation.set(0, rot, Math.PI / 2, 'YXZ'); const off = (i - (5 - r) / 2) * .29; m.position.set(x + Math.cos(rot) * off, y0(x, z) + .14 + r * .25, z - Math.sin(rot) * off); m.userData.merge = true; E.scene.add(m); } ctx.collider(x - .9, y0(x, z), z - .9, x + .9, y0(x, z) + .8, z + .9); },
    target(x, z, rot = 0) { ctx.box(.1, 1.4, .1, x, y0(x, z), z, wood(), { rotY: rot }); const m = new THREE.Mesh(new THREE.CylinderGeometry(.55, .55, .12, 20), new THREE.MeshStandardMaterial({ map: targetTex(), roughness: .9 })); m.rotation.set(Math.PI / 2, 0, 0); m.rotation.y = rot; m.position.set(x, y0(x, z) + 1.5, z); m.castShadow = true; E.scene.add(m); },
    bench(x, z, rot = 0) { ctx.placeModel('painted_wooden_bench', x, z, { rot: rot + Math.PI / 2, s: 1.1 }); },
    /** Petit marché : étals, caisses, tonneaux et sacs autour d'une place. */
    /** Feu de camp en vrai modèle (cercle de pierres) + flammes. */
    firepit(x, z, s = 1) { ctx.placeModel('stone_fire_pit', x, z, { s: s * 1.3 }); ctx.fire(x, y0(x, z) + .25, z, .7 * s, { intensity: 24 }); },
    chest(x, z, rot = 0) { ctx.placeModel('treasure_chest', x, z, { rot, s: .9 }); },
    table(x, z, rot = 0) { ctx.placeModel('WoodenTable_01', x, z, { rot }); ctx.placeModel('wooden_stool_01', x + 1.1, z + .3); ctx.placeModel('wooden_stool_01', x - 1.1, z - .2); },
    shield(x, y, z, rot = 0) { ctx.placeModel('kite_shield', x, z, { y, rot }); },
    market(x, z, r = 9, n = 6, cloths = ['#8b0000', '#c9a227', '#2f6b70', '#5a3a6e', '#4f7a3a']) {
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; P.stall(x + Math.cos(a) * r, z + Math.sin(a) * r, -a + Math.PI / 2, cloths[i % cloths.length]); }
      for (let i = 0; i < n * 2; i++) { const a = (i + .5) / (n * 2) * Math.PI * 2, rr = r + 2.4; (i % 3 ? P.crate : P.barrel)(x + Math.cos(a) * rr, z + Math.sin(a) * rr, .8 + ctx.rand() * .3, a); }
      P.well(x, z);
    },
    /** Flaques : plans sombres très lisses (reflètent le ciel et les torches) le long d'une rue boueuse. */
    puddles(x0, z0, x1, z1, n = 20) {
      const m = ctx.mat(null, { color: '#1c1a18', rough: .05, metal: .6 });
      for (let i = 0; i < n; i++) { const x = x0 + ctx.rand() * (x1 - x0), z = z0 + ctx.rand() * (z1 - z0); const pd = ctx.cyl(.6 + ctx.rand() * 1.4, .02, x, y0(x, z) + .03, z, m, { seg: 12, solid: false, cast: false }); pd.scale.z = .5 + ctx.rand() * .6; pd.rotation.y = ctx.rand() * 3; }
    }
  };
  return P;
}
let tt = null;
function targetTex() {
  if (tt) return tt;
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  ['#e8dcc0', '#8b0000', '#e8dcc0', '#8b0000', '#c9a227'].forEach((col, i) => { g.fillStyle = col; g.beginPath(); g.arc(64, 64, 62 - i * 13, 0, 7); g.fill(); });
  tt = new THREE.CanvasTexture(c); tt.colorSpace = THREE.SRGBColorSpace; return tt;
}
