// Bataille : bandeau des forces (alliés contre ennemis, ordre en cours) et écran de fin.
import { $, h } from './dom.js';
import { UNITS } from '../data/units.js';

const ORDERS = { charge: 'Charge', hold: 'Tenir', follow: 'Suivre' };
let el = null, last = '';

export function battleHud(b, a, e) {
  if (!b) { el?.remove(); el = null; last = ''; return; }
  if (!el) { el = h('div#battle-hud'); $('#hud').append(el); }
  a ??= b.total.A; e ??= b.total.B;
  const key = `${a}|${e}|${b.order}|${b.started}`; if (key === last) return; last = key;
  const pa = a / b.total.A * 100, pe = e / b.total.B * 100;
  el.replaceChildren(h('b', {}, b.def.name),
    h('div.bh-bars', {}, h('span.bh-a', {}, `${a} alliés`), h('i.bh-bar', {}, h('i.bh-fa', { style: { width: pa + '%' } })), h('i.bh-bar', {}, h('i.bh-fe', { style: { width: pe + '%' } })), h('span.bh-e', {}, `${e} ennemis`)),
    h('p', {}, b.started ? `Ordre : ${ORDERS[b.order]}` : 'Les lignes se forment…', ' · ', h('kbd', {}, '1'), ' charger ', h('kbd', {}, '2'), ' tenir ', h('kbd', {}, '3'), ' me suivre'));
}

export function battleResult(ui, b, win) {
  if (b.def.prologue) return welcome(ui);
  const lost = Object.entries(b.losses).map(([u, n]) => `${n} × ${UNITS[u].name}`).join(', ') || 'aucune';
  ui.panel.open([{ id: 'res', label: win ? 'Victoire' : 'Défaite', render(c) {
    c.append(h('div.battle-res' + (win ? '.win' : '.loss'), {}, h('h2', {}, win ? 'Victoire !' : 'Défaite…'),
      h('p', {}, win ? `${b.def.enemy.name} est brisée. Les bardes chanteront votre nom.` : 'Vos lignes ont cédé. Vous êtes ramené à l’arrière, blessé mais vivant.'),
      h('p.sub', {}, `Pertes parmi vos hommes : ${lost}.`),
      win ? h('p.ok', {}, 'Récompenses : or, expérience, renommée, réputation et une cape d’exception (voir Profil).') : h('p.sub', {}, 'Recrutez davantage et revenez quand vous serez prêt.'),
      h('button.btn-gold', { type: 'button', on: { click: () => ui.closePanel() } }, h('span', {}, 'Quitter le champ de bataille'))));
  } }], 'res', 'Bataille');
}

/** Fin du prologue : « Bienvenue à Westeros », puis création du personnage. */
function welcome(ui) {
  ui.panel.open([{ id: 'res', label: 'Victoire', render(c) {
    c.append(h('div.battle-res.win.welcome', {}, h('p.kicker', {}, 'Victoire !'), h('h2', {}, 'Bienvenue à Westeros'),
      h('p', {}, 'Le seigneur félon est en fuite. Sur le champ de bataille, un vieux chevalier vous tend la main : « Bien combattu, petit. Mais qui es-tu, au juste ? »'),
      h('p.sub', {}, 'Choisissez maintenant qui vous êtes : votre nom, votre maison, votre métier — et l’endroit où commence votre histoire.'),
      h('button.btn-gold', { type: 'button', on: { click: () => ui.closePanel() } }, h('span', {}, 'Créer mon personnage'))));
  } }], 'res', 'Prologue');
}
/** Bouton « Passer le prologue » (visible tant que le prologue dure). */
export function skipButton(on, onSkip) {
  $('#skip-prologue')?.remove(); if (!on) return;
  document.body.append(h('button#skip-prologue.btn-ui', { type: 'button', on: { click: onSkip } }, 'Passer le prologue ›'));
}
