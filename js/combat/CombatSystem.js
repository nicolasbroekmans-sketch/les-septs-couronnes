// Résolution spatiale des coups : portée, arc d'attaque, orientation du défenseur, attaques multiples.
// Convention : yaw = 0 regarde vers −Z ; avant = (−sin yaw, −cos yaw).
import { computeDamage } from './DamageSystem.js';

export const forward = yaw => ({ x: -Math.sin(yaw), z: -Math.cos(yaw) });
export function angleTo(from, yaw, to) {
  const f = forward(yaw), dx = to.x - from.x, dz = to.z - from.z, l = Math.hypot(dx, dz) || 1;
  return Math.acos(Math.max(-1, Math.min(1, (f.x * dx + f.z * dz) / l)));
}
export const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

/**
 * Pendant la fenêtre « active » d'un attaquant au corps à corps, touche les cibles hostiles dans l'arc.
 * entities : [{ id, pos:{x,z}, yaw, fighter, stats, radius, hostileTo(other) }]
 * Renvoie la liste des impacts { attacker, target, res, killed }.
 */
export function resolveMelee(att, entities, rng = Math.random, opts = {}) {
  const f = att.fighter, hits = [];
  if (f.state !== 'active' || f.weapon.ranged) return hits;
  const arc = f.heavy ? 1.1 : 1.3, reach = f.weapon.reach;
  const targets = entities.filter(t => t !== att && t.fighter.alive && !f.hitIds.has(t.id) && att.hostileTo(t)
    && dist(att.pos, t.pos) <= reach + (t.radius ?? .4) && angleTo(att.pos, att.yaw, t.pos) <= arc)
    .sort((a, b) => dist(att.pos, a.pos) - dist(att.pos, b.pos));
  const n = f.heavy && att.stats.cleave ? targets.length : Math.min(1, targets.length);
  for (const t of targets.slice(0, n)) {
    f.hitIds.add(t.id);
    if (t.fighter.invulnerable) { hits.push({ attacker: att, target: t, res: { dodged: true, amount: 0 }, killed: false }); continue; }
    const facing = angleTo(t.pos, t.yaw, att.pos) < 1.2;
    const res = computeDamage(
      { weapon: f.weapon, stats: att.stats, heavy: f.heavy, sneak: att.stats.sneak && t.unaware, allyBonus: opts.allyBonus?.(att) ?? 0 },
      { stats: t.stats, blocking: t.fighter.blocking, parrying: t.fighter.parrying, facing }, rng);
    if (res.parried) f.stagger(.9);
    const killed = t.fighter.takeHit(res);
    hits.push({ attacker: att, target: t, res, killed });
  }
  return hits;
}
