// Fonctions utilitaires partagées par les lieux légers.
export const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const noise = (x, z) => Math.sin(x * .07) * Math.cos(z * .06) * 2 + Math.sin(x * .19 + z * .13) * .8;
