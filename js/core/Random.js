// Générateur pseudo-aléatoire déterministe (mulberry32) : reproductible pour les tests et l'entraînement.
export function createRng(seed = 1) {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  next.range = (a, b) => a + next() * (b - a);
  next.int = (a, b) => Math.floor(next.range(a, b + 1));
  next.pick = arr => arr[Math.floor(next() * arr.length)];
  next.chance = p => next() < p;
  return next;
}
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
