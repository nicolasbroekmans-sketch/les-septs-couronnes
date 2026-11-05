// Cerveau de soldat : perception simplifiée (ennemi le plus proche, sans lancer de rayon), ordres du
// commandement (charger, tenir, suivre), puis mêmes décisions tactiques que les PNJ (réseau neuronal).
import { NPCBrain } from './NPCBrain.js';

export class SoldierBrain extends NPCBrain {
  constructor(actor, battle) { super(actor, { aggression: .55 + Math.random() * .35, morale: .7, sight: 200 }); this.battle = battle; this.state = 'routine'; }
  get order() { return this.actor.team === 'A' ? this.battle.order : 'charge'; }
  perceive(W) {
    const a = this.actor; if (this.battle.ended) return;
    if (this.target?.alive && !this.target.surrendered && this.state === 'combat' && Math.hypot(this.target.pos.x - a.pos.x, this.target.pos.z - a.pos.z) < 6) return;
    const range = this.order === 'charge' && this.battle.started ? 500 : 14;
    let best = null, bd = range;
    for (const o of W.actors) {
      if (o === a || !o.alive || o.surrendered || !W.hostile(a, o)) continue;
      const d = Math.hypot(o.pos.x - a.pos.x, o.pos.z - a.pos.z) * (o.kind === 'player' ? .9 : 1);
      if (d < bd) { bd = d; best = o; }
    }
    if (best) { this.target = best; this.state = 'combat'; } else if (this.state === 'combat') { this.state = 'routine'; this.target = null; this.actor.fighter.block(false); }
  }
  startFlee(W) {
    const a = this.actor; if (this.battle.routed[a.team] || a.fighter.hp / a.fighter.maxHp < .25) { this.state = 'flee'; this.fleeT = 0; return { x: 0, z: 0 }; }
    this.action = 'retreat'; return { x: 0, z: 0 };
  }
  flee(dt, W) {
    const a = this.actor, dir = a.team === 'A' ? 1 : -1; this.fleeT += dt;
    if (this.fleeT > 12) { this.battle.escaped(a); return { x: 0, z: 0 }; }
    a.turnTo(dir > 0 ? Math.PI : 0, dt, 6);
    return { x: 0, z: dir * 6 };
  }
  routine(dt, W) {
    const a = this.actor, b = this.battle;
    if (b.routed[a.team]) { this.state = 'flee'; this.fleeT = 0; return { x: 0, z: 0 }; }
    let goal = this.slot;
    if (this.order === 'follow' && W.player) goal = { x: W.player.pos.x + this.offset.x, z: W.player.pos.z + this.offset.z };
    if (this.order === 'charge' && b.started) goal = { x: a.pos.x, z: a.pos.z + (a.team === 'A' ? -20 : 20) };
    const dx = goal.x - a.pos.x, dz = goal.z - a.pos.z, d = Math.hypot(dx, dz);
    if (d < 1.2) { a.turnTo(a.team === 'A' ? 0 : Math.PI, dt, 3); return { x: 0, z: 0 }; }
    const sp = Math.min(d, this.order === 'charge' ? 4.4 : 3.6);
    a.turnTo(Math.atan2(-dx, -dz), dt, 6);
    return { x: dx / d * sp, z: dz / d * sp };
  }
}
