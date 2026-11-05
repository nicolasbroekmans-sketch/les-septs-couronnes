// Voyages entre les lieux : distance sur la carte du monde → or (vivres, escorte, passage) et heures de route.
// Traverser la mer Étroite (Westeros ↔ Essos) se fait en bateau : plus cher, mais pas plus long.
import { PLACES } from '../data/places.js';

const byId = id => PLACES.find(p => p.id === id);
export function travelCost(from, to) {
  const a = byId(from), b = byId(to); if (!a || !b) return { gold: 0, hours: 0, sea: false };
  const d = Math.hypot(a.x - b.x, a.y - b.y), sea = a.continent !== b.continent;
  return { gold: Math.round(5 + d / 25 + (sea ? 40 : 0)), hours: Math.max(2, Math.round(d / 18)), sea };
}
/** Lieux joignables depuis `from`, triés du plus proche au plus lointain. */
export function destinations(from) {
  return PLACES.filter(p => p.id !== from).map(p => ({ place: p, ...travelCost(from, p.id) })).sort((x, y) => x.hours - y.hours);
}
