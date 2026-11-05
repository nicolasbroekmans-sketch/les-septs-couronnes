// Carte de la région (touche M) : plan au sol, lieux nommés, marchands, missions, objectif suivi.
import { h } from '../dom.js';
import { questMarker } from '../../game/WorldMarkers.js';
import { objectiveTargets } from '../hud/Targets.js';
import { destinations } from '../../game/Travel.js';

export function mapTab(G) {
  return { id: 'map', label: 'Carte', render(el) {
    const base = G.ui.hudView.map.base, def = G.region.def; if (!base) return;
    const S = Math.min(760, innerWidth - 80), cv = h('canvas.region-map', { width: S, height: S }), g = cv.getContext('2d');
    const k = S / Math.max(base.cv.width, base.cv.height), tx = x => (x - base.x0) * base.s * k, tz = z => (z - base.z0) * base.s * k;
    g.fillStyle = '#d9c9a0'; g.fillRect(0, 0, S, S); g.drawImage(base.cv, 0, 0, base.cv.width * k, base.cv.height * k);
    const label = (x, z, text, color = '#2b2116', size = 13, dot = null) => {
      if (dot) { g.fillStyle = dot; g.beginPath(); g.arc(tx(x), tz(z), 5, 0, 7); g.fill(); g.strokeStyle = '#2b2116'; g.stroke(); }
      g.font = `italic ${size}px "IM Fell English", serif`; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = 'rgba(240,230,200,.9)';
      g.strokeText(text, tx(x), tz(z) - 9); g.fillStyle = color; g.fillText(text, tx(x), tz(z) - 9);
    };
    for (const poi of G.env.pois) label(poi.x, poi.z, poi.title, '#5a3a14', 12, '#c9a227');
    for (const m of def.markers) label(m.x, m.z, m.label ?? m.id, '#8b0000', 14, '#8b0000');
    for (const a of G.actors) {
      if (a.kind !== 'npc' || !a.alive || a.hidden) continue;
      const mark = questMarker(G, a), hostile = G.hostile(a, G.player);
      if (mark || a.def.merchant || ['recruiter', 'captain', 'beggar'].includes(a.def.role)) label(a.pos.x, a.pos.z, `${mark ? mark + ' ' : ''}${a.name}`, mark ? '#7a4a00' : '#1e4a6a', 12, mark ? '#ffd040' : '#2a6a8a');
      else if (hostile) { g.fillStyle = '#b0201a'; g.beginPath(); g.arc(tx(a.pos.x), tz(a.pos.z), 3, 0, 7); g.fill(); }
    }
    for (const t of objectiveTargets(G)) { g.save(); g.translate(tx(t.x), tz(t.z)); g.rotate(Math.PI / 4); g.fillStyle = '#c9a227'; g.fillRect(-7, -7, 14, 14); g.strokeRect(-7, -7, 14, 14); g.restore(); }
    const P = G.player.pos; g.save(); g.translate(tx(P.x), tz(P.z)); g.rotate(-G.player.yaw);
    g.fillStyle = '#8b0000'; g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -12); g.lineTo(8, 9); g.lineTo(0, 5); g.lineTo(-8, 9); g.closePath(); g.fill(); g.stroke(); g.restore();
    el.append(travel(G), h('div.map-wrap', {}, h('h4', {}, `${def.name} — ${def.region}`), cv,
      h('p.sub', {}, '◆ objectif · « ! » mission disponible · « ? » personne à retrouver · bleu : marchands et recruteurs · rouge : ennemis · flèche : toi')));
  } };
}

/** Voyager : toutes les villes et tous les villages de la carte, du plus proche au plus lointain. */
function travel(G) {
  const p = G.core.state.player, seen = G.core.state.world.discovered;
  if (G.battle || G.core.state.explore) return h('p.sub', {}, G.battle ? 'Impossible de voyager pendant une bataille.' : '');
  return h('div.travel', {}, h('h4', {}, 'Voyager'), h('p.sub', {}, 'Choisissez une destination : on y arrive à pied, à cheval ou en bateau. Chaque lieu a ses habitants, ses marchands, ses gardes et son recruteur.'),
    h('div.travel-list', {}, destinations(p.region).map(d => h('button.travel-dest' + (seen.includes(d.place.id) ? '.seen' : ''), { type: 'button', disabled: p.gold < d.gold, on: { click: () => G.travel(d.place.id) } },
      h('b', {}, d.place.name), h('span', {}, `${d.place.region}${d.sea ? ' · traversée en bateau' : ''}`), h('em', {}, `${d.hours} h · ${d.gold} or`)))));
}
