// Contrats (petites missions pour gagner de l'or), affichés sur le tableau de chaque lieu. Logique pure :
// offres du jour (déterministes par lieu et par jour), acceptation, progression, remise et paiement.
import { count, removeItem } from '../player/Inventory.js';
import { addXp } from '../player/Progression.js';

const FOES = ['Des brigands détroussent les voyageurs', 'Des déserteurs pillent les fermes', 'Une bande de coupe-jarrets rôde hors des murs'];
const GOODS = [['fourrure', 'Des fourrures pour l’hiver'], ['ration', 'Des vivres pour un convoi']];
const seeded = s => () => ((s = (s * 16807) % 2147483647) / 2147483647);
const hash = str => [...str].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 2147483647, 7) || 7;
export const book = state => (state.world.contracts ??= { active: [], done: [] });

/** Trois offres pour ce lieu aujourd'hui. */
export function offers(state, region) {
  const day = state.world.time.day, r = seeded(hash(region.id + ':' + day)), lvl = state.player.level, B = book(state);
  const people = region.npcs.filter(n => ['villager', 'merchant', 'guard', 'priest'].includes(n.role) && !n.when);
  const list = [];
  list.push({ id: `${region.id}-${day}-h`, kind: 'hunt', region: region.id, title: FOES[Math.floor(r() * FOES.length)], text: 'Trois hommes armés, à une centaine de pas du lieu. Ramenez la paix — morts ou en fuite.', count: 3, reward: 45 + lvl * 12, xp: 60 + lvl * 10 });
  const to = people[Math.floor(r() * people.length)];
  if (to) list.push({ id: `${region.id}-${day}-d`, kind: 'deliver', region: region.id, npc: to.id, npcName: to.name, title: `Un pli pour ${to.name}`, text: `Un message scellé à remettre en main propre à ${to.name}, ici même. Discret, rapide, bien payé.`, reward: 18 + lvl * 4, xp: 30 });
  const [item, label] = GOODS[Math.floor(r() * GOODS.length)];
  list.push({ id: `${region.id}-${day}-c`, kind: 'collect', region: region.id, item, qty: 2, title: label, text: `Apportez 2 × ${item} au tableau. Le marchand du coin en vend ; les ennemis vaincus en portent parfois.`, reward: 30 + lvl * 5, xp: 35 });
  return list.filter(o => !B.active.some(a => a.id === o.id) && !B.done.includes(o.id));
}
export function accept(state, offer) {
  const B = book(state); if (B.active.length >= 3) return { ok: false, reason: 'Trois contrats à la fois, pas plus.' };
  B.active.push({ ...offer, have: 0 }); return { ok: true };
}
/** Un ennemi d'une chasse vaincu. */
export function onDefeated(state, group) { const c = book(state).active.find(a => a.kind === 'hunt' && 'contract_' + a.id === group); if (c) c.have++; return c; }
export const ready = (state, c) => c.kind === 'hunt' ? c.have >= c.count : c.kind === 'collect' ? count(state.player, c.item) >= c.qty : true;
/** Remise du contrat : paiement, XP, archivage. */
export function turnIn(core, id) {
  const { state, bus } = core, B = book(state), c = B.active.find(a => a.id === id);
  if (!c || !ready(state, c)) return null;
  if (c.kind === 'collect') removeItem(state.player, c.item, c.qty, bus);
  state.player.gold += c.reward; addXp(state.player, c.xp, bus, 'contrat');
  B.active.splice(B.active.indexOf(c), 1); B.done.push(c.id); if (B.done.length > 60) B.done.shift();
  bus.emit('player:gold', { amount: c.reward }); bus.emit('contract:done', { id: c.id, title: c.title, reward: c.reward, xp: c.xp });
  return c;
}
