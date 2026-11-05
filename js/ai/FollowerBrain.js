// Compagnon : suit le héros en formation lâche, défend le héros (attaque ce qui l'attaque ou ce qui est hostile
// et proche), puis reprend sa place. Les décisions de combat sont celles du réseau tactique partagé.
import { NPCBrain } from './NPCBrain.js';

export class FollowerBrain extends NPCBrain {
  constructor(actor, slot) { super(actor, { aggression: .7, morale: .85, sight: 18, noFlee: true }); this.slot = slot; }
  perceive(W) {
    const a = this.actor, P = W.player; if (!P) return;
    if (this.state === 'combat' && this.target?.alive && !this.target.surrendered && W.hostile(a, this.target) && Math.hypot(this.target.pos.x - P.pos.x, this.target.pos.z - P.pos.z) < 30) return;
    let best = null, bd = 16;
    for (const o of W.actors) {
      if (o === a || !o.alive || o.surrendered || !W.hostile(a, o)) continue;
      const engaged = o.brain?.state === 'combat', d = Math.hypot(o.pos.x - P.pos.x, o.pos.z - P.pos.z);
      if ((engaged || o.provoked) && d < bd) { bd = d; best = o; }
    }
    if (best) this.engage(best, W);
    else if (this.state === 'combat') { this.state = 'routine'; this.target = null; a.fighter.block(false); }
  }
  routine(dt, W) {
    const a = this.actor, P = W.player; if (!P) return { x: 0, z: 0 };
    const c = Math.cos(P.yaw), s = Math.sin(P.yaw), ox = this.slot.x, oz = this.slot.z;
    const goal = { x: P.pos.x + ox * c + oz * s, z: P.pos.z - ox * s + oz * c }, d = Math.hypot(goal.x - a.pos.x, goal.z - a.pos.z);
    if (d < 1.5) { a.turnTo(P.yaw, dt, 3); return { x: 0, z: 0 }; }
    const dir = this.steer.dir(a, goal, W, dt, .8); if (!dir) return { x: 0, z: 0 };
    const sp = d > 8 ? 5.5 : d > 3 ? 3.4 : 1.8;
    a.turnTo(Math.atan2(-dir.x, -dir.z), dt, 6);
    return { x: dir.x * sp, z: dir.z * sp };
  }
}
