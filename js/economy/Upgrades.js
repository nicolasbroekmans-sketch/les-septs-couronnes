// Améliorations chez le forgeron : +1 à +3 sur une arme ou une armure (dégâts ou protection accrus).
import { ITEMS } from '../data/items.js';
import { count } from '../player/Inventory.js';

export const MAX_UPGRADE = 3;
export const upgradeLevel = (p, id) => p.upgrades?.[id] ?? 0;
export function upgradeCost(p, id) {
  const it = ITEMS[id], lvl = upgradeLevel(p, id);
  if (!it || !['weapon', 'armor'].includes(it.type) || lvl >= MAX_UPGRADE) return null;
  return Math.round(25 + it.value * .55 * (lvl + 1));
}
export function upgrade(game, id) {
  const p = game.state.player, cost = upgradeCost(p, id);
  if (cost === null) return { ok: false, reason: 'Amélioration impossible.' };
  if (!count(p, id)) return { ok: false, reason: 'Vous ne possédez pas cet objet.' };
  if (p.gold < cost) return { ok: false, reason: 'Pas assez d’or.' };
  p.gold -= cost; (p.upgrades ??= {})[id] = upgradeLevel(p, id) + 1;
  game.bus.emit('player:upgraded', { id, level: p.upgrades[id] });
  return { ok: true, cost, level: p.upgrades[id] };
}
/** Multiplicateurs appliqués par player/Stats.js. */
export const weaponBonus = (p, id) => 1 + .12 * upgradeLevel(p, id);
export const armorBonus = (p, id) => .04 * upgradeLevel(p, id);
