// Exécution des décisions tactiques (choisies par le réseau neuronal toutes les ~0,3 s).
import { features } from './Tactics.js';
import { dist, angleTo } from '../combat/CombatSystem.js';

export function combatFeatures(b, W) {
  const a = b.actor, t = b.target, f = a.fighter, d = dist(a.pos, t.pos);
  let allies = 0, enemies = 0;
  for (const o of W.actors) {
    if (o === a || !o.alive || o.surrendered || dist(o.pos, a.pos) > 14) continue;
    if (W.hostile(o, a)) enemies++; else if (o.brain?.state === 'combat') allies++;
  }
  return features({ distance: d, reach: f.weapon.reach, hp: f.hp / f.maxHp, stamina: f.stamina / f.maxStamina, targetHp: t.fighter.hp / t.fighter.maxHp,
    allies, enemies, threat: t.fighter.attacking && d < t.fighter.weapon.reach + 1.2 && angleTo(t.pos, t.yaw, a.pos) < 1, ranged: !!f.weapon.ranged,
    morale: b.morale, aggression: b.aggression, targetBlocking: t.fighter.blocking });
}

/** Applique l'action courante. Renvoie la vitesse souhaitée {x,z} en m/s. */
export function act(b, W, dt) {
  const a = b.actor, t = b.target, f = a.fighter, d = dist(a.pos, t.pos), reach = f.weapon.reach, ranged = !!f.weapon.ranged;
  const toT = { x: (t.pos.x - a.pos.x) / (d || 1), z: (t.pos.z - a.pos.z) / (d || 1) }, run = 4.6 * (a.stats.moveSpeed ?? 1);
  a.faceTo(t.pos, dt, 8);
  f.block(b.action === 'defend' && b.actionT < .7);
  switch (b.action) {
    case 'attack': {
      if (ranged) {
        const sees = W.physics.sees(a.eye, t.eye);
        if (d > 22 || !sees) { const dir = b.steer.dir(a, t.pos, W, dt, 4); return dir ? { x: dir.x * run, z: dir.z * run } : { x: 0, z: 0 }; }
        if (!f.busy && angleTo(a.pos, a.yaw, t.pos) < .2) f.attack(false);
        return { x: -toT.z * 1.2 * b.strafe, z: toT.x * 1.2 * b.strafe };
      }
      if (d > reach - .25) { const dir = b.steer.dir(a, t.pos, W, dt, reach - .4); return dir ? { x: dir.x * run * (d > 6 ? 1.35 : 1), z: dir.z * run * (d > 6 ? 1.35 : 1) } : { x: 0, z: 0 }; }
      if (!f.busy && angleTo(a.pos, a.yaw, t.pos) < .5) f.attack(t.fighter.blocking ? W.rng() < .7 : W.rng() < .2);
      return { x: -toT.z * .6 * b.strafe, z: toT.x * .6 * b.strafe };
    }
    case 'retreat': return { x: -toT.x * run * .7 - toT.z * .8 * b.strafe, z: -toT.z * run * .7 + toT.x * .8 * b.strafe };
    case 'dodge': if (b.actionT < .05) { f.dodge(); b.dodgeDir = W.rng() < .5 ? 1 : -1; } return f.state === 'dodge' ? { x: (-toT.x * .6 - toT.z * b.dodgeDir) * 6, z: (-toT.z * .6 + toT.x * b.dodgeDir) * 6 } : { x: 0, z: 0 };
    case 'defend': return { x: -toT.z * .8 * b.strafe, z: toT.x * .8 * b.strafe };
    case 'flee': return { x: -toT.x * run * 1.3, z: -toT.z * run * 1.3 };
    case 'call': if (b.callCd <= 0) { b.callCd = 10; W.alertAllies(a, t); } b.action = 'attack'; return { x: 0, z: 0 };
    case 'switch': { const o = W.actors.find(x => x !== t && x.alive && !x.surrendered && W.hostile(a, x) && dist(x.pos, a.pos) < 12); if (o) b.target = o; b.action = 'attack'; return { x: 0, z: 0 }; }
    default: return { x: 0, z: 0 };
  }
}
