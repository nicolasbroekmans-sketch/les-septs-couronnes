// Winter Town agrandie : place du marché, puits, charrettes, clôtures, bois, lanternes, étendards, panneau.
export function winterfellTown(ctx, lots) {
  const P = ctx.props, r = ctx.rand;
  P.market(0, 98, 9, 6, ['#5a5f66', '#6a2a2a', '#3a4a5a', '#6a5a3a', '#2a3a2a']);
  ctx.poi(0, 104, 'La place du marché', 'Fourrures, harengs salés, bougies de suif et rumeurs : tout se vend sur la place, même quand le vent coupe le souffle.');
  for (let z = 40; z < 165; z += 14) { P.lantern(-6, z); P.lantern(6, z + 7); }
  for (const [x, z, a] of [[-4, 60, .2], [4.5, 130, -.1], [-4.5, 150, .3]]) P.cart(x, z, a);
  P.standard(-8, 30, 'stark', 7); P.standard(8, 30, 'stark', 7);
  // petits détails près des maisons (bois, tonneaux, foin, clôtures)
  for (let i = 0; i < lots.length; i += 2) {
    const l = lots[i], side = r() < .5 ? -1 : 1, x = l.x + side * (l.w / 2 + .9), z = l.z + (r() - .5) * l.d * .6;
    const k = r();
    if (k < .3) P.woodpile(x, z, Math.PI / 2); else if (k < .5) P.barrel(x, z); else if (k < .62) P.hay(x, z, .8); else if (k < .75) P.crate(x, z, .9, r());
  }
  for (const [x1, z1, x2, z2] of [[-110, 172, -30, 172], [30, 172, 110, 172], [-112, 36, -112, 170], [112, 36, 112, 170]]) P.fence(x1, z1, x2, z2);
  // panneau indicateur vers la route royale
  ctx.box(.2, 2.6, .2, 9, ctx.engine.groundFn(9, 170), 170, ctx.mat(null, { color: '#3a2a1c' }));
  ctx.box(2.2, .5, .1, 10, ctx.engine.groundFn(9, 170) + 2, 170, ctx.mat('weathered_planks', { uv: 1, color: '#c8a87a' }), { solid: false });
  ctx.poi(9, 166, 'La route royale', 'Vers le sud, des centaines de lieues jusqu’à Port-Réal. Les voyageurs disent que le Nord commence là où s’arrête la route pavée.');
}
