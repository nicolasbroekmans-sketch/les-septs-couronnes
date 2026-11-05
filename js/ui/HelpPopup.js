// Fenêtre « Vous ne savez pas quoi faire ? » : les prochaines étapes conseillées, ouverte par le bouton « ? »,
// la touche F1, ou automatiquement après un long moment sans progrès (une fois de temps en temps, pas plus).
import { h } from './dom.js';
import { advise } from '../game/Advisor.js';

const ICON = { contract: '✉', quest: '◆', offer: '!', battle: '⚔', gold: '⛁', explore: '✦' };

export function helpPopup(ui, auto = false) {
  const G = ui.game; if (!G?.core || document.querySelector('#help')) return;
  const tips = advise(G.core, G.region?.def).slice(0, 4);
  const close = () => { el.remove(); ui.setModal('help', false); };
  const el = h('div#help', { role: 'dialog', 'aria-label': 'Que faire ?' }, h('div.help-box', {},
    h('span.kicker', {}, auto ? 'Un conseil ?' : 'Que faire ?'), h('h3', {}, auto ? 'Vous ne savez pas quoi faire ?' : 'Vos prochaines étapes'),
    h('p.sub', {}, 'C’est normal : une partie du jeu, c’est chercher. Voici quelques pistes, de la plus urgente à la plus libre.'),
    h('ol.help-list', {}, tips.map(t => h('li', {}, h('i', {}, ICON[t.kind] ?? '•'), h('div', {}, h('b', {}, t.title), h('p', {}, t.text))))),
    h('p.sub', {}, 'La colonne de lumière dorée et le losange ◆ de la boussole montrent où aller. G : guide complet · M : carte et voyages · J : journal.'),
    h('button.btn-gold', { type: 'button', on: { click: close } }, h('span', {}, 'Compris'))));
  document.body.append(el); ui.setModal('help', true);
  el.addEventListener('keydown', e => e.code === 'Escape' && close());
}
