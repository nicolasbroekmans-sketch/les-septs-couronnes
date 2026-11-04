// Relations : réputation auprès des factions, prime éventuelle, personnes rencontrées et leurs souvenirs.
import { h } from '../dom.js';
import { FACTIONS } from '../../data/factions.js';
import { rank } from '../../factions/Reputation.js';

const MEM = { betrayed: 'vous a vu trahir', caught_stealing: 'vous a surpris à voler', robbed: 'soupçonne un vol', spared_by_player: 'vous doit la vie', attacked_by_player: 'a été agressé par vous', freed: 'a été libérée par vous', partner: 'a fait affaire avec vous', suspicious: 'reste méfiant', freed_wildling: 'désapprouve votre clémence' };

export function factionsTab(G) {
  return { id: 'factions', label: 'Factions', render(el) {
    const s = G.core.state;
    el.append(h('div.cols', {},
      h('section', {}, h('h4', {}, 'Réputation (an 298 apr. la Conquête)'), h('ul.factions', {}, Object.entries(FACTIONS).map(([id, f]) => {
        const v = Math.round(s.factions[id] ?? 0);
        return h('li', {}, h('span.dot', { style: { background: f.color } }), h('span', {}, f.name), h('div.rep', {}, h('i', { style: { width: `${(v + 100) / 2}%` } })), h('b', {}, `${rank(v)} (${v})`),
          s.player.bounty[id] ? h('em.warn', {}, ` prime ${s.player.bounty[id]} or`) : null);
      }))),
      h('section', {}, h('h4', {}, 'Personnes rencontrées'), h('ul.people', {}, Object.entries(s.npcs).filter(([, r]) => r.memory.length || r.relation).map(([id, r]) => h('li', {},
        h('b', {}, G.region?.actors.get(id)?.name ?? id), ` — relation ${r.relation > 0 ? '+' : ''}${Math.round(r.relation)}${r.alive ? '' : ' (mort)'}`,
        r.memory.length ? h('small', {}, ' · ' + [...new Set(r.memory.map(m => MEM[m.type] ?? m.type))].join(', ')) : null))))));
  } };
}
