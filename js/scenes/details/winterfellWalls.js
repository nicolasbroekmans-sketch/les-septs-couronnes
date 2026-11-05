// Winterfell, remparts d'après le plan : enceinte extérieure (12 m) et intérieure (16 m), douves gelées à l'ouest
// et à l'est, quatre portes alignées (N, E, S, O « porte du Chasseur »), tours intermédiaires, ponts, herses,
// têtes de loup, bannières grises au loup, chemin de ronde accessible par un escalier, vapeur des sources chaudes.
export const OUT = [-64, -72, 64, 40], IN = [-50, -60, 50, 28], GATES = { N: -22, S: 0, E: -14, O: -4 };

export function winterfellWalls(ctx) {
  const { mat, props: P } = ctx;
  const outer = mat('old_stone_wall', { normal: 'old_stone_wall_nor', uv: 5, color: '#b4b6b8' }), inner = mat('castle_wall_slates', { normal: 'castle_wall_slates_nor', uv: 5, color: '#9a9ea4' });
  const slate = mat('grey_roof_01', { uv: 2, color: '#7a828c' }), iron = mat(null, { color: '#2e2e32', metal: .8, rough: .45 });
  enclosure(ctx, OUT, { h: 12, t: 3, mat: outer, towerW: 9, towerExtra: 6, mid: 32, roof: slate });
  enclosure(ctx, IN, { h: 16, t: 3.5, mat: inner, towerW: 10, towerExtra: 7, mid: 0 });
  // douves gelées (ouest et est) et ponts devant les portes
  const ice = mat(null, { color: '#a9c8d8', rough: .12, metal: .1 }), plank = mat('medieval_wood', { uv: 2, color: '#8a7058' });
  for (const x of [-57, 57]) { ctx.box(11, .05, 86, x, .03, -16, ice, { solid: false, cast: false }); ctx.mapMark(x - 5.5, -59, x + 5.5, 27, '#a9c7d6'); }
  for (const x of [-57, 57]) { const z = x < 0 ? GATES.O : GATES.E; ctx.box(12, .35, 7, x, .05, z, plank, { solid: false }); for (const s of [-1, 1]) ctx.box(12, .9, .2, x, .35, z + s * 3.4, plank, { solid: false }); }
  ctx.poi(-57, 20, 'Les douves', 'Entre les deux enceintes court un fossé d’eau, gelé neuf mois sur dix. Les sources chaudes l’empêchent parfois de prendre — mais l’été est une légende, au Nord.', { color: '#9fc4d6' });
  // herses et têtes de loup aux quatre portes de l'enceinte extérieure
  const gates = [[GATES.N, OUT[1], 0], [GATES.S, OUT[3], 0], [OUT[2], GATES.E, 1], [OUT[0], GATES.O, 1]];
  for (const [gx, gz, vert] of gates) {
    for (let k = -3.5; k <= 3.5; k += .7) ctx.box(vert ? .5 : .12, 3.2, vert ? .12 : .5, gx + (vert ? 0 : k), 8.5, gz + (vert ? k : 0), iron, { solid: false });
    for (const s of [-1, 1]) { const x = gx + (vert ? 0 : s * 7.2), z = gz + (vert ? s * 7.2 : 0); ctx.box(1.4, 1.2, 1.4, x, 10.4, z, outer, { solid: false }); for (const e of [-.4, .4]) ctx.cone(.22, .6, x + (vert ? 0 : e), 11.6, z + (vert ? e : 0), outer, { seg: 4 }); }
  }
  // bannières au loup sur la face est (côté route royale) et sud
  for (let z = -60; z <= 30; z += 15) if (Math.abs(z - GATES.E) > 9) P.banner(OUT[2] + 1.7, 11.2, z, 'stark', Math.PI / 2, 2.2);
  for (let x = -54; x <= 54; x += 18) if (Math.abs(x - GATES.S) > 9) P.banner(x, 11.2, OUT[3] + 1.7, 'stark', 0, 2.2);
  for (let z = -52; z <= 22; z += 18) if (Math.abs(z - GATES.E) > 9) P.banner(IN[2] + 2, 15, z, 'stark', Math.PI / 2, 1.8);
  ctx.poi(74, GATES.E + 6, 'La porte de l’Est', 'La grande porte qui donne sur la route royale et sur Winter Town. Deux têtes de loup gardent la herse ; au-dessus, les bannières grises claquent dans le vent. Ici commence le Nord.', { color: '#c8d0d8' });
  ctx.poi(GATES.N, OUT[1] - 8, 'La porte du Nord', 'Elle ouvre sur les terres sauvages et le Bois-aux-Loups. On la ferme à la nuit tombée, et personne ne discute.');
  ctx.poi(OUT[0] - 8, GATES.O + 6, 'La porte du Chasseur', 'Les chasseurs du château passent par ici, avec les chiens. Le Bois-aux-Loups commence à cent pas.');
  // chemin de ronde de l'enceinte intérieure (escalier le long du mur est)
  ctx.stairs(IN[2] - 3, 0, IN[3] - 3, { dir: 'N', n: 53, rise: .3, run: .45, w: 2.6, mat: inner });
  ctx.poi(IN[2] - 4, IN[3] - 5, 'Le chemin de ronde', 'Montez : depuis les créneaux, on voit Winter Town fumer sous la neige et, par temps clair, la ligne sombre du Bois-aux-Loups.');
  for (const [x, z] of [[-50, -40], [50, -40], [-20, 28], [30, -60], [50, 10]]) ctx.emitter('steam', x, 10, z, { box: [10, 8, 3], count: 30, opacity: .16 });
}

/** Enceinte rectangulaire avec une porte par côté (positions GATES), tours d'angle, de porte et intermédiaires. */
function enclosure(ctx, [x0, z0, x1, z1], o) {
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, hw = 4.5, T = (x, z, w, h) => ctx.tower(x, z, { w, h, mat: o.mat, roof: o.roof, roofH: w * .9 });
  const seg = (ax, az, bx, bz) => ctx.wall(ax, az, bx, bz, { h: o.h, t: o.t, mat: o.mat, outward: [(ax + bx) / 2 - cx, (az + bz) / 2 - cz] });
  const run = (ax, az, bx, bz, g) => {
    const vert = ax === bx, a = vert ? az : ax, b = vert ? bz : bx, P = t => vert ? [ax, t] : [t, az];
    const cuts = [[a, g - hw], [g + hw, b]];
    for (const [s, e] of cuts) {
      seg(...P(s), ...P(e));
      if (o.mid) for (let t = s + o.mid; t < e - o.mid / 2; t += o.mid) T(...P(t), 6, o.h + 3);
    }
    for (const s of [-1, 1]) T(...P(g + s * (hw + 2.6)), 6.5, o.h + 5);
    ctx.box(vert ? o.t : hw * 2, 3, vert ? hw * 2 : o.t, P(g)[0], o.h - 3, P(g)[1], o.mat, { solid: false });
  };
  run(x0, z0, x1, z0, GATES.N); run(x0, z1, x1, z1, GATES.S); run(x1, z0, x1, z1, GATES.E); run(x0, z0, x0, z1, GATES.O);
  for (const [x, z] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]) T(x, z, o.towerW, o.h + o.towerExtra);
}
