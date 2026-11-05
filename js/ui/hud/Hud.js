// Affichage tête haute : vitalité, endurance, expérience, or, heure et météo, suivi de quête,
// invite d'interaction, fiche de lieu, titre de région, mini-carte et boussole.
import { $, h } from '../dom.js';
import { ICONS } from '../Icons.js';
import { Minimap } from './Minimap.js';
import { objectiveTargets } from './Targets.js';
import { advise } from '../../game/Advisor.js';
import { xpForLevel } from '../../player/Progression.js';
import { QUESTS } from '../../quests/QuestRegistry.js';
import { secondsToGift } from '../../player/Rewards.js';
import { direction } from '../panels/GuideTab.js';

const WEATHER = { clear: ['sun', 'Ciel clair'], cloudy: ['cloud', 'Nuageux'], rain: ['rain', 'Pluie'], snow: ['snow', 'Neige'], fog: ['fog', 'Brouillard'] };

export class Hud {
  constructor() {
    this.root = $('#hud');
    this.map = new Minimap($('#minimap'), $('#compass-strip'));
    this.t = 0; this.cache = {};
  }
  bakeMap(G) { this.map.bake(G.physics, G.env.mapMarks, G.region.def.bounds); }
  set(key, el, value, fn) { if (this.cache[key] !== value) { this.cache[key] = value; fn(el, value); } }
  update(G, dt) {
    const p = G.core.state.player, f = G.player.fighter;
    $('#bar-hp i').style.width = `${100 * f.hp / f.maxHp}%`;
    $('#bar-st i').style.width = `${100 * f.stamina / f.maxStamina}%`;
    $('#crosshair').classList.toggle('on', !!G.player.aiming);
    if ((this.t += dt) < .15) return; this.t = 0; // textes : 6–7 fois par seconde suffisent
    this.set('hpTxt', $('#bar-hp b'), `${Math.ceil(f.hp)} / ${f.maxHp}`, (e, v) => (e.textContent = v));
    this.set('xp', $('#bar-xp i'), `${100 * p.xp / xpForLevel(p.level)}%`, (e, v) => (e.style.width = v));
    this.set('lvl', $('#hud-level'), `Niv. ${p.level}${p.skillPoints ? ' ✦' : ''}`, (e, v) => (e.textContent = v));
    this.set('gold', $('#hud-gold'), p.gold, (e, v) => (e.innerHTML = ICONS.coin + `<span>${v}</span>`));
    const w = WEATHER[G.core.state.world.time.weather] ?? WEATHER.clear, night = G.core.clock.isNight;
    this.set('clock', $('#hud-clock'), G.core.clock.label() + w[1] + night, e => (e.innerHTML = (night && w[0] === 'sun' ? ICONS.moon : ICONS[w[0]]) + `<span>${G.core.clock.label()} · ${w[1]}</span>`));
    const targets = objectiveTargets(G);
    this.tracker(G, targets);
    this.map.draw(G, targets, G.rig.yaw);
    const sg = secondsToGift(G.core.state);
    this.set('gift', $('#hud-gift'), G.core.state.explore ? '' : `🎁 ${Math.floor(sg / 60)}:${String(Math.floor(sg % 60)).padStart(2, '0')}`, (e, v) => (e.textContent = v));
    const bounty = p.bounty[G.region.def.lawFaction];
    this.set('bounty', $('#hud-bounty'), bounty ?? 0, (e, v) => { e.hidden = !v; e.textContent = `Recherché · prime ${v} or`; });
  }
  tracker(G, targets) {
    const id = G.core.state.world.tracked, el = $('#tracker');
    if (!id || G.core.quests.status(id) !== 'active') {
      const next = Object.entries(G.core.state.quests).find(([, q]) => q.state === 'active');
      if (next) { G.core.state.world.tracked = next[0]; return; }
      const tip = advise(G.core, G.region.def)[0], t = targets[0], P = G.player.pos;
      const html = tip ? `<h4>${tip.title}</h4><p class="trk-tip">${tip.text}</p>${t ? `<small>◆ ${Math.round(Math.hypot(t.x - P.x, t.z - P.z))} m, ${direction(t.x - P.x, t.z - P.z)}</small>` : ''}<button class="trk-help" type="button">? Que faire</button>` : '';
      return this.set('trk', el, html, (e, v) => (e.innerHTML = v));
    }
    const P = G.player.pos, near = targets[0], dist = near ? Math.round(Math.hypot(near.x - P.x, near.z - P.z)) : null;
    const objs = G.core.quests.objectives(id).filter(o => o.label);
    const html = `<button class="trk-help" type="button">? Que faire</button><h4>${QUESTS[id].title}</h4><ul>${objs.map(o => `<li class="${o.done ? 'done' : ''}">${o.label}${o.count > 1 ? ` (${Math.min(o.have, o.count)}/${o.count})` : ''}</li>`).join('')}</ul>${dist !== null ? `<small>◆ ${dist} m, ${direction(near.x - P.x, near.z - P.z)}</small>` : ''}`;
    this.set('trk', el, html, (e, v) => (e.innerHTML = v));
  }
  prompt(text) { this.set('prompt', $('#prompt'), text ?? '', (e, v) => { e.innerHTML = v ? `<kbd>E</kbd> ${v}` : ''; e.classList.toggle('on', !!v); }); }
  lore(poi) { this.set('lore', $('#lore'), poi?.id ?? '', (e, v) => { if (v) e.innerHTML = `<span class="kicker">Lieu</span><h3>${poi.title}</h3><p>${poi.text}</p>`; e.classList.toggle('on', !!v); }); }
  regionTitle(def) {
    const el = $('#region-title'); el.innerHTML = `<span class="kicker">${def.region}</span><h2>${def.name}</h2>`;
    el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
  }
  show(on) { this.root.classList.toggle('on', on); }
  static markup() {
    return h('div', {}, h('div#vitals', {}, h('div#hud-level', {}, 'Niv. 1'),
      h('div.bar#bar-hp', {}, h('i'), h('b')), h('div.bar#bar-st', {}, h('i')), h('div.bar#bar-xp', {}, h('i'))),
    h('div#hud-gold'), h('div#hud-clock'), h('div#hud-gift', { title: 'Prochain cadeau mystère' }), h('div#hud-bounty', { hidden: true }),
    h('div#compass', { 'aria-hidden': 'true' }, h('div#compass-strip'), h('i')), h('canvas#minimap', { width: 320, height: 320, 'aria-label': 'Mini-carte' }),
    h('div#tracker', { 'aria-live': 'polite' }), h('div#prompt', { 'aria-live': 'polite' }), h('div#crosshair'), h('div#lore', { 'aria-live': 'polite' }), h('div#region-title'),
    h('div#keys', {}, h('span', { html: '<kbd>R</kbd> Inventaire <kbd>K</kbd> Compétences <kbd>J</kbd> Journal <kbd>M</kbd> Carte <kbd>P</kbd> Profil <kbd>G</kbd> Guide <kbd>Échap</kbd> Menu' })));
  }
}
