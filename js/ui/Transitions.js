// Transitions cinématiques : volée de corbeaux, plongée dans les nuages, fondu de brume.
import { M } from './Ambience.js';
import { audio } from '../audio.js';

const veil = () => document.getElementById('veil');
const RAVEN = 'M2 16 C10 10 18 6 26 10 L30 4 L33 10 C40 7 50 8 58 14 C48 13 40 15 34 18 L30 26 L27 18 C20 16 10 17 2 16Z';

export function ravens() {
  if (M() < 1) return Promise.resolve();
  audio.sfx('raven', .5);
  const ps = [];
  for (let i = 0; i < 14; i++) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 60 30'); s.setAttribute('class', 'raven');
    s.innerHTML = `<path d="${RAVEN}"/>`; veil().appendChild(s);
    const y = innerHeight * (.15 + Math.random() * .6);
    gsap.set(s, { x: -120, y, scale: .6 + Math.random() * 1.4 });
    gsap.to(s.firstChild, { scaleY: -.6, transformOrigin: '50% 50%', duration: .16 + Math.random() * .1, repeat: -1, yoyo: true });
    ps.push(gsap.to(s, { x: innerWidth + 140, y: y - 120 - Math.random() * 200, duration: 2.2 + Math.random() * 1.2, delay: Math.random() * .8, ease: 'power1.in', onComplete: () => s.remove() }));
  }
  return Promise.all(ps);
}

export function clouds(dir = 'in') {
  const v = veil(); v.querySelectorAll('.cloud').forEach(c => c.remove());
  const els = [];
  for (let i = 0; i < 18; i++) {
    const c = document.createElement('div'); c.className = 'cloud';
    const s = 300 + Math.random() * 600; Object.assign(c.style, { width: s + 'px', height: s * .65 + 'px', marginLeft: -s / 2 + 'px', marginTop: -s * .33 + 'px' });
    v.appendChild(c); els.push(c);
    const a = Math.random() * Math.PI * 2, r = Math.random() * Math.min(innerWidth, innerHeight) * .5;
    gsap.set(c, { x: Math.cos(a) * r, y: Math.sin(a) * r });
  }
  if (dir === 'in') return gsap.fromTo(els, { scale: .15, opacity: 0 }, { scale: 2.6, opacity: 1, duration: 1.3 * M(), stagger: .04 * M(), ease: 'power2.in' });
  return gsap.fromTo(els, { scale: 2.6, opacity: 1 }, { scale: 6, opacity: 0, duration: 1.6 * M(), stagger: .02 * M(), ease: 'power2.out', onComplete: () => els.forEach(e => e.remove()) });
}
export function clearClouds() { veil().querySelectorAll('.cloud').forEach(c => gsap.to(c, { opacity: 0, duration: .5, onComplete: () => c.remove() })); }
