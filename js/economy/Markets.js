// Prix locaux : valeur de base × modificateur régional × talents/charisme du joueur.
import { ITEMS } from '../data/items.js';
import { derive } from '../player/Stats.js';

export const category = id => { const it = ITEMS[id]; return it.type === 'goods' ? it.cat : it.type; };

/** mode 'buy' (le joueur achète) ou 'sell'. mods : { weapon: 1.1, luxe: .8, … } + mods.war pour l'inflation de guerre. */
export function price(id, mode, player, mods = {}) {
  const it = ITEMS[id];
  if (!it || it.type === 'quest' || !it.value) return 0;
  const d = derive(player), local = (mods[category(id)] ?? 1) * (1 + (mods.war ?? 0));
  return Math.max(1, Math.round(it.value * local * (mode === 'buy' ? d.buyMult : d.sellMult)));
}

/** Stock initial d'un marchand, persistant dans state.npcs[id].stock. */
export function stockOf(state, npcId, def) {
  const r = (state.npcs[npcId] ??= { relation: 0, memory: [], flags: {}, alive: true });
  r.stock ??= Object.fromEntries(Object.entries(def ?? {}).map(([k, v]) => [k, v]));
  return r.stock;
}
