// Réputation du joueur auprès des factions, propagée partiellement aux factions alliées ou ennemies.
import { FACTIONS, RELATIONS, RANKS } from '../data/factions.js';
import { derive } from '../player/Stats.js';

export function relation(a, b) {
  if (a === b) return 100;
  const r = RELATIONS.find(([x, y]) => (x === a && y === b) || (x === b && y === a));
  return r ? r[2] : 0;
}
export function rank(value) { return RANKS.find(([max]) => value < max)[1]; }

export function changeRep(state, faction, amount, bus) {
  if (!FACTIONS[faction]) throw new Error('Faction inconnue : ' + faction);
  const mult = amount > 0 ? derive(state.player).repMult : 1, delta = amount * mult;
  const set = (f, v) => { state.factions[f] = Math.max(-100, Math.min(100, (state.factions[f] ?? 0) + v)); };
  set(faction, delta);
  for (const f of Object.keys(FACTIONS)) {
    const r = relation(faction, f);
    if (f !== faction && Math.abs(r) >= 50) set(f, delta * r / 400);
  }
  bus?.emit('faction:rep', { faction, amount: delta });
  return state.factions[faction];
}

/** Un membre de la faction attaque-t-il le joueur à vue ? */
export function hostileToPlayer(state, faction) {
  if (FACTIONS[faction]?.outlaw) return true;
  return (state.factions[faction] ?? 0) <= -60 || (state.player.bounty?.[faction] ?? 0) >= 150; // petite prime : le garde vient vous parler au lieu d'attaquer
}

/** Après une mort : primes effacées, provocations oubliées, rancunes plafonnées (on ne se réveille pas au milieu des gardes). */
export function pardon(state) {
  state.player.bounty = {};
  for (const k of Object.keys(state.world.flags)) if (k.startsWith('provoked:')) delete state.world.flags[k];
  for (const f of Object.keys(state.factions)) if (!FACTIONS[f]?.outlaw) state.factions[f] = Math.max(state.factions[f], -40);
  for (const r of Object.values(state.npcs)) { r.relation = Math.max(r.relation ?? 0, -30); if (r.flags) r.flags.hostile = false; }
}
