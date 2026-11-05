// Profil du héros : titre, blason, teintures, capes et tuniques gagnés ; statistiques de partie ; prochain cadeau.
import { h } from '../dom.js';
import { COSMETICS, RARITY, SLOTS } from '../../data/cosmetics.js';
import { cosmetics, equipCosmetic, secondsToGift, lookFromCosmetics, rewardsState } from '../../player/Rewards.js';
import { CLASSES } from '../../data/classes.js';

const fmt = s => `${Math.floor(s / 60)} min ${String(Math.floor(s % 60)).padStart(2, '0')} s`;

export function profileTab(G) {
  return { id: 'profile', label: 'Profil', render(el, rerender) {
    const s = G.core.state, p = s.player, cs = cosmetics(p), look = lookFromCosmetics(p), st = s.stats;
    const hero = h('div.hero-card', {}, h('div.sigil', {}, look.sigil ?? '✦'),
      h('div', {}, h('h3', {}, p.name, look.title ? h('em', {}, ` « ${look.title} »`) : null), h('p.sub', {}, `${CLASSES[p.classId].name} de niveau ${p.level} · renommée ${p.renown}`),
        h('p.sub', {}, `Temps de jeu ${fmt(st.playTime)} · quêtes ${st.questsDone} · ennemis vaincus ${st.kills} · épargnés ${st.spared} · cadeaux ouverts ${rewardsState(s).opened}`),
        h('p.gift-next', {}, `🎁 Prochain cadeau mystère dans ${fmt(secondsToGift(s))}`)));
    const slots = Object.entries(SLOTS).map(([slot, label]) => {
      const owned = cs.owned.filter(id => COSMETICS[id].slot === slot);
      return h('section.cos-slot', {}, h('h5', {}, label),
        owned.length ? h('div.cos-list', {}, owned.map(id => { const c = COSMETICS[id], on = cs.equipped[slot] === id;
          return h('button.cos' + (on ? '.on' : ''), { type: 'button', style: { borderColor: RARITY[c.rarity].color }, title: RARITY[c.rarity].name, on: { click: () => { equipCosmetic(p, id, G.core.bus); rerender(); } } },
            c.value && c.value.startsWith?.('#') ? h('i.swatch', { style: { background: c.value } }) : c.value ? h('i.glyph', {}, c.value) : null, c.name, on ? ' ✓' : '');
        })) : h('p.sub', {}, 'Rien pour l’instant — les cadeaux mystère et les exploits en débloquent.'));
    });
    el.append(hero, h('div.cos-grid', {}, slots));
  } };
}
