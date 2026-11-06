// Navigation : barques posées au bord de l'eau et navires des ports, pilotables.
// E pour monter / débarquer ; Z/W avancer, S reculer, Q/A et D tourner, Maj pour souquer ferme.
// Les bateaux restent sur l'eau assez profonde et s'arrêtent contre les quais, les murs et la rive.
import * as THREE from 'three';
import { rowboatMesh } from '../engine/builders/rowboat.js';

const KIND = {
  barque: { name: 'la barque', max: 5.2, boost: 7.6, acc: 2.6, turn: 1.35, draft: .45, seat: [0, .05, -.55], probe: 2.1, reach: 3.2, land: 4.5 },
  navire: { name: 'le navire', max: 10, boost: 13, acc: 1.4, turn: .42, draft: 1.3, seat: [0, 2.2, -2.3], probe: 7.4, reach: 9, land: 12 },
};

export class Boats {
  constructor(G) {
    this.G = G; this.list = []; this.active = null; this.t = 0;
    const E = G.env, waters = E.waters ?? [];
    if (!waters.length) return;
    E.scene.traverse(o => { if (o.userData.drivable === 'navire') this.list.push(this.wrap(o, 'navire')); });
    for (const [x, z, yaw] of this.shoreSpots(G.player.pos, 3)) { const o = rowboatMesh(); E.scene.add(o); o.position.set(x, this.waterY(x, z) - .1, z); o.rotation.y = yaw; this.list.push(this.wrap(o, 'barque')); }
  }
  wrap(obj, kind) { return { obj, kind, ...KIND[kind], yaw: obj.rotation.y, speed: 0, y0: obj.position.y - (this.waterY(obj.position.x, obj.position.z) ?? 0), pos: obj.position }; }
  waterY(x, z) { for (const w of this.G.env.waters) if (x > w.x0 && x < w.x1 && z > w.z0 && z < w.z1) return w.y; return null; }
  /** Eau assez profonde, sans quai ni mur. */
  navigable(x, z, draft) { const y = this.waterY(x, z), P = this.G.physics; return y !== null && P.groundFn(x, z) < y - draft && !P.solidAt(x, y + .7, z); }
  land(x, z) { const P = this.G.physics, w = this.waterY(x, z) ?? -99, y = P.groundAt(x, z, w + 8); return y > w + .15 && !P.solidAt(x, y + 1, z) ? y : null; }
  /** Points d'eau près de la rive (pour poser les barques), éloignés les uns des autres, proches du joueur. */
  shoreSpots(c, n) {
    const out = [];
    for (let r = 6; r < 160 && out.length < n; r += 4) for (let a = 0; a < Math.PI * 2 && out.length < n; a += 4 / r) {
      const x = c.x + Math.cos(a) * r, z = c.z + Math.sin(a) * r;
      if (!this.navigable(x, z, .6) || out.some(o => Math.hypot(o[0] - x, o[1] - z) < 30)) continue;
      for (let b = 0; b < 6.28; b += .52) {
        const lx = x + Math.cos(b) * 3.2, lz = z + Math.sin(b) * 3.2; if (this.land(lx, lz) === null) continue;
        const yaw = Math.atan2(x - lx, z - lz), clear = [4, 8, 12].every(d => this.navigable(x + Math.sin(yaw) * d, z + Math.cos(yaw) * d, .6));
        if (clear) { out.push([x, z, yaw]); break; }
      }
    }
    return out;
  }
  nearest(p) { let best = null, bd = 1e9; for (const b of this.list) { if (b === this.active) continue; const d = Math.hypot(b.pos.x - p.x, b.pos.z - p.z); if (d < b.reach && d < bd) { best = b; bd = d; } } return best && { b: best, d: bd }; }
  shore() { const b = this.active; for (let r = 1.5; r <= b.land; r += 1) for (let a = 0; a < 6.28; a += .3) { const x = b.pos.x + Math.cos(a) * r, z = b.pos.z + Math.sin(a) * r, y = this.land(x, z); if (y !== null) return { x, y, z }; } return null; }
  board(b) {
    const A = this.G.player; this.from = { x: A.pos.x, y: A.pos.y, z: A.pos.z };
    if (this.active) this.active.speed = 0;
    if (b.kind === 'navire' && !b.freed) { b.freed = true; for (const c of this.G.physics.near(b.pos.x - 3, b.pos.z - 9, b.pos.x + 3, b.pos.z + 9)) if (!c.dynamic && c.maxY <= 4.5 && c.minY >= -1.5 && Math.abs((c.minX + c.maxX) / 2 - b.pos.x) < 1 && Math.abs((c.minZ + c.maxZ) / 2 - b.pos.z) < 1) c.maxY = c.minY = -999; }
    this.active = b; A.boating = b.kind; this.G.rig.want = b.kind === 'navire' ? 14 : 6;
    this.G.ui.toast(`Vous prenez ${b.name}. Z/W avancer · S reculer · Q/A et D tourner · Maj souquer · E débarquer près du rivage.`, 'info');
  }
  leave() {
    const s = this.shore(), A = this.G.player; if (!s) return this.G.ui.toast('Trop loin du rivage : approchez-vous d’une berge ou d’un quai pour débarquer.', 'info');
    this.active.speed = 0; this.active = null; A.boating = null; Object.assign(A.pos, s); A.vy = 0; this.G.rig.want = 4;
  }
  /** Position à sauvegarder : la terre ferme la plus proche, jamais le milieu du lac. */
  safePos() { return this.active ? this.shore() ?? this.from : null; }
  drive(dt) {
    const b = this.active, I = this.G.input, A = this.G.player; this.t += dt;
    const fwd = (I.down('KeyW', 'ArrowUp') ? 1 : 0) - (I.down('KeyS', 'ArrowDown') ? 1 : 0), turn = (I.down('KeyA', 'ArrowLeft') ? 1 : 0) - (I.down('KeyD', 'ArrowRight') ? 1 : 0);
    const max = I.down('ShiftLeft', 'ShiftRight') ? b.boost : b.max;
    b.speed += (fwd * b.acc - b.speed * (fwd ? .35 : .6)) * dt; b.speed = THREE.MathUtils.clamp(b.speed, -max * .4, max);
    b.yaw += turn * b.turn * dt * THREE.MathUtils.clamp(Math.abs(b.speed) / 2 + .5, .5, 1) * (b.speed < -.1 ? -1 : 1);
    const sx = Math.sin(b.yaw), sz = Math.cos(b.yaw), nx = b.pos.x + sx * b.speed * dt, nz = b.pos.z + sz * b.speed * dt, dir = Math.sign(b.speed) || 1;
    if (this.navigable(nx + sx * b.probe * dir, nz + sz * b.probe * dir, b.draft) && this.navigable(nx, nz, b.draft)) { b.pos.x = nx; b.pos.z = nz; }
    else { if (Math.abs(b.speed) > 2 && this.t - (this.warned ?? -9) > 4) { this.warned = this.t; this.G.ui.toast(b.kind === 'barque' ? 'La barque touche le fond ou le quai : tournez (Q/A, D).' : 'Le navire ne peut pas aller plus loin : virez de bord.', 'info'); } b.speed = 0; }
    const wy = this.waterY(b.pos.x, b.pos.z) ?? 0;
    b.pos.y = wy + b.y0 + Math.sin(this.t * 1.6) * (b.kind === 'barque' ? .05 : .1);
    b.obj.rotation.set(Math.sin(this.t * 1.1) * .02 - b.speed * .004, b.yaw, Math.sin(this.t * 1.3) * (b.kind === 'barque' ? .03 : .025) + turn * b.speed * .006);
    b.obj.updateMatrixWorld(); const seat = new THREE.Vector3(...b.seat).applyMatrix4(b.obj.matrixWorld);
    A.pos.x = seat.x; A.pos.y = seat.y; A.pos.z = seat.z; A.yaw = b.yaw; A.speed = b.kind === 'barque' ? Math.abs(b.speed) : 0; A.vy = 0; A.onGround = true;
    for (const [i, o] of (b.obj.userData.oars ?? []).entries()) { const ph = this.t * (1.5 + Math.abs(b.speed) * .5); o.rotation.y = (i ? -1 : 1) * Math.sin(ph) * .5 * Math.min(1, Math.abs(b.speed) + .15); o.rotation.z = (i ? -1 : 1) * Math.cos(ph) * .12; }
  }
}
