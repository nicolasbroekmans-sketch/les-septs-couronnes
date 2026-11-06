// Winter Town, à l'est du château le long de la route royale (plan) : grand-rue boueuse avec flaques et lanternes,
// maisons nordiques variées (bois, chaume, pierre), maisons à étage où l'on entre, place du marché, camp de
// recrutement, palissade, panneau de la route royale.
import { walkHouse } from '../places/houses.js';

export function winterfellTown(ctx) {
  const { mat, props: P, rand } = ctx;
  const mud = mat('dirt', { uv: 5, color: '#8a7e70', rough: 1 }), wood = mat('weathered_planks', { uv: 3, color: '#b09a80' }), cloth = c => mat(null, { color: c, flat: true });
  const MK = [132, -14], CAMP = [160, -14];
  const avoid = (x, z, w = 0, d = 0) => Math.abs(z + 14) < 6 + d / 2 || Math.hypot(x - MK[0], z - MK[1]) < 17 + w / 2 || (Math.abs(x - CAMP[0]) < 15 + w / 2 && Math.abs(z - CAMP[1]) < 14 + d / 2)
    || (x < 124 + w / 2 && Math.abs(z + 14) < 22 + d / 2) || (Math.abs(x - 186) < 10 + w / 2 && Math.abs(z + 40) < 8 + d / 2) || x - w / 2 < 72 || x + w / 2 > 206;
  const city = ctx.cityGrid({ x0: 70, x1: 208, z0: -108, z1: 80, block: 14, street: 4.5, hMin: 3.4, hMax: 7, empty: .05, avoid });
  ctx.houses(city.lots, { style: 'nord', sink: 1.5 });
  for (const st of city.streets) ctx.box(st.w, .04, st.d, st.x, .01, st.z, mud, { solid: false, cast: false });
  ctx.box(150, .05, 10, 140, .02, -14, mud, { solid: false, cast: false });
  P.puddles(68, -18, 208, -10, 40);
  // maisons à étage où l'on entre à pied, de part et d'autre de la grand-rue
  const owners = ['Gage le charpentier', 'Mère Tessa', 'Vieille Nell la conteuse', 'Jory le tanneur', 'Bethany la tisserande', 'Harwin le palefrenier'];
  [82, 98, 114].forEach((x, i) => {
    walkHouse(ctx, x, -27, 0, { house: 'stark', owner: owners[i * 2], name: i ? undefined : 'Une maison de Winter Town', text: 'La porte est ouverte. En bas, l’âtre et la table ; l’escalier mène à la chambre, sous le toit.' });
    walkHouse(ctx, x, -1, 2, { house: i === 1 ? 'stark' : null, owner: owners[i * 2 + 1], blanket: '#3a4a5a' });
  });
  // place du marché
  P.market(MK[0], MK[1] - 9, 9, 6, ['#5a5f66', '#6a2a2a', '#3a4a5a', '#6a5a3a', '#2a3a2a']);
  ctx.poi(MK[0], MK[1] + 4, 'La place du marché', 'Fourrures, harengs salés, bougies de suif et rumeurs : tout se vend sur la place, même quand le vent coupe le souffle.');
  for (let x = 72; x < 206; x += 14) { P.lantern(x, -19.5); P.lantern(x + 7, -8.5); }
  for (const [x, z, a] of [[90, -10, 1.6], [145, -18, 1.4], [190, -10, 1.8]]) P.cart(x, z, a);
  P.standard(70, -22, 'stark', 7); P.standard(70, -6, 'stark', 7);
  // camp de recrutement autour du recruteur (nord de la rue) et du capitaine (sud)
  for (const [x, z, c] of [[168, -26, '#5a5f66'], [174, -20, '#6a5f50'], [168, -2, '#3a3a3e'], [175, -6, '#4a4f56']]) ctx.cone(2.4, 3, x, ctx.engine.groundFn(x, z), z, cloth(c), { seg: 6, solid: true });
  for (const x of [151, 152.4]) ctx.box(.15, 1.8, .15, x, 0, -2, wood, { solid: false });
  ctx.box(1.8, .12, .3, 151.7, 1.5, -2, wood, { solid: false });
  P.target(164, -30, 0); P.target(168, -31, 0);
  ctx.box(2.4, .9, 1.4, 152, 0, -26, wood); ctx.box(2.2, .02, 1.2, 152, .92, -26, mat(null, { color: '#d8c8a0' }), { solid: false });
  P.standard(156, -30, 'stark', 6); P.standard(156, 2, 'stark', 6); P.barrel(170, -14 + 7); P.crate(170, -14 - 7, 1, .3);
  ctx.fire(172, 0, -14 + 9, .7);
  ctx.poi(160, -14, 'Le camp de recrutement', 'Halvard engage les bras, le capitaine Rodrik les transforme en soldats. Sur la table, une carte du Bois-aux-Loups couverte de pions noirs.', { color: '#c9a227' });
  // palissade autour de la ville et panneau de la route royale
  for (const [x1, z1, x2, z2] of [[72, -110, 206, -110], [72, 82, 206, 82], [208, -110, 208, -22], [208, -6, 208, 82]]) P.fence(x1, z1, x2, z2);
  ctx.box(.2, 2.6, .2, 204, 0, -8, mat(null, { color: '#3a2a1c' }));
  ctx.box(.1, .5, 2.2, 204, 2, -9, mat('weathered_planks', { uv: 1, color: '#c8a87a' }), { solid: false });
  ctx.poi(200, -8, 'La route royale', 'Vers le sud, des centaines de lieues jusqu’à Port-Réal. Les voyageurs disent que le Nord commence là où s’arrête la route pavée.');
  ctx.poi(88, -14, 'Winter Town', 'Quand l’hiver vient, les villages vident leurs granges et montent ici, sous la protection des murs. Les maisons attendent, à moitié vides, que la neige ramène leurs familles.');
  // petits détails près des maisons
  for (let i = 0; i < city.lots.length; i += 2) {
    const l = city.lots[i], x = l.x + (rand() < .5 ? -1 : 1) * (l.w / 2 + .9), z = l.z + (rand() - .5) * l.d * .6, k = rand();
    if (k < .3) P.woodpile(x, z, Math.PI / 2); else if (k < .5) P.barrel(x, z); else if (k < .62) P.hay(x, z, .8); else if (k < .75) P.crate(x, z, .9, rand());
  }
}
