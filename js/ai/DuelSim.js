// Simulateur de duel 1D utilisant les VRAIS modules de combat (Fighter + DamageSystem).
// Sert à entraîner et à évaluer les politiques tactiques de façon reproductible.
import { Fighter } from '../combat/Fighter.js';
import { computeDamage, npcStats } from '../combat/DamageSystem.js';
import { ITEMS } from '../data/items.js';
import { features, ACTIONS } from './Tactics.js';
import { createRng } from '../core/Random.js';

const make = (weaponId, prof) => { const stats = npcStats(prof); return new Fighter({ maxHp: stats.maxHp, maxStamina: stats.maxStamina, weapon: ITEMS[weaponId], stats }); };

/** Adversaire scripté simulant un joueur raisonnable : approche, frappe, pare parfois, esquive parfois. */
function playerBot(me, foe, d, rng) {
  if (foe.attacking && d < foe.weapon.reach + .5) { if (rng() < .35) return 'defend'; if (rng() < .2) return 'dodge'; }
  if (d > me.weapon.reach - .2) return 'approach';
  return me.stamina > me.cost(false) ? (rng() < .25 ? 'heavy' : 'attack') : 'defend';
}

/** policy(f, rng) → nom d'action. Renvoie { result: 'win'|'loss'|'fled'|'draw', dealt, taken }. */
export function duel(policy, seed = 1, o = {}) {
  const rng = createRng(seed);
  const npc = make(o.npcWeapon ?? 'epee_courte', { hp: 70, force: 5 }), pl = make(o.playerWeapon ?? 'epee_courte', { hp: 80, force: 5 + rng() * 2 });
  let x = 0, px = 6 + rng() * 4, t = 0, next = 0, act = 'attack', pnext = 0, pact = 'approach', dealt = 0, taken = 0;
  const dt = .05, aggression = .3 + rng() * .5, morale = .4 + rng() * .4;
  while (t < 60) {
    t += dt;
    const d = px - x;
    if (t >= next) {
      const f = features({ distance: d, reach: npc.weapon.reach, hp: npc.hp / npc.maxHp, stamina: npc.stamina / npc.maxStamina, targetHp: pl.hp / pl.maxHp,
        allies: 0, enemies: 1, threat: pl.attacking && d < pl.weapon.reach + 1, ranged: false, morale, aggression, targetBlocking: pl.blocking });
      act = policy(f, rng); next = t + .3;
      npc.block(act === 'defend'); if (act === 'dodge') npc.dodge();
    }
    if (t >= pnext) { pact = playerBot(pl, npc, d, rng); pnext = t + .25; pl.block(pact === 'defend'); if (pact === 'dodge') pl.dodge(); }
    // déplacements
    const sp = 3.2 * dt;
    if (act === 'attack') { if (d > npc.weapon.reach - .3) x += sp; else npc.attack(rng() < .2); }
    if (act === 'retreat' || act === 'dodge') x -= sp * (act === 'dodge' ? 1.6 : 1);
    if (act === 'flee') x -= sp * 1.5;
    if (pact === 'approach') px -= sp * .95; else if (pact === 'attack' || pact === 'heavy') pl.attack(pact === 'heavy');
    if (px - x < .6) px = x + .6;
    // coups
    for (const [a, b, sign] of [[npc, pl, 1], [pl, npc, -1]]) {
      if (a.state === 'active' && !a.hitIds.has(b) && px - x <= a.weapon.reach + .4) {
        a.hitIds.add(b);
        if (b.invulnerable) continue;
        const res = computeDamage({ weapon: a.weapon, stats: a.stats, heavy: a.heavy }, { stats: b.stats, blocking: b.blocking, parrying: b.parrying, facing: true }, rng);
        if (res.parried) a.stagger(.9);
        b.takeHit(res);
        sign > 0 ? (dealt += res.amount) : (taken += res.amount);
      }
    }
    npc.update(dt); pl.update(dt);
    if (!pl.alive) return { result: 'win', dealt, taken, t };
    if (!npc.alive) return { result: 'loss', dealt, taken, t };
    if (px - x > 25) return { result: 'fled', dealt, taken, t };
  }
  return { result: 'draw', dealt, taken, t };
}

/** Évalue une politique sur n duels : taux de victoire, de survie et score de fitness. */
export function evaluate(policy, n = 100, seed0 = 1000) {
  const r = { win: 0, loss: 0, fled: 0, draw: 0, dealt: 0, taken: 0 };
  for (let i = 0; i < n; i++) { const d = duel(policy, seed0 + i); r[d.result]++; r.dealt += d.dealt; r.taken += d.taken; }
  const fitness = (r.win + .35 * r.fled + .2 * r.draw) / n + .15 * Math.tanh((r.dealt - r.taken) / (n * 40));
  return { winRate: r.win / n, survival: (r.win + r.fled + r.draw) / n, fitness, ...r };
}
export { ACTIONS };
