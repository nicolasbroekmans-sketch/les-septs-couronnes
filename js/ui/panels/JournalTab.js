// Journal de quêtes : en cours, terminées, échouées ; objectifs, historique et suivi.
import { h } from '../dom.js';
import { QUESTS } from '../../quests/QuestRegistry.js';

export function journalTab(G) {
  return { id: 'journal', label: 'Journal', render(el, rerender) {
    const s = G.core.state, entries = Object.entries(s.quests);
    if (!entries.length) return el.append(h('p.sub', {}, 'Aucune quête pour le moment. Parlez aux habitants : certains ont besoin d’aide.'));
    const order = { active: 0, completed: 1, failed: 2 }, label = { active: 'En cours', completed: 'Terminée', failed: 'Échouée' };
    el.append(h('div.journal', {}, entries.sort((a, b) => order[a[1].state] - order[b[1].state]).map(([id, q]) => {
      const d = QUESTS[id], objs = G.core.quests.objectives(id).filter(o => o.label);
      return h('section.quest.' + q.state, {}, h('header', {}, h('span.kicker', {}, `${d.category} · ${label[q.state]}`), h('h4', {}, d.title),
        q.state === 'active' ? h('button' + (s.world.tracked === id ? '.on' : ''), { type: 'button', on: { click: () => { G.trackQuest(id); rerender(); } } }, s.world.tracked === id ? 'Suivie' : 'Suivre') : null),
        h('p.sub', {}, d.desc), objs.length ? h('ul.objs', {}, objs.map(o => h('li' + (o.done ? '.done' : ''), {}, o.label))) : null,
        h('ol.log', {}, q.log.map(t => h('li', {}, t))));
    })));
  } };
}
