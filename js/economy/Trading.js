// Achat, vente et vol. Le vol peut être découvert : le marchand s'en souvient, refuse de commercer
// et alerte le Guet (prime sur la tête du joueur).
import { price, stockOf } from './Markets.js';
import { addItem, removeItem, count } from '../player/Inventory.js';
import { derive } from '../player/Stats.js';
import { practice } from '../player/Progression.js';
import { remember, attitude } from '../ai/Memory.js';
import { ITEMS } from '../data/items.js';

export function canTrade(state, npc) {
  const a = attitude(state, npc.id, npc.faction);
  return a === 'neutre' || a === 'amical' || (a === 'mefiant' && state.player.skills.includes('contacts'));
}

export function buy(game, npc, id, mods) {
  const { state, bus } = game, p = state.player, stock = stockOf(state, npc.id, npc.stock), cost = price(id, 'buy', p, mods);
  if (!canTrade(state, npc)) return { ok: false, reason: 'Le marchand refuse de traiter avec vous.' };
  if (!stock[id]) return { ok: false, reason: 'Rupture de stock.' };
  if (p.gold < cost) return { ok: false, reason: 'Pas assez d’or.' };
  p.gold -= cost; stock[id]--; addItem(p, id, 1, bus); practice(p, 'commerce', .6);
  bus.emit('trade:done', { npc: npc.id, id, cost, mode: 'buy' });
  return { ok: true, cost };
}

export function sell(game, npc, id, mods) {
  const { state, bus } = game, p = state.player, value = price(id, 'sell', p, mods);
  if (!canTrade(state, npc)) return { ok: false, reason: 'Le marchand refuse de traiter avec vous.' };
  if (!value || !count(p, id)) return { ok: false, reason: 'Cet objet ne se vend pas.' };
  const equippedOnly = Object.values(p.equipped).includes(id) && count(p, id) === 1;
  if (equippedOnly) return { ok: false, reason: 'Déséquipez d’abord cet objet.' };
  removeItem(p, id, 1, bus); p.gold += value;
  const stock = stockOf(state, npc.id, npc.stock); stock[id] = (stock[id] ?? 0) + 1;
  practice(p, 'commerce', .6);
  bus.emit('trade:done', { npc: npc.id, id, cost: value, mode: 'sell' });
  return { ok: true, value };
}

/** Tentative de vol sur l'étal. rng injectable pour les tests. */
export function steal(game, npc, id, rng = Math.random) {
  const { state, bus } = game, p = state.player, stock = stockOf(state, npc.id, npc.stock);
  if (!stock[id]) return { ok: false, reason: 'Rien à voler.' };
  const chance = Math.max(.05, Math.min(.9, derive(p).theft - (ITEMS[id].value > 200 ? .2 : 0)));
  if (rng() < chance) {
    stock[id]--; addItem(p, id, 1, bus); practice(p, 'furtivite', 2);
    if (rng() < .35) remember(state, npc.id, 'robbed', id); // remarqué plus tard
    bus.emit('crime:theft', { npc: npc.id, id, caught: false });
    return { ok: true, chance };
  }
  remember(state, npc.id, 'caught_stealing', id);
  state.npcs[npc.id].relation -= 40;
  const f = npc.lawFaction ?? 'guet';
  p.bounty[f] = (p.bounty[f] ?? 0) + Math.round(40 + ITEMS[id].value * .5);
  bus.emit('crime:theft', { npc: npc.id, id, caught: true, faction: f });
  return { ok: false, caught: true, chance, reason: 'Pris la main dans le sac !' };
}
