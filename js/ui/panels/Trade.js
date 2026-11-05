// Commerce : acheter, vendre, ou tenter de voler sur l'étal (risque d'être pris et mémorisé).
import { h } from '../dom.js';
import { ITEMS } from '../../data/items.js';
import { price, stockOf } from '../../economy/Markets.js';
import { buy, sell, steal, canTrade } from '../../economy/Trading.js';
import { derive } from '../../player/Stats.js';
import { audio } from '../../audio.js';
import { upgrade, upgradeCost, upgradeLevel } from '../../economy/Upgrades.js';

export function tradeTab(G, actor) {
  return { id: 'trade', label: `Commerce — ${actor.name}`, render(el, rerender) {
    const s = G.core.state, p = s.player, npc = { id: actor.id, faction: actor.faction, stock: actor.def.stock, lawFaction: G.region.def.lawFaction }, mods = G.region.def.prices;
    const stock = stockOf(s, npc.id, npc.stock), theft = Math.round(Math.max(.05, Math.min(.9, derive(p).theft)) * 100);
    const msg = h('p.trade-msg', {}, canTrade(s, npc) ? `Votre bourse : ${p.gold} or.` : 'Ce marchand refuse de traiter avec vous.');
    const act = (fn, id) => { const r = fn(G, npc, id, mods); msg.textContent = r.ok ? `Transaction effectuée. Bourse : ${p.gold} or.` : r.reason; audio.sfx(r.ok ? 'chime' : 'seal', .3, r.ok ? 1.6 : 1); if (r.ok) setTimeout(rerender, 400); };
    const row = (id, qty, mode) => h('li', {}, h('span.it', {}, `${ITEMS[id].name}`, h('small', {}, ` ×${qty}`)), h('span.pr', {}, `${price(id, mode, p, mods)} or`),
      mode === 'buy' ? [h('button', { type: 'button', on: { click: () => act(buy, id) } }, 'Acheter'), h('button.risky', { type: 'button', title: `Chance estimée : ${theft} %`, on: { click: () => { const r = steal(G, npc, id); msg.textContent = r.ok ? 'Personne n’a rien vu…' : r.reason; if (r.caught) G.crime(actor, 'vol'); setTimeout(rerender, 600); } } }, `Voler (${theft} %)`)]
        : h('button', { type: 'button', on: { click: () => act(sell, id) } }, 'Vendre'));
    const forge = actor.def.smith ? h('section.forge', {}, h('h4', {}, 'Forge — améliorer votre équipement'), h('ul.items', {}, p.inventory.filter(x => upgradeCost(p, x.id) !== null || upgradeLevel(p, x.id)).map(x => {
      const c = upgradeCost(p, x.id), lvl = upgradeLevel(p, x.id);
      return h('li', {}, h('span.it', {}, `${ITEMS[x.id].name} +${lvl}`, h('em', {}, ITEMS[x.id].type === 'weapon' ? '+12 % de dégâts par niveau' : '+4 % de protection par niveau')),
        c === null ? h('span.tag', {}, 'Maximum') : [h('span.pr', {}, `${c} or`), h('button', { type: 'button', on: { click: () => { const r = upgrade(G.core, x.id); msg.textContent = r.ok ? `Amélioré au niveau +${r.level} pour ${r.cost} or.` : r.reason; if (r.ok) setTimeout(rerender, 400); } } }, 'Améliorer')]);
    }))) : null;
    el.append(msg, forge ?? '', h('div.trade', {},
      h('div', {}, h('h4', {}, 'Étal'), h('ul.items', {}, Object.entries(stock).filter(([, q]) => q > 0).map(([id, q]) => row(id, q, 'buy')))),
      h('div', {}, h('h4', {}, 'Votre sac'), h('ul.items', {}, p.inventory.filter(x => price(x.id, 'sell', p, mods) > 0).map(x => row(x.id, x.qty, 'sell'))))));
  } };
}
