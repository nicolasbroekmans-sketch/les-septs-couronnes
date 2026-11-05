// Récompenses de fidélité : un cadeau mystère toutes les 15 minutes de jeu actif.
// Le tirage favorise les objets pas encore possédés ; la rareté suit les poids de data/cosmetics.js.
import { COSMETICS, RARITY } from '../data/cosmetics.js';

export const GIFT_INTERVAL = 15 * 60;
const LOOT = [{ gold: 40 }, { gold: 75 }, { item: 'onguent', qty: 3 }, { item: 'ration', qty: 4 }, { item: 'epices' }, { item: 'maille' }, { item: 'epee_chateau' }];

export function cosmetics(p) { return (p.cosmetics ??= { owned: [], equipped: {} }); }
export function rewardsState(s) { return (s.rewards ??= { nextGift: GIFT_INTERVAL, opened: 0 }); }
export const secondsToGift = s => Math.max(0, rewardsState(s).nextGift - s.stats.playTime);

/** Tire un cadeau. Renvoie { kind: 'cosmetic', id, rarity } ou { kind: 'loot', effects, rarity }. */
export function rollGift(state, rng = Math.random) {
  const owned = new Set(cosmetics(state.player).owned);
  let r = rng() * Object.values(RARITY).reduce((a, x) => a + x.w, 0), rarity = 'commun';
  for (const [k, v] of Object.entries(RARITY)) { if ((r -= v.w) <= 0) { rarity = k; break; } }
  const pool = Object.entries(COSMETICS).filter(([id, c]) => c.rarity === rarity && !owned.has(id));
  if (pool.length && rng() < .75) { const [id] = pool[Math.floor(rng() * pool.length)]; return { kind: 'cosmetic', id, rarity }; }
  const pick = rarity === 'legendaire' || rarity === 'epique' ? LOOT.slice(4) : LOOT.slice(0, 5);
  return { kind: 'loot', effects: [pick[Math.floor(rng() * pick.length)]], rarity };
}

/** À appeler régulièrement : si l'heure est venue, ouvre le cadeau et l'applique. */
export function checkGift(game, rng = Math.random) {
  const s = game.state, rw = rewardsState(s);
  if (s.stats.playTime < rw.nextGift) return null;
  rw.nextGift = s.stats.playTime + GIFT_INTERVAL; rw.opened++;
  const g = rollGift(s, rng);
  if (g.kind === 'cosmetic') cosmetics(s.player).owned.push(g.id);
  else game.effects(g.effects, { source: 'gift' });
  game.bus.emit('gift:opened', g);
  return g;
}

export function equipCosmetic(p, id, bus) {
  const c = COSMETICS[id], cs = cosmetics(p);
  if (!c || !cs.owned.includes(id)) return false;
  cs.equipped[c.slot] = cs.equipped[c.slot] === id ? null : id;
  bus?.emit('player:cosmetic', { id });
  return true;
}
/** Couleurs et titre effectifs à partir des objets équipés. */
export function lookFromCosmetics(p) {
  const e = cosmetics(p).equipped, v = k => (e[k] ? COSMETICS[e[k]].value : null);
  return { armorTint: v('tint'), cloak: v('cloak'), tunic: v('tunic'), title: e.title ? COSMETICS[e.title].name : null, sigil: v('sigil') };
}
