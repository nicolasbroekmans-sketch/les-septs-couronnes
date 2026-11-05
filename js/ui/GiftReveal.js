// Révélation animée du cadeau mystère (coffre qui s'ouvre, rareté, contenu).
import { $, h } from './dom.js';
import { COSMETICS, RARITY, SLOTS } from '../data/cosmetics.js';
import { ITEMS } from '../data/items.js';
import { audio } from '../audio.js';

export function revealGift(g, onEquip) {
  const el = $('#gift'), r = RARITY[g.rarity];
  const what = g.kind === 'cosmetic' ? `${SLOTS[COSMETICS[g.id].slot]} : ${COSMETICS[g.id].name}`
    : g.effects.map(e => e.gold ? `${e.gold} pièces d’or` : `${ITEMS[e.item].name}${e.qty > 1 ? ' ×' + e.qty : ''}`).join(', ');
  el.replaceChildren(h('div.gift-box', { style: { '--rar': r.color } },
    h('div.chest', { 'aria-hidden': 'true' }, h('i.lid'), h('i.body'), h('i.glow')),
    h('span.kicker', {}, 'Cadeau mystère — 15 minutes de jeu'), h('h3', { style: { color: r.color } }, r.name), h('p', {}, what),
    h('div.actions', {}, g.kind === 'cosmetic' ? h('button.btn-gold', { type: 'button', on: { click: () => { onEquip(g.id); close(); } } }, h('span', {}, 'Équiper')) : null,
      h('button.btn-ui', { type: 'button', on: { click: () => close() } }, 'Super !'))));
  el.classList.add('open'); audio.sfx('chime', .7, .7); setTimeout(() => audio.sfx('chime', .6, 1.3), 450);
  const close = () => el.classList.remove('open');
  setTimeout(close, 12000);
}
