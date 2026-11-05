// Armée du joueur : recrutement contre de l'or, capacité selon niveau / commandement / renommée,
// compagnons qui suivent le héros, pertes après bataille.
import { UNITS } from '../data/units.js';

export const army = p => (p.army ??= { troops: {}, followers: [] });
export const troopCount = p => Object.values(army(p).troops).reduce((a, b) => a + b, 0);
export const capacity = p => Math.floor(8 + p.level * 4 + p.apt.commandement / 3 + p.renown / 2);
export const followerSlots = p => Math.min(4, 1 + Math.floor(p.level / 3) + Math.floor(p.apt.commandement / 30));
export const strength = p => Object.entries(army(p).troops).reduce((s, [u, n]) => s + UNITS[u].power * n, 0);

export function canRecruit(p, unit, qty = 1) {
  const u = UNITS[unit]; if (!u) return 'Unité inconnue.';
  if ((u.minLevel ?? 1) > p.level) return `Niveau ${u.minLevel} requis.`;
  if ((u.minRenown ?? 0) > p.renown) return `Renommée ${u.minRenown} requise.`;
  if (troopCount(p) + qty > capacity(p)) return `Capacité maximale atteinte (${capacity(p)} hommes).`;
  if (p.gold < u.cost * qty) return 'Pas assez d’or.';
  return null;
}
export function recruit(game, unit, qty = 1) {
  const p = game.state.player, err = canRecruit(p, unit, qty);
  if (err) return { ok: false, reason: err };
  p.gold -= UNITS[unit].cost * qty; army(p).troops[unit] = (army(p).troops[unit] ?? 0) + qty;
  game.bus.emit('army:recruited', { unit, qty });
  return { ok: true, cost: UNITS[unit].cost * qty };
}
/** Choisit les compagnons qui suivent le héros (pris dans les troupes). */
export function setFollowers(p, list) {
  const a = army(p), counts = {};
  for (const u of list) counts[u] = (counts[u] ?? 0) + 1;
  if (list.length > followerSlots(p) || Object.entries(counts).some(([u, n]) => (a.troops[u] ?? 0) < n)) return false;
  a.followers = [...list];
  return true;
}
/** Retire les morts (après bataille ou si un compagnon tombe). */
export function applyLosses(p, losses) {
  const a = army(p);
  for (const [u, n] of Object.entries(losses)) a.troops[u] = Math.max(0, (a.troops[u] ?? 0) - n);
  a.followers = a.followers.filter((u, i, arr) => arr.slice(0, i + 1).filter(x => x === u).length <= (a.troops[u] ?? 0));
}
