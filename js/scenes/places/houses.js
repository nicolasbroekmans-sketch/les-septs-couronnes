// Maison à étage où l'on entre à pied : rez-de-chaussée en pierre (porte, âtre, table, tonneaux), escalier,
// étage à colombages en encorbellement (lit, coffre), toit à deux pans, fenêtres éclairées, blason au-dessus de la porte.
// rot = quart de tour : 0 → porte vers +Z, 1 → +X, 2 → −Z, 3 → −X.
const W = 8, D = 10, F = 3.2;

export function walkHouse(ctx, x, z, rot = 0, o = {}) {
  const { mat, props: P } = ctx, y0 = ctx.engine.groundFn(x, z), fl = y0 + .12, odd = rot % 2;
  const tr = (lx, lz) => [[lx, lz], [lz, -lx], [-lx, -lz], [-lz, lx]][rot];
  const B = (w, h, d, lx, y, lz, m, opt = {}) => { const [wx, wz] = tr(lx, lz); return ctx.box(odd ? d : w, h, odd ? w : d, x + wx, y, z + wz, m, opt); };
  const stone = mat('castle_wall_slates', { uv: 3, color: o.stone ?? '#9a9a96' }), plaster = mat('plastered_wall', { uv: 3, color: o.plaster ?? '#e6dcc8' });
  const beam = mat('weathered_planks', { uv: 2, color: '#3a2a1c' }), plank = mat('weathered_planks', { uv: 2.5, color: '#8a6e50' }), roof = mat(o.roofTex ?? 'grey_roof_tiles', { uv: 3, color: o.roof ?? '#8a9098' });
  B(W + .6, 1.2, D + .6, 0, y0 - 1.1, 0, stone, { cast: false }); B(W - .4, .02, D - .4, 0, fl, 0, plank, { solid: false, cast: false });
  // rez-de-chaussée : murs de pierre, porte ouverte au centre de la façade
  B(W, F, .4, 0, fl, -D / 2, stone); B(.4, F, D, -W / 2, fl, 0, stone); B(.4, F, D, W / 2, fl, 0, stone);
  B(W / 2 - .8, F, .4, -(W / 4 + .4), fl, D / 2, stone); B(W / 2 - .8, F, .4, W / 4 + .4, fl, D / 2, stone); B(1.6, F - 2.3, .4, 0, fl + 2.3, D / 2, stone, { solid: false });
  // étage : plancher percé au-dessus de l'escalier (côté gauche), murs à colombages légèrement débordants
  B(W - 1.6, .25, D, .8, fl + F, 0, plank); B(1.6, .25, 2.6, -W / 2 + .8, fl + F, -D / 2 + 1.3, plank);
  const U = W + .5, V = D + .5, H2 = 2.8, y1 = fl + F + .25;
  B(U, H2, .3, 0, y1, -V / 2, plaster); B(U, H2, .3, 0, y1, V / 2, plaster); B(.3, H2, V, -U / 2, y1, 0, plaster); B(.3, H2, V, U / 2, y1, 0, plaster);
  for (const lx of [-U / 2, -U / 4, 0, U / 4, U / 2]) for (const lz of [-V / 2 - .05, V / 2 + .05]) B(.18, H2, .1, lx, y1, lz, beam, { solid: false });
  for (const lz of [-V / 2 - .05, V / 2 + .05]) { B(U, .18, .1, 0, y1 + H2 - .1, lz, beam, { solid: false }); B(U, .18, .1, 0, y1, lz, beam, { solid: false }); }
  // escalier le long du mur gauche, de l'entrée vers le fond
  const n = 11, rise = F / n, run = .5;
  for (let i = 0; i < n; i++) B(1.4, (i + 1) * rise, run, -W / 2 + .9, fl, D / 2 - 2 - (i + .5) * run, plank, { cast: false });
  // toit à deux pans (faîtage dans la profondeur)
  const [rx, rz] = [x, z]; ctx.roof(U + .8, 3, V + .8, rx, y1 + H2, rz, roof, { rotY: odd ? Math.PI / 2 : 0 });
  // fenêtres (cadres sombres + vitres chaudes), blason au-dessus de la porte
  const glass = mat(null, { color: '#3a2c1e', emissive: '#ff9a3a', ei: .55, rough: .3 });
  for (const lx of [-2.2, 2.2]) { B(1, 1.1, .08, lx, fl + 1.4, D / 2 + .22, glass, { solid: false }); B(1.1, 1.3, .1, lx, y1 + 1, V / 2 + .12, glass, { solid: false }); }
  for (const lz of [-2, 2]) { B(.08, 1.1, 1, W / 2 + .22, fl + 1.4, lz, glass, { solid: false }); }
  if (o.house) { const [bx, bz] = tr(0, D / 2 + .6); P.banner(x + bx, fl + 3.1, z + bz, o.house, [0, Math.PI / 2, Math.PI, -Math.PI / 2][rot], .7); }
  // mobilier : âtre et feu, table, bancs, tonneaux ; à l'étage, lit et coffre
  B(2.2, 1.4, .8, 1.5, fl, -D / 2 + .6, stone); const [hx, hz] = tr(1.5, -D / 2 + 1); ctx.fire(x + hx, fl + .3, z + hz, .5, { intensity: 14 });
  B(2.2, .8, 1.1, 1.6, fl, .4, plank); B(2, .45, .4, 1.6, fl, -.5, plank); B(2, .45, .4, 1.6, fl, 1.3, plank);
  for (const lz of [-3.6, -2.8]) { const [bx, bz] = tr(W / 2 - .8, lz); P.barrel(x + bx, z + bz); }
  B(2, .55, 1.2, 2.2, y1, -V / 2 + 1, plank); B(1.6, .2, 1, 2.2, y1 + .55, -V / 2 + 1, mat(null, { color: o.blanket ?? '#6a2a2a' }), { solid: false }); B(1, .6, .6, 2.6, y1, 2.6, plank);
  const [lx, lz] = tr(0, 0); ctx.glow(x + lx, fl + 2.6, z + lz, '#ffcf8a', 1.2); ctx.glow(x + lx, y1 + 2.2, z + lz, '#ffcf8a', 1);
  const [dx, dz] = tr(0, D / 2 + 1.4), [px, pz] = tr(-1.4, 1.5);
  if (o.name) ctx.poi(x + dx, z + dz, o.name, o.text ?? 'Une maison à étage. La porte est ouverte : entrez, l’escalier mène à l’étage.');
  (ctx.engine.rooms ??= []).push({ kind: 'house', people: o.people === 0 ? [] : [{ role: 'villager', name: o.owner ?? 'Habitant', x: x + px, z: z + pz }] });
  return { door: { x: x + dx, z: z + dz } };
}
