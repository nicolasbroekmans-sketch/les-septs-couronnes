// Carte interactive du monde et des continents : survol, zoom cinématique, sceaux de cire, liste des lieux.
// Modes : 'discover' (tous les lieux, exploration libre) ou 'start' (seuls les lieux de départ jouables).
import { CONTINENTS, PLACES } from '../../data/places.js';
import { audio } from '../../audio.js';
import { el, rng, smoothPath, blob, W, H, DEFS } from './MapShapes.js';
import { drawMapBase } from './MapDecor.js';

export function createMap({ onPlace, onLevel, mode = 'discover', starts = [] }) {
  const stage = document.getElementById('map-stage');
  stage.innerHTML = '';
  const card = document.getElementById('map-card');
  const list = document.getElementById('place-list');
  const mapTitle = document.getElementById('map-title');
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet', role: 'img', 'aria-label': 'Carte de Westeros et d\u2019Essos' }, stage);
  el('defs', {}, svg).innerHTML = DEFS;
  const { conts, roseIn, ships, mists } = drawMapBase(svg, { hover: k => hoverCont(k), leave: () => !zoomed && hideCard(), pick: k => !zoomed && zoomTo(k) });
  const places = mode === 'start' ? PLACES.filter(p => starts.includes(p.id)) : PLACES;
  // Sceaux de cire
  const sealLayer = el('g', {}, svg);
  const seals = places.map(p => {
    const g = el('g', { class: 'seal', tabindex: -1, role: 'button', 'aria-label': `${p.name}, ${p.region}. ${p.mood}`, transform: `translate(${p.x} ${p.y})`, opacity: 0, visibility: 'hidden' }, sealLayer);
    const inner = el('g', {}, g);
    const r = rng(p.x * 7 + p.y);
    const bodyD = smoothPath(blob(0, 0, 16, 16, 11, r));
    const pop = el('g', {}, inner);
    const wax = el('g', { class: 'wax' }, pop);
    const halves = ['halfL', 'halfR'].map(cp => {
      const h = el('g', { 'clip-path': `url(#${cp})` }, wax);
      el('path', { d: bodyD, fill: 'url(#waxGrad)', stroke: '#3a0202', 'stroke-width': 1 }, h);
      el('circle', { r: 10.5, class: 'ring', fill: 'none', stroke: '#e0a19a', 'stroke-width': 1, opacity: .55 }, h);
      el('text', { y: 4.5, 'text-anchor': 'middle', 'font-size': 13, 'font-family': 'Cinzel Decorative, serif', 'font-weight': 700, fill: '#f2c9a0', opacity: .9 }, h).textContent = p.name.replace(/^(Le |Les |La )/, '')[0];
      return h;
    });
    const name = el('text', { y: 32, 'text-anchor': 'middle', class: 'place-name', 'font-size': 15 }, inner);
    name.textContent = p.name;
    const show = () => { showPlaceCard(p); audio.sfx('parchment', .35, .9 + Math.random() * .3); };
    g.addEventListener('pointerenter', show);
    g.addEventListener('focus', show);
    g.addEventListener('click', () => breakSeal(p));
    g.addEventListener('keydown', e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), breakSeal(p)));
    return { p, g, inner, pop, halves };
  });

  // ---------- État & animations ----------
  let zoomed = null, busy = false;
  const vb = { x: 0, y: 0, w: W, h: H };
  const applyVB = () => { svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`); scaleSeals(); };
  function scaleSeals() {
    const r = stage.getBoundingClientRect(), s = Math.min(r.width / vb.w, r.height / vb.h);
    const k = Math.min(2.2, Math.max(.8, 1.15 / (s * 1.6)));
    seals.forEach(o => o.inner.setAttribute('transform', `scale(${k})`));
  }
  addEventListener('resize', scaleSeals);

  const M = () => document.body.classList.contains('reduced') ? .01 : 1;
  const anims = [];
  anims.push(gsap.to(roseIn, { rotation: 360, transformOrigin: '50% 50%', duration: 120, repeat: -1, ease: 'none' }));
  ships.forEach(({ s, x1, y1, x2, y2, i }) => {
    anims.push(gsap.fromTo(s, { x: x1, y: y1 }, { x: x2, y: y2, duration: 70 + i * 15, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: -i * 20 }));
    anims.push(gsap.to(s.firstChild, { rotation: 4, transformOrigin: '50% 100%', duration: 2 + i * .3, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
  });
  mists.forEach((m, i) => anims.push(gsap.to(m, { attr: { cx: `+=${160 + i * 30}` }, duration: 30 + i * 6, repeat: -1, yoyo: true, ease: 'sine.inOut' })));

  function setMotion(reduced) { anims.forEach(a => a.paused(reduced)); reduced ? svg.pauseAnimations() : svg.unpauseAnimations(); }

  function cardIn(html) {
    card.innerHTML = html;
    gsap.killTweensOf(card);
    gsap.fromTo(card, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .45 * M(), ease: 'power3.out' });
  }
  function hideCard() { gsap.to(card, { opacity: 0, y: 14, duration: .3 * M() }); Object.values(conts).forEach(c => c.g.classList.remove('lit')); }
  function hoverCont(key) {
    if (zoomed) return;
    Object.entries(conts).forEach(([k, c]) => c.g.classList.toggle('lit', k === key));
    const c = CONTINENTS[key];
    cardIn(`<span class="kicker">${c.kicker}</span><h3>${c.name}</h3><blockquote>${c.quote}</blockquote>`);
    audio.sfx('parchment', .3);
  }
  function showPlaceCard(p) {
    cardIn(`<span class="kicker">${p.region}</span><h3>${p.name}</h3>
      <dl><dt>Maison</dt><dd>${p.house}</dd><dt>Climat</dt><dd>${p.climate}</dd></dl><p><em>${p.mood}</em></p>`);
  }

  function tweenVB(target, dur) {
    return gsap.to(vb, { x: target[0], y: target[1], w: target[2], h: target[3], duration: dur * M(), ease: 'power3.inOut', onUpdate: applyVB });
  }

  function zoomTo(key) {
    if (busy) return; busy = true; zoomed = key;
    audio.sfx('whoosh', .45);
    hideCard();
    svg.classList.add('zoomed'); document.getElementById('map').classList.add('zoomed');
    Object.values(conts).forEach(c => c.g.setAttribute('tabindex', -1));
    gsap.to(mapTitle, { opacity: 0, duration: .3 });
    const c = CONTINENTS[key];
    tweenVB(c.view, 2.2).then(() => {
      busy = false;
      mapTitle.innerHTML = `<span class="kicker">${c.kicker}</span><h2>${c.name}</h2>`;
      gsap.to(mapTitle, { opacity: 1, duration: .6 });
      const mine = seals.filter(s => s.p.continent === key);
      seals.forEach(s => { s.g.setAttribute('visibility', 'hidden'); s.g.setAttribute('tabindex', -1); gsap.set(s.halves, { x: 0, y: 0, rotation: 0, opacity: 1 }); });
      mine.forEach(s => { s.g.setAttribute('visibility', 'visible'); s.g.setAttribute('tabindex', 0); });
      gsap.fromTo(mine.map(s => s.g), { opacity: 0 }, { opacity: 1, duration: .5 * M(), stagger: .07 * M() });
      gsap.fromTo(mine.map(s => s.pop), { scale: 2.4 }, { scale: 1, transformOrigin: '50% 50%', duration: .55 * M(), stagger: .07 * M(), ease: 'back.out(2)', onStart: () => audio.sfx('seal', .25, 1.4) });
      buildList(key, mine.map(s => s.p));
      mine[0]?.g.focus({ preventScroll: true });
      onLevel?.(3, key);
    });
  }

  function buildList(key, places) {
    list.querySelector('h3').textContent = `Lieux — ${CONTINENTS[key].name}`;
    const ul = list.querySelector('ul'); ul.innerHTML = '';
    places.forEach(p => {
      const li = document.createElement('li'); if (p.star) li.className = 'star';
      li.innerHTML = `<button type="button">${p.name}<small>${p.region}</small></button>`;
      li.firstChild.addEventListener('click', () => breakSeal(p));
      li.firstChild.addEventListener('mouseenter', () => showPlaceCard(p));
      li.firstChild.addEventListener('focus', () => showPlaceCard(p));
      ul.appendChild(li);
    });
    gsap.set(list, { visibility: 'visible' });
    gsap.to(list, { opacity: 1, duration: .5 * M() });
    ScrollTrigger.getAll().forEach(t => t.kill());
    const horiz = innerWidth <= 760;
    gsap.set(ul.children, { opacity: 0, [horiz ? 'x' : 'y']: 16 });
    ScrollTrigger.batch(ul.children, { scroller: list, horizontal: horiz, start: horiz ? 'left 100%' : 'top 100%',
      onEnter: b => gsap.to(b, { opacity: 1, x: 0, y: 0, stagger: .05 * M(), duration: .4 * M(), overwrite: true }) });
    ScrollTrigger.refresh();
    // filet de sécurité : les entrées déjà visibles apparaissent même si le déclencheur tarde
    setTimeout(() => { const r = list.getBoundingClientRect(); [...ul.children].forEach(li => { const b = li.getBoundingClientRect(); if (gsap.getProperty(li, 'opacity') < .5 && b.top < r.bottom && b.left < r.right) gsap.to(li, { opacity: 1, x: 0, y: 0, duration: .4 }); }); }, 1200);
  }

  function breakSeal(p) {
    if (busy) return; busy = true;
    const s = seals.find(o => o.p === p);
    audio.sfx('seal', .7);
    let done = false; const finish = () => { if (done) return; done = true; busy = false; onPlace?.(p); };
    const tl = gsap.timeline({ onComplete: finish });
    setTimeout(finish, 2500 * M() + 400); // filet de sécurité : si une animation de survol interrompt le bris du sceau
    tl.to(s.halves[0], { x: -9, y: 4, rotation: -24, transformOrigin: '50% 50%', duration: .5 * M(), ease: 'power2.out' }, 0)
      .to(s.halves[1], { x: 9, y: 5, rotation: 22, transformOrigin: '50% 50%', duration: .5 * M(), ease: 'power2.out' }, 0)
      .to(s.halves, { opacity: 0, duration: .3 * M() }, .3 * M())
      .to(vb, { x: p.x - 60, y: p.y - 40, w: 120, h: 80, duration: 1.1 * M(), ease: 'power3.in', onUpdate: applyVB }, .1);
  }

  function unzoom() {
    if (!zoomed || busy) return false;
    busy = true; zoomed = null;
    hideCard();
    gsap.to([list, mapTitle], { opacity: 0, duration: .3 * M() });
    seals.forEach(s => gsap.to(s.g, { opacity: 0, duration: .3 * M(), onComplete: () => s.g.setAttribute('visibility', 'hidden') }));
    tweenVB([0, 0, W, H], 1.8).then(() => {
      busy = false;
      svg.classList.remove('zoomed'); document.getElementById('map').classList.remove('zoomed');
      gsap.set(list, { visibility: 'hidden' });
      Object.values(conts).forEach(c => c.g.setAttribute('tabindex', 0));
      mapTitle.innerHTML = `<span class="kicker">Le monde connu</span><h2>Westeros &amp; Essos</h2>`;
      gsap.to(mapTitle, { opacity: 1, duration: .6 });
      conts.westeros.g.focus({ preventScroll: true });
      onLevel?.(2);
    });
    return true;
  }

  /** Revient à la vue continent (après une scène 3D). */
  function restoreContinent(key) {
    zoomed = null; busy = false;
    const c = CONTINENTS[key];
    Object.assign(vb, { x: c.view[0], y: c.view[1], w: c.view[2], h: c.view[3] }); applyVB();
    zoomTo(key);
  }

  function intro() {
    Object.assign(vb, { x: 400, y: 240, w: W * .6, h: H * .6 }); applyVB();
    tweenVB([0, 0, W, H], 3.2);
  }

  applyVB();
  return { zoomTo, unzoom, restoreContinent, intro, setMotion, get zoomed() { return zoomed; } };
}
