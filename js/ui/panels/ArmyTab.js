// Onglet Armée : troupes et capacité, recrutement (auprès d'un recruteur), compagnons qui suivent le héros,
// grandes batailles de la région avec leurs conditions.
import { h } from '../dom.js';
import { UNITS } from '../../data/units.js';
import { BATTLES } from '../../data/battles.js';
import { QUESTS } from '../../quests/QuestRegistry.js';
import { check } from '../../core/Conditions.js';
import { army, troopCount, capacity, followerSlots, strength, canRecruit, recruit, setFollowers } from '../../player/Army.js';

const need = (c, s) => c.level ? `niveau ${c.level}` : c.flag ? `remporter « ${BATTLES[c.flag.slice(4)]?.name} »` : `terminer « ${QUESTS[c.quest]?.title ?? c.quest} »`;

export function armyTab(G, hire = false) {
  return { id: 'army', label: 'Armée', render(el, rerender) {
    const s = G.core.state, p = s.player, A = army(p), slots = followerSlots(p);
    const head = h('div.army-head', {}, h('h3', {}, `Vos hommes : ${troopCount(p)} / ${capacity(p)}`),
      h('p.sub', {}, `Force estimée ${strength(p).toFixed(0)} · or ${p.gold} · la capacité grandit avec le niveau, la renommée et le Commandement.`),
      hire ? null : h('p.hint', {}, 'Pour engager des hommes, parlez à un recruteur (plaque « Recruteur »). Les batailles se lancent auprès du capitaine de guerre.'));
    const units = h('div.army-units', {}, Object.entries(UNITS).map(([id, u]) => {
      const n = A.troops[id] ?? 0, err1 = canRecruit(p, id, 1), err5 = canRecruit(p, id, 5), fol = A.followers.filter(f => f === id).length;
      const buy = q => () => { const r = recruit(G.core, id, q); G.ui.toast(r.ok ? `${q} × ${u.name} engagé(s) (−${r.cost} or)` : r.reason, r.ok ? 'loot' : 'warn'); rerender(); };
      const toggle = add => () => { const list = add ? [...A.followers, id] : A.followers.filter((f, i) => i !== A.followers.lastIndexOf(id));
        if (!setFollowers(p, list)) return G.ui.toast(add ? `Pas plus de ${slots} compagnons pour l’instant.` : 'Impossible.', 'warn');
        G.followers?.refresh(); G.ui.toast(add ? `Un ${u.name.toLowerCase().replace(/s$/, '')} vous suit désormais.` : 'Compagnon renvoyé au camp.', 'info'); rerender(); };
      return h('div.army-unit', {}, h('div', {}, h('b', {}, u.name), h('p.sub', {}, `${n} engagé(s) · ${u.hp} PV · puissance ${u.power} · ${u.cost} or`),
        u.minLevel || u.minRenown ? h('p.sub', {}, `Requiert niveau ${u.minLevel ?? 1}${u.minRenown ? ` et renommée ${u.minRenown}` : ''}`) : null),
        h('div.army-actions', {},
          hire ? h('button.btn-ui', { type: 'button', disabled: !!err1, title: err1 ?? '', on: { click: buy(1) } }, '+1') : null,
          hire ? h('button.btn-ui', { type: 'button', disabled: !!err5, title: err5 ?? '', on: { click: buy(5) } }, '+5') : null,
          h('button.btn-ui', { type: 'button', disabled: n <= fol || A.followers.length >= slots, on: { click: toggle(true) } }, 'Compagnon +'),
          fol ? h('button.btn-ui', { type: 'button', on: { click: toggle(false) } }, `Compagnon − (${fol})`) : null));
    }));
    const battles = Object.entries(BATTLES).filter(([, b]) => b.region === p.region).map(([id, b]) => {
      const won = s.world.flags['won:' + id], miss = b.requires.filter(c => !check(c, s));
      return h('div.army-battle' + (won ? '.won' : ''), {}, h('b', {}, b.name, won ? ' — victoire' : ''), h('p', {}, b.desc),
        h('p.sub', {}, `Ennemis : ${Object.values(b.enemy.units).reduce((a, c) => a + c, 0)} (${b.enemy.name}) · alliés fournis : ${Object.values(b.allies.units).reduce((a, c) => a + c, 0)} + vos ${troopCount(p)} hommes`),
        miss.length ? h('p.warn', {}, 'Conditions : ' + miss.map(c => need(c, s)).join(', ')) : h('p.ok', {}, won ? 'Vous pouvez rejouer cette bataille.' : 'Prête. Parlez au capitaine de guerre pour la lancer.'));
    });
    el.append(head, h('h4', {}, `Troupes · compagnons ${A.followers.length} / ${slots}`), units, h('h4', {}, 'Batailles de la région'), battles.length ? h('div', {}, battles) : h('p.sub', {}, 'Aucune bataille ici.'));
  } };
}
