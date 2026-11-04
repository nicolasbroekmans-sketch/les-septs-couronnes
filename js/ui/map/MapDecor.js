// Fond de carte : parchemin, mer animée, continents, reliefs, noms, rose des vents, navires, brume.
import { CONTINENTS } from '../../data/places.js';
import { el, rng, roughen, smoothPath, blob, SHAPES, ISLANDS, RANGES, W, H } from './MapShapes.js';

/** Dessine le fond dans `svg`. handlers : { hover(key), leave(), pick(key) } */
export function drawMapBase(svg, handlers) {
  const rand = rng(42), zoomed = () => svg.classList.contains('zoomed');
  const hoverCont = k => handlers.hover(k), hideCard = () => handlers.leave(), zoomTo = k => handlers.pick(k);
  // Parchemin + mer
  el('rect', { x: 0, y: 0, width: W, height: H, fill: '#cdbf98' }, svg);
  el('rect', { x: 0, y: 0, width: W, height: H, fill: '#9fb0ad', opacity: .35 }, svg);
  el('rect', { x: 0, y: 0, width: W, height: H, fill: 'url(#waves)' }, svg);
  const lands = el('g', {}, svg);
  const deco = el('g', { 'aria-hidden': 'true' }, svg);
  const conts = {};

  for (const key of Object.keys(SHAPES)) {
    const c = CONTINENTS[key], r = rng(key.length * 97);
    const g = el('g', { class: 'continent', tabindex: 0, role: 'button', 'aria-label': `${c.name} — ${c.quote}` }, lands);
    const paths = [smoothPath(roughen(SHAPES[key], r))].concat(ISLANDS[key].map(([x, y, rx, ry]) => smoothPath(roughen(blob(x, y, rx, ry, 7, r), r, 2, .2))));
    const d = paths.join(' ');
    // halos de côte gravés
    [26, 16, 8].forEach((w, i) => el('path', { d, fill: 'none', stroke: '#5b4426', 'stroke-width': w, opacity: .05 + i * .04, 'stroke-linejoin': 'round' }, g));
    const land = el('path', { d, class: 'land' }, g);
    el('path', { d, fill: '#000', filter: 'url(#paper)', 'pointer-events': 'none' }, g);
    const b = c.view;
    el('text', { x: b[0] + b[2] / 2 + (key === 'westeros' ? 40 : 30), y: b[1] + b[3] / 2 + (key === 'westeros' ? 30 : -20), class: 'label', 'text-anchor': 'middle', 'font-size': key === 'westeros' ? 54 : 78 }, g).textContent = c.name.toUpperCase();
    conts[key] = { g, land, data: c };
    g.addEventListener('pointerenter', () => hoverCont(key));
    g.addEventListener('focus', () => hoverCont(key));
    g.addEventListener('pointerleave', () => !zoomed() && hideCard());
    g.addEventListener('click', () => !zoomed() && zoomTo(key));
    g.addEventListener('keydown', e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), !zoomed() && zoomTo(key)));
  }

  // Montagnes & forêts (semées puis filtrées par isPointInFill)
  requestAnimationFrame(() => {
    for (const key in RANGES) {
      const land = conts[key].land;
      for (const [type, segs] of Object.entries(RANGES[key])) for (const [[x1, y1], [x2, y2]] of segs) {
        const n = Math.round(Math.hypot(x2 - x1, y2 - y1) / (type === 'm' ? 16 : 13));
        for (let i = 0; i < n; i++) {
          const t = i / n, x = x1 + (x2 - x1) * t + (rand() - .5) * 40, y = y1 + (y2 - y1) * t + (rand() - .5) * 40;
          const pt = svg.createSVGPoint(); pt.x = x; pt.y = y;
          if (!land.isPointInFill(pt)) continue;
          el('use', { href: type === 'm' ? '#mtn' : '#tree', x, y, transform: `rotate(0) `, opacity: .9, 'pointer-events': 'none' }, conts[key].g).setAttribute('transform', `translate(${x} ${y}) scale(${.8 + rand() * .5}) translate(${-x} ${-y})`);
        }
      }
    }
  });

  // Le Mur
  el('path', { d: 'M232 140 L620 132', stroke: '#e9f3f7', 'stroke-width': 7, 'stroke-linecap': 'round', 'pointer-events': 'none' }, lands);
  el('path', { d: 'M232 140 L620 132', stroke: '#6b8a99', 'stroke-width': 2, 'stroke-dasharray': '2 6', 'pointer-events': 'none' }, lands);
  // Noms de mers & régions
  const label = (x, y, txt, size, cls = 'region-name', rot = 0) => { const t = el('text', { x, y, class: cls, 'font-size': size, 'text-anchor': 'middle', transform: `rotate(${rot} ${x} ${y})` }, deco); t.textContent = txt; };
  label(760, 560, 'LA MER ÉTROITE', 22, 'region-name', -78);
  label(110, 880, 'LA MER DU COUCHANT', 20, 'region-name', -80);
  label(1520, 1080, 'LA MER D’ÉTÉ', 22);
  label(1340, 820, 'Baie des Serfs', 15, 'region-name');
  label(1460, 560, 'Mer Dothrak', 18, 'region-name');
  label(400, 222, 'LE NORD', 18); label(420, 880, 'LE BIEF', 16); label(490, 1050, 'DORNE', 16);

  // Rose des vents
  const rose = el('g', { transform: 'translate(1780 1040)' }, deco);
  const roseIn = el('g', {}, rose);
  roseIn.innerHTML = `<circle r="78" fill="none" stroke="#5b4426" stroke-width="1.5"/><circle r="64" fill="none" stroke="#5b4426" stroke-width=".8" stroke-dasharray="3 4"/>
    ${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<path transform="rotate(${a})" d="M0 -${a % 90 ? 50 : 86} L${a % 90 ? 7 : 11} 0 L0 ${a % 90 ? 8 : 12} L-${a % 90 ? 7 : 11} 0Z" fill="${a % 90 ? '#a68a4c' : '#8b0000'}" stroke="#3b2a14" stroke-width="1"/>`).join('')}
    <circle r="7" fill="#c9a227" stroke="#3b2a14"/>`;
  el('text', { y: -96, 'text-anchor': 'middle', class: 'region-name', 'font-size': 22, fill: '#3b2a14' }, rose).textContent = 'N';

  // Navires
  const shipD = 'M-18 0 Q0 10 18 0 L14 -2 L-14 -2Z M0 -2 L0 -30 M0 -28 Q12 -18 0 -6 Z';
  const ships = [[700, 420, 820, 700], [130, 400, 120, 1000], [1000, 1080, 1700, 1000], [960, 260, 1300, 200]].map(([x1, y1, x2, y2], i) => {
    const s = el('g', { transform: `translate(${x1} ${y1})` }, deco);
    el('path', { d: shipD, fill: '#e8dcc0', stroke: '#3b2a14', 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, s);
    return { s, x1, y1, x2, y2, i };
  });
  // Brume
  const mists = [[600, 300, 260], [1100, 650, 320], [300, 1000, 240], [1600, 400, 300], [800, 900, 260]].map(([x, y, r]) =>
    el('ellipse', { cx: x, cy: y, rx: r, ry: r * .35, fill: '#f4efe2', opacity: .32, filter: 'url(#blur30)', 'pointer-events': 'none' }, svg));
  // Taches + cadre
  el('rect', { x: 0, y: 0, width: W, height: H, filter: 'url(#stain)', 'pointer-events': 'none', opacity: .6 }, svg);
  el('rect', { x: 14, y: 14, width: W - 28, height: H - 28, fill: 'none', stroke: '#3b2a14', 'stroke-width': 3, 'pointer-events': 'none' }, svg);
  el('rect', { x: 24, y: 24, width: W - 48, height: H - 48, fill: 'none', stroke: '#3b2a14', 'stroke-width': 1, 'pointer-events': 'none' }, svg);

  return { conts, roseIn, ships, mists };
}
