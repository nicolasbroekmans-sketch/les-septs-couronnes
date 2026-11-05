// Onglet Classement : réserver un pseudo unique, voir les meilleurs héros (en ligne, ou local si non configuré).
import { h } from '../dom.js';
import { identity, claimPseudo, submitScore, top, online } from '../../online/Leaderboard.js';

export function rankTab(G) {
  return { id: 'rank', label: 'Classement', render(el, rerender) {
    const st = G.storage, id = identity(st), input = h('input', { type: 'text', maxlength: 20, value: id.pseudo ?? G.core.state.player.name, 'aria-label': 'Pseudo' });
    const msg = h('p.sub', {}, id.pseudo ? `Votre pseudo : ${id.pseudo}. Votre score est envoyé automatiquement.` : 'Choisissez un pseudo : personne d’autre ne pourra le prendre.');
    const claim = async () => {
      msg.textContent = 'Vérification…';
      try { const r = await claimPseudo(st, input.value); if (!r.ok) { msg.textContent = r.reason; return; } await submitScore(st, G.core.state); G.ui.toast(`Pseudo « ${input.value.trim()} » réservé !`, 'level'); rerender(); }
      catch (e) { msg.textContent = 'Serveur injoignable : ' + e.message; }
    };
    const list = h('ol.rank-list', {}, h('li.sub', {}, 'Chargement…'));
    top(st).then(rows => list.replaceChildren(...(rows.length ? rows.map((r, i) => h('li' + (r.pseudo === id.pseudo ? '.me' : ''), {}, h('b', {}, `${i + 1}. ${r.pseudo}`), h('span', {}, `niv. ${r.level} · renommée ${r.renown} · ${r.kills} victoires`))) : [h('li.sub', {}, 'Personne pour l’instant. Soyez le premier !')])))
      .catch(e => list.replaceChildren(h('li.sub', {}, 'Classement indisponible : ' + e.message)));
    el.append(h('div.rank', {}, h('h3', {}, online() ? 'Classement des héros (en ligne)' : 'Classement des héros (local)'),
      online() ? null : h('p.warn', {}, 'Le classement en ligne n’est pas encore branché sur un serveur : les scores restent dans ce navigateur.'),
      h('div.rank-claim', {}, input, h('button.btn-ui', { type: 'button', on: { click: claim } }, id.pseudo ? 'Changer de pseudo' : 'Réserver ce pseudo')), msg, list));
  } };
}
