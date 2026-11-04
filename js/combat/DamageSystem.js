// Calcul des dégâts : arme, statistiques, critique, armure, parade, garde brisée, difficulté.
// Fonction pure : testable et identique pour le joueur et les PNJ.

/**
 * @param {object} a  { weapon, stats: derive()-like, heavy, sneak, allyBonus }
 * @param {object} d  { stats, blocking, parrying, facing }
 * @param {() => number} rng
 */
export function computeDamage(a, d, rng = Math.random) {
  const w = a.weapon, ranged = !!w.ranged;
  let amount = w.dmg * (a.heavy ? (w.heavy ?? 1.8) + (a.stats.heavyBonus ?? 0) : 1);
  amount *= ranged ? a.stats.ranged : a.stats.melee;
  amount *= 1 + (a.allyBonus ?? 0);
  const crit = rng() < (a.stats.crit ?? 0);
  if (crit) amount *= 1.6;
  if (a.sneak) amount *= 2;
  const armor = Math.max(0, (d.stats.armor ?? 0) * (1 - (w.armorPierce ?? 0)));
  amount *= 1 - armor;
  const res = { amount: 0, crit, blocked: false, parried: false, guardBreak: false, staminaDrain: 0 };
  if (d.facing && d.parrying && !ranged) {
    res.parried = true;
    return res;
  }
  if (d.facing && d.blocking) {
    const eff = (d.stats.block ?? .6) * (a.heavy ? .55 : 1);
    res.blocked = true;
    res.staminaDrain = amount * (a.heavy ? 1.1 : .6);
    res.guardBreak = !!a.heavy;
    amount *= 1 - eff;
  }
  res.amount = Math.max(1, Math.round(amount * (d.stats.taken ?? 1)));
  return res;
}

/** Statistiques d'un PNJ à partir de son profil simple. */
export function npcStats(n) {
  return {
    melee: 1 + (n.force ?? 5) * .06, ranged: 1 + (n.agilite ?? 5) * .05, crit: .04, heavyBonus: 0,
    block: n.block ?? .6, parryWindow: .15, armor: n.armor ?? .1, taken: 1, attackSpeed: n.speed ?? 1, dodgeCost: 20,
    staminaRegen: 16, maxHp: n.hp ?? 60, maxStamina: n.stamina ?? 80
  };
}
