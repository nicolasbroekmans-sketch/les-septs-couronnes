// Meereen d'après la carte : pyramides des grandes familles réparties dans toute la ville (avec jardins suspendus),
// parc autour de la Grande Pyramide, remparts de briques et portes, le Skahazadhan au nord avec son pont, la baie
// des Serfs à l'ouest avec la jetée, places rondes.
export const PYRAMIDS = [[-120, -150, 34], [110, -160, 30], [-130, -60, 30], [130, -70, 32], [-120, 40, 28], [140, 80, 26], [-60, 90, 24], [70, -170, 22], [-80, -110, 22], [60, 95, 22]];
export const avoidPyr = (x, z, w = 0) => PYRAMIDS.some(([px, pz, s]) => Math.abs(x - px) < s / 2 + 4 + w / 2 && Math.abs(z - pz) < s / 2 + 4 + w / 2);

export function meereenMap(ctx) {
  const { mat, props: P, rand } = ctx;
  const bands = ['#d8b88a', '#b5634b', '#e3cf9a', '#7d8f7c', '#a4825f', '#c99a5a'], brick = mat('medieval_red_brick', { normal: 'medieval_red_brick_nor', uv: 4, color: '#d89a70' });
  const vine = mat(null, { color: '#4a6a2a', rough: 1 });
  PYRAMIDS.forEach(([x, z, s], i) => {
    let w = s, y = 0;
    for (let t = 0; t < 7; t++) { ctx.box(w, s / 9, w, x, y, z, mat('large_sandstone_blocks', { uv: 4, color: bands[(t + i) % bands.length] })); if (t % 2) for (const sd of [-1, 1]) ctx.box(w * .8, .6, .8, x, y + s / 9, z + sd * (w / 2 - .4), vine, { solid: false }); y += s / 9; w -= s / 8; }
    ctx.cone(w * .7, s / 5, x, y, z, mat(null, { color: '#c8a040', metal: .6, rough: .35 }), { seg: 4 });
  });
  // parc de la Grande Pyramide
  ctx.box(150, .06, 150, 0, .03, -130, mat('grass_ground', { uv: 5, color: '#b8c890' }), { solid: false, cast: false });
  const park = []; for (let k = 0; k < 60; k++) { const a = rand() * 6.28, r = 66 + rand() * 8; park.push([Math.cos(a) * r, -130 + Math.sin(a) * r, .9 + rand() * .3]); }
  ctx.trees(park.filter(([x, z]) => z < -60 || Math.abs(x) > 14), 'palm', { leaf: '#5f7d3a', trunk: '#8a6a44' });
  // remparts et portes
  for (const [x0, z0, x1, z1, out] of [[-178, -218, 178, -218, [0, -1]], [-178, 118, 178, 118, [0, 1]], [178, -218, 178, 118, [1, 0]], [-178, -218, -178, 118, [-1, 0]]]) {
    const vert = x0 === x1, len = vert ? z1 - z0 : x1 - x0, mid = vert ? (z0 + z1) / 2 : (x0 + x1) / 2;
    for (const [a, b] of [[0, len / 2 - 6], [len / 2 + 6, len]]) ctx.wall(vert ? x0 : x0 + a, vert ? z0 + a : z0, vert ? x0 : x0 + b, vert ? z0 + b : z0, { h: 12, t: 4, mat: brick, outward: out });
    for (const s of [-1, 1]) ctx.tower(vert ? x0 : mid + s * 9, vert ? mid + s * 9 : z0, { w: 9, h: 18, mat: brick });
  }
  for (const [x, z] of [[-178, -218], [178, -218], [-178, 118], [178, 118]]) ctx.tower(x, z, { w: 12, h: 20, mat: brick });
  // le Skahazadhan au nord, la baie à l'ouest, la jetée
  ctx.water({ y: -.5, z: -250, w: 900, d: 40, color: '#3a7a7a' });
  ctx.box(12, 1.2, 46, 0, -.6, -250, mat('large_sandstone_blocks', { uv: 3, color: '#d9bd8e' }));
  ctx.water({ reflect: true, y: -.5, x: -420, w: 440, d: 900, color: '#2a5a6a' });
  ctx.box(60, 1.2, 10, -210, -.6, -40, mat('large_sandstone_blocks', { uv: 3, color: '#d9bd8e' }));
  ctx.poi(0, -228, 'Le Skahazadhan', 'Le fleuve marque la limite nord de la ville. De l’autre côté, les pêcheurs ont leurs huttes et les esclaves libérés leurs campements.', { color: '#8fd0d0' });
  ctx.poi(-190, -34, 'La jetée de la baie des Serfs', 'Les galères de Qarth et de Volantis y déchargent épices et soieries. Autrefois, elles déchargeaient des hommes enchaînés.');
}
