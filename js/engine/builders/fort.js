// Fortifications : remparts avec merlons, enceintes complètes, tours, escaliers praticables.
import * as THREE from 'three';

export function fortBuilders(E, ctx) {
  return {
    wall(x1, z1, x2, z2, o = {}) {
      const h = o.h ?? 8, t = o.t ?? 3, m = o.mat, len = Math.hypot(x2 - x1, z2 - z1), ang = Math.atan2(x2 - x1, z2 - z1);
      const mx = (x1 + x2) / 2, mz = (z1 + z2) / 2, y = o.y ?? 0, uv = m.userData.uv ?? 4;
      const wall = ctx.place(new THREE.Mesh(ctx.boxGeo(t, h, len, uv), m), mx, y + h / 2, mz, { rotY: ang, solid: false });
      const n = Math.max(1, Math.ceil(len / (t * .8)));
      const axis = Math.abs(Math.sin(ang)) < 1e-3 || Math.abs(Math.cos(ang)) < 1e-3;
      if (axis) ctx.colliderFrom(wall);
      else for (let i = 0; i < n; i++) { const u = (i + .5) / n, cx = x1 + (x2 - x1) * u, cz = z1 + (z2 - z1) * u, r = t / 2; ctx.collider(cx - r, y, cz - r, cx + r, y + h, cz + r); }
      if (o.crenel === false) return wall;
      const nx = Math.cos(ang), nz = -Math.sin(ang), cnt = Math.floor(len / 2.2);
      const side = o.outward ? Math.sign(nx * o.outward[0] + nz * o.outward[1]) || 1 : (o.side ?? 1);
      for (const sd of o.both ? [1, -1] : [side]) for (let i = 0; i < cnt; i++) {
        const u = (i + .5) / cnt - .5, cx = mx + Math.sin(ang) * u * len + nx * sd * (t / 2 - .3), cz = mz + Math.cos(ang) * u * len + nz * sd * (t / 2 - .3);
        ctx.place(new THREE.Mesh(ctx.boxGeo(.6, 1.2, 1.2, uv), m), cx, y + h + .6, cz, { rotY: ang, solid: axis });
      }
      if (!axis) for (const sd of o.both ? [1, -1] : [side]) for (let i = 0; i < n; i++) {
        const u = (i + .5) / n, cx = x1 + (x2 - x1) * u + nx * sd * (t / 2 - .3), cz = z1 + (z2 - z1) * u + nz * sd * (t / 2 - .3);
        ctx.collider(cx - .3, y + h, cz - .3, cx + .3, y + h + 1.2, cz + .3, { noMap: true });
      }
      return wall;
    },
    /** Enceinte rectangulaire : murs + tours d'angle + porte (gate: 'N'|'S'|'E'|'O'). */
    ring(x0, z0, x1, z1, o = {}) {
      const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, gw = (o.gateW ?? 8) / 2;
      const sides = { N: [[x0, z0], [x1, z0]], E: [[x1, z0], [x1, z1]], S: [[x1, z1], [x0, z1]], O: [[x0, z1], [x0, z0]] };
      for (const [k, [[ax, az], [bx, bz]]] of Object.entries(sides)) {
        const wo = { ...o, outward: [ax + bx - 2 * cx, az + bz - 2 * cz] };
        if (o.gate !== k) { ctx.wall(ax, az, bx, bz, wo); continue; }
        const mx = (ax + bx) / 2, mz = (az + bz) / 2, ux = Math.sign(bx - ax), uz = Math.sign(bz - az);
        ctx.wall(ax, az, mx - ux * gw, mz - uz * gw, wo); ctx.wall(mx + ux * gw, mz + uz * gw, bx, bz, wo);
        for (const sg of [-1, 1]) ctx.tower(mx + ux * sg * (gw + 2.5), mz + uz * sg * (gw + 2.5), { w: 6, h: (o.h ?? 8) + 4, y: o.y, mat: o.mat, roof: o.towerRoof, round: o.round });
        if (o.arch !== false) ctx.box(Math.abs(ux) * gw * 2 + Math.abs(uz) * (o.t ?? 3), 2.5, Math.abs(uz) * gw * 2 + Math.abs(ux) * (o.t ?? 3), mx, (o.y ?? 0) + (o.h ?? 8) - 2.5, mz, o.mat, { solid: false });
      }
      for (const [x, z] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]) ctx.tower(x, z, { w: o.towerW ?? 8, h: (o.h ?? 8) + (o.towerExtra ?? 6), y: o.y, mat: o.mat, roof: o.towerRoof, round: o.round });
    },
    tower(x, z, o = {}) {
      const w = o.w ?? 7, h = o.h ?? 16, m = o.mat, y = o.y ?? 0;
      if (o.round) ctx.cyl(w / 2, h, x, y, z, m, { seg: 20 }); else ctx.box(w, h, w, x, y, z, m);
      if (o.roof) ctx.cone(w * (o.round ? .62 : .78), o.roofH ?? w * 1.1, x, y + h, z, o.roof, { seg: o.round ? 20 : 4, rotY: o.round ? 0 : Math.PI / 4 });
      else for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, r = w / 2 - .3; ctx.box(.8, 1.2, .8, x + Math.cos(a) * r, y + h, z + Math.sin(a) * r, m, { solid: false }); }
      return { x, z, top: y + h };
    },
    /** Escalier : n marches vers 'N' | 'S' | 'E' | 'O'. Renvoie le palier d'arrivée. */
    stairs(x, y, z, o = {}) {
      const n = o.n ?? 10, rise = o.rise ?? .3, run = o.run ?? .45, w = o.w ?? 2.4, dir = { N: [0, -1], S: [0, 1], E: [1, 0], O: [-1, 0] }[o.dir ?? 'N'];
      for (let i = 0; i < n; i++) ctx.box(dir[0] ? run : w, (i + 1) * rise, dir[0] ? w : run, x + dir[0] * (i + .5) * run, y, z + dir[1] * (i + .5) * run, o.mat, { cast: false });
      return { x: x + dir[0] * n * run, y: y + n * rise, z: z + dir[1] * n * run };
    }
  };
}
