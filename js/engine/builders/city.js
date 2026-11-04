// Villes procédurales : grille irrégulière de parcelles et maisons instanciées (corps, toit, fenêtres).
import * as THREE from 'three';

export function cityBuilders(E, ctx) {
  const { rand } = ctx;
  return {
    cityGrid(o) {
      const lots = [], streets = [], st = o.street ?? 4;
      const xs = [o.x0]; while (xs.at(-1) < o.x1) xs.push(xs.at(-1) + (o.block ?? 16) * (.7 + rand() * .6));
      const zs = [o.z0]; while (zs.at(-1) < o.z1) zs.push(zs.at(-1) + (o.block ?? 16) * (.7 + rand() * .6));
      for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < zs.length - 1; j++) {
        const bx0 = xs[i] + st / 2, bx1 = xs[i + 1] - st / 2, bz0 = zs[j] + st / 2, bz1 = zs[j + 1] - st / 2;
        const nx = rand() < .5 ? 1 : 2, nz = rand() < .6 ? 2 : 1;
        for (let a = 0; a < nx; a++) for (let b = 0; b < nz; b++) {
          if (rand() < (o.empty ?? .08)) continue;
          const w = (bx1 - bx0) / nx, d = (bz1 - bz0) / nz, cx = bx0 + w * (a + .5) + (rand() - .5), cz = bz0 + d * (b + .5) + (rand() - .5);
          if (o.avoid?.(cx, cz, w, d)) continue;
          lots.push({ x: cx, z: cz, w: w * (.78 + rand() * .2), d: d * (.78 + rand() * .2), h: (o.hMin ?? 4) + rand() * ((o.hMax ?? 7) - (o.hMin ?? 4)) });
        }
      }
      for (let i = 0; i < xs.length; i++) streets.push({ x: xs[i], z: (o.z0 + o.z1) / 2, w: st, d: o.z1 - o.z0 });
      for (let j = 0; j < zs.length; j++) streets.push({ x: (o.x0 + o.x1) / 2, z: zs[j], w: o.x1 - o.x0, d: st });
      return { lots, streets };
    },
    houses(lots, o) {
      const n = lots.length; if (!n) return;
      const body = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1).translate(0, .5, 0), o.wall, n);
      const rs = new THREE.Shape(); rs.moveTo(-.5, 0); rs.lineTo(.5, 0); rs.lineTo(0, 1); rs.closePath();
      const roofs = o.flat ? null : new THREE.InstancedMesh(new THREE.ExtrudeGeometry(rs, { depth: 1, bevelEnabled: false }).translate(0, 0, -.5), o.roof, n);
      const wins = o.windows ? new THREE.InstancedMesh(new THREE.BoxGeometry(.7, 1, .12), new THREE.MeshBasicMaterial({ color: o.windows, toneMapped: false, fog: true }), n * 2) : null;
      const doors = new THREE.InstancedMesh(new THREE.BoxGeometry(1.1, 2.1, .14).translate(0, 1.05, 0), ctx.mat('weathered_planks', { uv: 2, color: '#6a4a32' }), n);
      const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3(), C = new THREE.Color(), up = new THREE.Vector3(0, 1, 0);
      let wi = 0;
      lots.forEach((l, i) => {
        const y = l.y ?? E.physics.groundFn(l.x, l.z), sink = o.sink ?? 2;
        Q.setFromAxisAngle(up, l.rot ?? 0);
        body.setMatrixAt(i, M.compose(P.set(l.x, y - sink, l.z), Q, S.set(l.w, l.h + sink, l.d)));
        C.set(o.tints[Math.floor(rand() * o.tints.length)]).offsetHSL(0, 0, (rand() - .5) * .06); body.setColorAt(i, C);
        const face = rand() < .5 ? 1 : -1;
        doors.setMatrixAt(i, M.compose(P.set(l.x + (rand() - .5) * l.w * .4, y, l.z + face * (l.d / 2 + .03)), Q, S.set(1, 1, 1)));
        if (roofs) {
          const along = l.w > l.d, rq = Q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(up, along ? Math.PI / 2 : 0));
          roofs.setMatrixAt(i, M.compose(P.set(l.x, y + l.h, l.z), rq, S.set((along ? l.d : l.w) + .6, (o.roofH ?? .55) * Math.min(l.w, l.d), (along ? l.w : l.d) + .6)));
          roofs.setColorAt(i, C.set(o.roofTints?.[Math.floor(rand() * o.roofTints.length)] ?? '#ffffff'));
        }
        if (wins) for (let k = 0; k < 2; k++) {
          const sx = (rand() - .5) * l.w * .6, f2 = rand() < .5 ? 1 : -1;
          wins.setMatrixAt(wi++, M.compose(P.set(l.x + sx, y + 1.6 + (k ? Math.min(2.6, l.h - 2.6) : 0), l.z + f2 * (l.d / 2 + .02)), Q, S.set(1, 1.1, 1)));
        }
        ctx.collider(l.x - l.w / 2, y - sink, l.z - l.d / 2, l.x + l.w / 2, y + l.h + 1, l.z + l.d / 2);
      });
      if (wins) { wins.count = wi; E.scene.add(wins); E.windows = wins; }
      for (const m of [body, roofs, doors].filter(Boolean)) { m.castShadow = m.receiveShadow = true; E.scene.add(m); }
      return { body, roofs };
    }
  };
}
