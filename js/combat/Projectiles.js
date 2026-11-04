// Flèches et carreaux : balistique simple, collision avec les combattants et le décor.
import { computeDamage } from './DamageSystem.js';
import { angleTo } from './CombatSystem.js';

export class Projectiles {
  constructor() { this.list = []; }
  /** dir : vecteur unitaire {x,y,z} */
  fire(owner, from, dir, heavy = false) {
    const s = owner.fighter.weapon.ranged.speed * (heavy ? 1.2 : 1);
    const p = { owner, heavy, pos: { ...from }, vel: { x: dir.x * s, y: dir.y * s, z: dir.z * s }, age: 0, stuck: false };
    this.list.push(p);
    return p;
  }
  /** groundAt(x,z) et solidAt(x,y,z) viennent de la physique ; renvoie les impacts. */
  update(dt, entities, { groundAt, solidAt }, rng = Math.random) {
    const hits = [];
    for (const p of this.list) {
      p.age += dt;
      if (p.stuck) continue;
      const steps = 4;
      for (let i = 0; i < steps && !p.stuck; i++) {
        p.vel.y -= 9.8 * dt / steps;
        p.pos.x += p.vel.x * dt / steps; p.pos.y += p.vel.y * dt / steps; p.pos.z += p.vel.z * dt / steps;
        if (p.pos.y <= groundAt(p.pos.x, p.pos.z) || solidAt(p.pos.x, p.pos.y, p.pos.z)) { p.stuck = true; break; }
        for (const t of entities) {
          if (t === p.owner || !t.fighter.alive || !p.owner.hostileTo(t)) continue;
          const dy = p.pos.y - t.pos.y;
          if (dy < 0 || dy > 1.85 || Math.hypot(p.pos.x - t.pos.x, p.pos.z - t.pos.z) > (t.radius ?? .4) + .1) continue;
          p.stuck = true; p.hit = t;
          if (t.fighter.invulnerable) break;
          const facing = angleTo(t.pos, t.yaw, p.owner.pos) < 1.2;
          const res = computeDamage({ weapon: p.owner.fighter.weapon, stats: p.owner.stats, heavy: p.heavy },
            { stats: t.stats, blocking: t.fighter.blocking, parrying: false, facing }, rng);
          hits.push({ attacker: p.owner, target: t, res, killed: t.fighter.takeHit(res), projectile: p });
          break;
        }
      }
    }
    this.list = this.list.filter(p => p.age < (p.stuck ? 8 : 6));
    return hits;
  }
}
