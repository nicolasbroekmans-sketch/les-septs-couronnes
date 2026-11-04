// Menu principal : nouvelle partie, continuer, charger, mode découverte, paramètres, crédits.
import { $, h } from '../dom.js';

export function mainMenu({ saves, onNew, onLoad, onDiscover, onSettings }) {
  const latest = saves.latest(), list = saves.list();
  const root = $('#menu');
  const btn = (label, fn, o = {}) => h('button.btn-gold.menu-btn', { type: 'button', disabled: !!o.disabled, on: { click: fn } }, h('span', {}, label));
  const slots = h('div.slots', { hidden: true }, list.length ? list.map(m => h('button.slot', { type: 'button', on: { click: () => onLoad(m.slot) } },
    h('b', {}, m.label === 'Sauvegarde auto' ? 'Sauvegarde automatique' : `Emplacement ${m.slot}`), h('span', {}, `${m.name}, niveau ${m.level} — jour ${m.day}`), h('small', {}, new Date(m.savedAt).toLocaleString('fr-FR')))) : h('p', {}, 'Aucune sauvegarde.'));
  root.replaceChildren(h('div.menu-inner', {},
    h('p.kicker', {}, 'Un jeu de rôle non officiel'), h('h1.menu-title', {}, 'Les Sept Couronnes'), h('p.menu-sub', {}, 'Commencez comme un inconnu. Devenez ce que vous voulez.'),
    h('nav.menu-nav', {},
      btn('Nouvelle partie', onNew),
      btn(latest ? `Continuer — ${latest.name}, niv. ${latest.level}` : 'Continuer', () => onLoad(latest.slot), { disabled: !latest }),
      btn('Charger une partie', () => { slots.hidden = !slots.hidden; }, { disabled: !list.length }), slots,
      btn('Mode découverte (16 lieux)', onDiscover),
      btn('Paramètres', onSettings)),
    h('p.menu-foot', {}, 'Fan game non commercial. Aucune image, musique ou logo officiel. Voir README pour les crédits.')));
  root.classList.add('active');
  root.querySelector('button:not([disabled])')?.focus();
}
