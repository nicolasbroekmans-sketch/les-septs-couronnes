// Générateur de maisons variées (toujours instancié : quelques appels de dessin pour des centaines de maisons).
// Par maison : rez-de-chaussée (pierre, brique, bois ou crépi), étage optionnel en encorbellement avec colombages,
// toit à deux pans (chaume, ardoise, tuiles ; pente variable) ou toit plat à parapet, cheminée, fenêtres éclairées,
// volets, porte, auvent de toile, balcon. Les choix dépendent du style régional (houseStyles.js).
import * as THREE from 'three';
import { STYLES } from './houseStyles.js';

export function styledHouses(E, ctx, lots, styleName, o = {}) {
  const S = STYLES[styleName] ?? STYLES.nord, { rand } = ctx, parts = new Map(), M = new THREE.Matrix4(), Q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
  const put = (key, make, pos, quat, scale, color) => { if (!parts.has(key)) parts.set(key, { make, list: [] }); parts.get(key).list.push([pos.clone(), quat.clone(), scale.clone(), color]); };
  const V = (x, y, z) => new THREE.Vector3(x, y, z), C = c => new THREE.Color(c);
  const box = () => new THREE.BoxGeometry(1, 1, 1).translate(0, .5, 0);
  const rs = new THREE.Shape(); rs.moveTo(-.5, 0); rs.lineTo(.5, 0); rs.lineTo(0, 1); rs.closePath();
  const roofGeo = () => { const g = new THREE.ExtrudeGeometry(rs, { depth: 1, bevelEnabled: false }).translate(0, 0, -.5); const a = g.attributes.uv; for (let i = 0; i < a.count; i++) a.setXY(i, a.getX(i) * .25, a.getY(i) * .25); return g; };
  const tex = ([t, c], uv = 3) => ctx.mat(t, { uv, instanced: true, color: '#ffffff' });
  const tint = (c, v = .06) => C(c).offsetHSL(0, 0, (rand() - .5) * v);
  for (const l of lots) {
    const y = l.y ?? E.physics.groundFn(l.x, l.z), sink = o.sink ?? 2, rot = l.rot ?? 0; Q.setFromAxisAngle(up, rot);
    const at = (lx, ly, lz) => V(lx, ly, lz).applyQuaternion(Q).add(V(l.x, y, l.z));
    const bi = Math.floor(rand() * S.base.length), base = S.base[bi], two = !!S.upper && l.h >= 5 && rand() < S.upper2, g = two ? Math.min(l.h - 2.4, 3 + rand() * .8) : l.h, u = l.h - g;
    put('base' + bi, () => [box(), tex(base)], at(0, -sink, 0), Q, V(l.w, g + sink, l.d), tint(base[1]));
    ctx.collider(l.x - l.w / 2, y - sink, l.z - l.d / 2, l.x + l.w / 2, y + l.h + 1, l.z + l.d / 2);
    const face = rand() < .5 ? 1 : -1, J = two ? .35 : 0, W = l.w + 2 * J, D = l.d + 2 * J;
    if (two) {
      const ui = Math.floor(rand() * S.upper.length), upm = S.upper[ui];
      put('upper' + ui, () => [box(), tex(upm)], at(0, g, 0), Q, V(W, u, D), tint(upm[1]));
      if (S.beams && upm[0] !== 'medieval_wood') {
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) put('beam', () => [box(), ctx.mat(null, { color: S.beams })], at(sx * (W / 2 + .02), g, sz * (D / 2 + .02)), Q, V(.22, u, .22));
        for (const sz of [-1, 1]) for (const yy of [g, g + u - .2]) put('beam', null, at(0, yy, sz * (D / 2 + .05)), Q, V(W, .2, .12));
        for (const sz of [-1, 1]) put('beam', null, at(0, g, sz * (D / 2 + .05)), Q, V(.18, u, .12));
      }
    }
    const top = y + l.h;
    if (S.flat) {
      for (const [px, pz, pw, pd] of [[0, D / 2, W, .3], [0, -D / 2, W, .3], [W / 2, 0, .3, D], [-W / 2, 0, .3, D]]) put('parapet' + bi, () => [box(), tex(base)], at(px, l.h, pz), Q, V(pw, .7, pd), tint(base[1]));
      if (rand() < .3) put('base' + bi, null, at(W / 4, l.h, -D / 4), Q, V(2, 2, 2), tint(base[1]));
    } else {
      const ri = Math.floor(rand() * S.roof.length), rf = S.roof[ri], along = l.w > l.d, rq = Q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(up, along ? Math.PI / 2 : 0));
      const k = S.roofH[0] + rand() * (S.roofH[1] - S.roofH[0]), span = (along ? D : W) + .7, len = (along ? W : D) + .7;
      put('roof' + ri, () => [roofGeo(), ctx.mat(rf[0], { uv: 3, color: '#ffffff' })], at(0, l.h, 0), rq, V(span, k * span, len), tint(rf[1], .1));
      if (rand() < S.chimney) { const cx = (rand() - .5) * W * .5, cz = (rand() - .5) * D * .4; (E.chimneys ??= []).push(at(cx, l.h + k * span * 1.1 + 1, cz)); put('chimney', () => [box(), ctx.mat('old_stone_wall', { uv: 2, instanced: true, color: '#9a948c' })], at(cx, l.h + k * span * .35, cz), Q, V(.7, k * span * .75 + .9, .7)); }
    }
    // fenêtres (vitre sombre et chaude), volets, porte, auvent, balcon
    const glass = () => [new THREE.BoxGeometry(.7, 1, .1), ctx.mat(null, { color: '#2a2018', emissive: '#ff9a3a', ei: .5, rough: .3 })];
    const nW = Math.max(1, Math.floor(l.w / 2.6));
    for (const sz of [-1, 1]) for (let i = 0; i < nW; i++) {
      const wx = (i - (nW - 1) / 2) * 2.4; if (sz === face && Math.abs(wx) < 1) continue;
      put('glass', glass, at(wx, 1.55, sz * (l.d / 2 + .04)), Q, V(1, 1.1, 1));
      if (two) { put('glass', null, at(wx, g + u * .45, sz * (D / 2 + .04)), Q, V(1, 1.1, 1)); if (S.shutters) for (const e of [-1, 1]) put('shutter', () => [new THREE.BoxGeometry(.38, 1.1, .06), ctx.mat('medieval_wood', { uv: 1, color: S.shutters })], at(wx + e * .58, g + u * .45, sz * (D / 2 + .08)), Q, V(1, 1, 1)); }
    }
    put('door', () => [new THREE.BoxGeometry(1.1, 2.1, .14).translate(0, 1.05, 0), ctx.mat('medieval_wood', { uv: 2, color: '#6a4a32' })], at((rand() - .5) * l.w * .3, 0, face * (l.d / 2 + .04)), Q, V(1, 1, 1));
    if (rand() < S.awning) put('awning', () => [new THREE.BoxGeometry(1, .08, 1), ctx.mat(null, { color: '#ffffff', rough: 1 })], at(0, 2.6, face * (l.d / 2 + .7)), Q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), face * .35)), V(Math.min(3.4, l.w * .7), 1, 1.5), C((S.awnings ?? ['#8b0000', '#c9a227', '#3a5a7a', '#5a6a3a'])[Math.floor(rand() * 4) % (S.awnings?.length ?? 4)]));
    if (two && rand() < (S.balcony ?? 0)) { put('balcony', () => [box(), ctx.mat('medieval_wood', { uv: 2, instanced: true, color: '#7a5a3a' })], at(0, g - .1, face * (D / 2 + .6)), Q, V(Math.min(4, W * .6), .15, 1.2)); put('balcony', null, at(0, g, face * (D / 2 + 1.15)), Q, V(Math.min(4, W * .6), .9, .08)); }
  }
  // fumées : quelques cheminées choisies au hasard (coût limité)
  for (const c of (E.chimneys ?? []).splice(0).sort(() => rand() - .5).slice(0, { low: 4, medium: 9, high: 16 }[E.quality] ?? 9)) ctx.emitter('smoke', c.x, c.y, c.z, { count: 26, opacity: .16, box: [3, 16, 3] });
  for (const [key, p] of parts) {
    const [geo, mat] = p.make();
    const m = new THREE.InstancedMesh(geo, mat, p.list.length), c = new THREE.Color();
    p.list.forEach(([pos, q, s, col], i) => { m.setMatrixAt(i, M.compose(pos, q, s)); if (col) m.setColorAt(i, col); });
    m.castShadow = key !== 'glass'; m.receiveShadow = true; E.scene.add(m); if (key === 'glass') E.windows = m;
  }
}
