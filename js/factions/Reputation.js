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
  return (state.factions[faction] ?? 0) <= -60 || (state.player.bounty?.[faction] ?? 0) > 0;
}
