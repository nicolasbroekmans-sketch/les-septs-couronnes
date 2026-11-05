// Tableau des contrats : offres du jour dans ce lieu, contrats en cours (où aller, progression, remise).
import { h } from '../dom.js';
import { offers, accept, book, ready } from '../../world/Contracts.js';

const ICON = { hunt: '⚔', deliver: '✉', collect: '⛁' };
export function contractsTab(G) {
  return { id: 'contracts', label: 'Contrats', render(el, rerender) {
    const s = G.core.state, def = G.region.def, B = book(s);
    const card = (c, actions) => h('div.army-unit', {}, h('div', {}, h('b', {}, `${ICON[c.kind]} ${c.title}`), h('p.sub', {}, c.text), h('p.sub', {}, `Récompense : ${c.reward} or, ${c.xp} XP`)), h('div.army-actions', {}, actions));
    const offer = (def.lawFaction ? offers(s, def) : []).map(o => card(o, [h('button.btn-ui', { type: 'button', on: { click: () => { const r = accept(s, o); if (!r.ok) return G.ui.toast(r.reason, 'warn'); if (o.kind === 'hunt') G.contracts.spawnHunt(def, B.active.at(-1)); G.ui.toast(`Contrat accepté : ${o.title}. Suivez la colonne de lumière.`, 'quest'); rerender(); } } }, 'Accepter')]));
    const mine = B.active.map(c => card(c, [
      h('p.sub', {}, c.region !== def.id ? 'Dans un autre lieu' : c.kind === 'hunt' ? `${c.have} / ${c.count} vaincus` : c.kind === 'deliver' ? `Parlez à ${c.npcName}` : ready(s, c) ? 'Prêt à livrer' : `Il vous faut ${c.qty} × ${c.item}`),
      c.kind === 'collect' && c.region === def.id ? h('button.btn-ui', { type: 'button', disabled: !ready(s, c), on: { click: () => { G.contracts.pay(c.id); rerender(); } } }, 'Livrer') : null]));
    el.append(h('h3', {}, 'Tableau des contrats'), h('p.sub', {}, 'De petites missions pour gagner de l’or et de l’expérience. Les offres changent chaque jour, et chaque ville ou village a les siennes.'),
      h('h4', {}, 'Vos contrats'), mine.length ? h('div', {}, mine) : h('p.sub', {}, 'Aucun contrat en cours.'),
      h('h4', {}, 'Offres du jour'), offer.length ? h('div', {}, offer) : h('p.sub', {}, 'Plus rien aujourd’hui. Revenez demain, ou voyagez vers un autre lieu.'));
  } };
}
