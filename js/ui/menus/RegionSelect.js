// Choix du lieu de départ sur la carte interactive (sceaux de cire des trois régions jouables).
import { $, h } from '../dom.js';
import { createMap } from '../map/WorldMap.js';
import { START_REGIONS } from '../../core/GameState.js';
import { REGIONS } from '../../data/regions/index.js';

const INFO = {
  kingslanding: { opp: 'Commerce, intrigues, contrats des marchands, le Guet recrute.', risk: 'Coupe-bourses, bandits sur la route royale, politique dangereuse.' },
  winterfell: { opp: 'La forge de Torvald, la confiance des Stark, des terres sauvages à explorer.', risk: 'Froid mordant, déserteurs dans le Bois-aux-Loups.' },
  wall: { opp: 'Patrouilles au-delà du Mur, rencontres avec le Peuple libre, la Garde de Nuit.', risk: 'Blizzard, nuit éternelle, sauvageons et pire encore.' }
};

export function regionSelect({ onPick, onBack }) {
  const mapEl = $('#map'), card = $('#start-card');
  mapEl.classList.add('active', 'start-mode');
  let map;
  const choose = p => {
    const def = REGIONS[p.id], info = INFO[p.id];
    card.replaceChildren(h('div.start', {},
      h('span.kicker', {}, def.region), h('h3', {}, def.name), h('p', {}, def.intro),
      h('dl', {}, h('dt', {}, 'Opportunités'), h('dd', {}, info.opp), h('dt', {}, 'Dangers'), h('dd', {}, info.risk)),
      h('div.actions', {}, h('button.btn-ui', { type: 'button', on: { click: () => { card.classList.remove('open'); map.restoreContinent(p.continent); } } }, 'Un autre lieu'),
        h('button.btn-gold', { type: 'button', on: { click: () => { card.classList.remove('open'); mapEl.classList.remove('active', 'start-mode'); onPick(p.id); } } }, h('span', {}, `Commencer à ${def.name}`)))));
    card.classList.add('open');
    card.querySelector('.btn-gold').focus();
  };
  map = createMap({ mode: 'start', starts: START_REGIONS, onPlace: choose, onLevel: () => {} });
  $('#map-title').innerHTML = '<span class="kicker">Nouvelle partie</span><h2>Choisissez votre point de départ</h2>';
  $('#map-help').textContent = 'Cliquez sur un sceau (ou Tab puis Entrée) pour voir le lieu de départ';
  setTimeout(() => map.zoomTo('westeros'), 400);
  return { back: () => { mapEl.classList.remove('active', 'start-mode'); card.classList.remove('open'); onBack(); } };
}
