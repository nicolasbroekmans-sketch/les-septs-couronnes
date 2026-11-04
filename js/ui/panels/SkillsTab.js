// Arbres de compétences : talents achetables avec les points gagnés à chaque niveau.
import { h } from '../dom.js';
import { TREES, SKILLS } from '../../data/skills.js';
import { canLearn, learn, xpForLevel } from '../../player/Progression.js';

export function skillsTab(G) {
  return { id: 'skills', label: 'Compétences', render(el, rerender) {
    const p = G.core.state.player;
    el.append(h('p.sub', {}, `Niveau ${p.level} — ${p.xp} / ${xpForLevel(p.level)} XP — `, h('b', {}, `${p.skillPoints} point(s) de compétence`)),
      h('div.trees', {}, Object.entries(TREES).map(([tree, name]) => h('section.tree', {}, h('h4', {}, name),
        Object.entries(SKILLS).filter(([, s]) => s.tree === tree).map(([id, s]) => {
          const has = p.skills.includes(id), ok = canLearn(p, id);
          return h('div.skill' + (has ? '.has' : ok ? '.can' : ''), {},
            h('b', {}, s.name), h('small', {}, ` (${s.cost} pt)`), h('p', {}, s.desc),
            s.req ? h('em', {}, 'Requiert : ' + s.req.map(r => SKILLS[r].name).join(', ')) : null,
            has ? h('span.tag', {}, 'Acquis') : h('button', { type: 'button', disabled: !ok, on: { click: () => { learn(p, id, G.core.bus); rerender(); } } }, 'Apprendre'));
        })))));
  } };
}
