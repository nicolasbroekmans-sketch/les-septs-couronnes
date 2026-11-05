// Outils partagés par les données de région : apparences variées, villageois, camps.
const SKIN = ['#e6c4a8', '#d8b49a', '#c4987a', '#a87a5a', '#8a5e42', '#f0d4bc'];
const HAIR = ['#1e1612', '#3a2a1e', '#5a3a22', '#8a6a3a', '#b89a6a', '#6a6a6a', '#a04a22'];
let n = 7;
const r = () => ((n = (n * 16807) % 2147483647) / 2147483647);
const pick = a => a[Math.floor(r() * a.length)];

export function look(o = {}) {
  const female = o.female ?? r() < .4;
  return { skin: pick(SKIN), hair: pick(HAIR), tunic: pick(o.tunics ?? ['#5a3a2a', '#4a4a3a', '#6a5a3a', '#3a4a5a', '#5a2a2a']), pants: pick(['#3a3028', '#2a2a2a', '#4a3a2a']),
    beard: !female && r() < .5, female, height: .94 + r() * .1, hairStyle: female ? pick(['long', 'long', 'tresse', 'queue']) : pick(['court', 'court', 'queue', 'chauve', 'long']), ...o };
}

/** Villageois : journée sur une place, nuit à la maison (caché à l'intérieur). */
export function townsfolk(prefix, count, day, nights, lines, faction = 'peuple') {
  return Array.from({ length: count }, (_, i) => {
    const d = day[i % day.length], h = nights[i % nights.length];
    return { id: `${prefix}_${i}`, name: pick(['Passant', 'Passante', 'Marchand ambulant', 'Lavandière', 'Porteur', 'Gamin des rues', 'Vieil homme']), role: 'villager', faction, weapon: 'poings', hp: 40,
      x: d[0] + (r() - .5) * 4, z: d[1] + (r() - .5) * 4, barks: lines, look: look(),
      ai: { schedule: [{ from: 6, to: 20.5, at: d, wander: 7 }, { from: 20.5, to: 6, at: h, hide: true }], morale: .1, aggression: .1, canSurrender: true, surrenderAlways: true } };
  });
}

/** Camp : tentes, feu, palissade basse, caisses. */
export function camp(ctx, x, z, o = {}) {
  const { mat } = ctx, g = ctx.engine.groundFn, wood = mat('weathered_planks', { uv: 2, color: '#8a6a4a' }), cloth = mat(null, { color: o.cloth ?? '#6a5a44', flat: true, rough: 1 });
  for (let i = 0; i < (o.tents ?? 3); i++) {
    const a = i / (o.tents ?? 3) * Math.PI * 2 + .4, tx = x + Math.cos(a) * 7, tz = z + Math.sin(a) * 7;
    ctx.cone(2.4, 3, tx, g(tx, tz), tz, cloth, { seg: 6, solid: true });
  }
  ctx.box(1.2, .3, 1.2, x, g(x, z), z, mat('volcanic_rock_tiles', { uv: 2 }), { solid: false });
  ctx.fire(x, g(x, z) + .3, z, .8, { intensity: 26 });
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * Math.PI * 2; if (Math.abs(a - (o.gap ?? Math.PI / 2)) < .5) continue;
    const px = x + Math.cos(a) * 13, pz = z + Math.sin(a) * 13;
    ctx.cyl(.18, 2.2, px, g(px, pz) - .2, pz, wood, { seg: 6 });
  }
  for (let i = 0; i < 4; i++) ctx.box(1, .8, 1, x - 3 + i * 1.6, g(x - 3 + i * 1.6, z - 4), z - 4, wood);
}
