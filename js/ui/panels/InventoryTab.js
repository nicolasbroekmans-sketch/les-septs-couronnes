// Inventaire et fiche de personnage : équiper, consommer, statistiques dérivées, points d'attribut.
import { h } from '../dom.js';
import { ITEMS } from '../../data/items.js';
import { ATTRIBUTES, APTITUDES, CLASSES, ORIGINS } from '../../data/classes.js';
import { equip, consume, weight } from '../../player/Inventory.js';
import { raiseAttribute } from '../../player/Progression.js';
import { derive } from '../../player/Stats.js';

const desc = it => it.type === 'weapon' ? `Dégâts ${it.dmg} · portée ${it.ranged ? it.reach + ' m (tir)' : it.reach + ' m'} · endurance ${it.stamina}`
  : it.type === 'armor' ? `Protection ${Math.round(it.armor * 100)} %${it.speed < 1 ? ` · vitesse ${Math.round(it.speed * 100)} %` : ''}`
  : it.type === 'consumable' ? `Soigne ${it.heal}${it.stamina ? `, endurance +${it.stamina}` : ''}` : it.type === 'quest' ? 'Objet de quête' : 'Marchandise';

export function inventoryTab(G) {
  return { id: 'inv', label: 'Inventaire', render(el, rerender) {
    const p = G.core.state.player, d = derive(p), f = G.player.fighter;
    const list = h('ul.items', {}, p.inventory.map(s => {
      const it = ITEMS[s.id], on = Object.values(p.equipped).includes(s.id);
      return h('li' + (on ? '.equipped' : ''), {}, h('span.it', {}, it.name, s.qty > 1 ? h('small', {}, ` ×${s.qty}`) : null, h('em', {}, desc(it))),
        ['weapon', 'armor'].includes(it.type) && !on ? h('button', { type: 'button', on: { click: () => { equip(p, s.id, G.core.bus); rerender(); } } }, 'Équiper') : null,
        on ? h('span.tag', {}, 'Équipé') : null,
        it.type === 'consumable' ? h('button', { type: 'button', on: { click: () => { const v = { hp: f.hp, maxHp: f.maxHp, stamina: f.stamina, maxStamina: f.maxStamina }; consume(p, s.id, v, G.core.bus); f.hp = v.hp; f.stamina = v.stamina; rerender(); } } }, 'Utiliser') : null);
    }));
    const attrs = h('ul.attrs', {}, Object.entries(ATTRIBUTES).map(([k, label]) => h('li', {}, h('span', {}, label), h('b', {}, p.attrs[k]),
      p.attrPoints ? h('button.plus', { type: 'button', 'aria-label': `Augmenter ${label}`, on: { click: () => { raiseAttribute(p, k, G.core.bus); rerender(); } } }, '+') : null)));
    const apts = h('ul.attrs', {}, Object.entries(APTITUDES).map(([k, label]) => h('li', {}, h('span', {}, label), h('b', {}, Math.floor(p.apt[k])))));
    el.append(h('div.cols', {},
      h('section', {}, h('h4', {}, `Sac (${weight(p).toFixed(1)} kg) — ${p.gold} or`), list),
      h('section', {}, h('h4', {}, `${p.name}, ${CLASSES[p.classId].name}`), h('p.sub', {}, `${p.sex === 'femme' ? 'Femme' : 'Homme'} de ${p.age} ans, originaire de ${ORIGINS[p.origin].name}. Renommée ${p.renown}.`),
        p.backstory ? h('p.sub', {}, h('em', {}, p.backstory)) : null,
        h('h5', {}, `Attributs${p.attrPoints ? ` — ${p.attrPoints} point(s) à répartir` : ''}`), attrs, h('h5', {}, 'Aptitudes (progressent avec la pratique)'), apts,
        h('h5', {}, 'Combat'), h('ul.attrs', {}, [
          ['Vie', `${Math.ceil(f.hp)} / ${d.maxHp}`], ['Endurance', `${Math.ceil(f.stamina)} / ${d.maxStamina}`], ['Dégâts au corps à corps', `×${d.melee.toFixed(2)}`], ['Dégâts à distance', `×${d.ranged.toFixed(2)}`],
          ['Critique', `${Math.round(d.crit * 100)} %`], ['Parade', `${Math.round(d.block * 100)} %`], ['Armure', `${Math.round(d.armor * 100)} %`], ['Persuasion', Math.round(d.persuade)]
        ].map(([a, b]) => h('li', {}, h('span', {}, a), h('b', {}, b)))))));
  } };
}
