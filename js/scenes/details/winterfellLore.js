// Winterfell, compléments fidèles à la série : la Tour brisée (sommet effondré, éboulis) et le camp de recrutement de Winter Town (tentes, râteliers, mannequins, table de guerre).
export function winterfellLore(ctx) {
  const { mat, props: P, rand } = ctx;
  const dark = mat('castle_wall_slates', { uv: 4, color: '#8d9298' }), wood = mat('weathered_planks', { uv: 3, color: '#b09a80' });
  const cloth = c => mat(null, { color: c, flat: true });
  // Tour brisée : créneaux déchiquetés et pierres tombées au pied
  for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28, hh = 1 + rand() * 4.5; ctx.box(1.6, hh, 1, -30 + Math.cos(a) * 3.5, 22, Math.sin(a) * 3.5, dark, { rotY: -a, solid: false }); }
  for (let i = 0; i < 10; i++) ctx.box(.6 + rand(), .5 + rand() * .6, .6 + rand(), -25.5 + rand() * 2.5, 0, -4 + rand() * 8, dark, { rotY: rand() * 3, solid: false });
  ctx.poi(-24.5, 3, 'La Tour brisée', 'La foudre l’a frappée il y a cent ans ; le feu a dévoré l’étage du haut. Personne ne l’a jamais réparée. Les corbeaux, eux, l’adorent.');
  // Camp de recrutement (entrée de Winter Town, autour du recruteur et du capitaine)
  for (const [x, z, c] of [[16, 128, '#5a5f66'], [21, 124, '#6a5f50'], [-16, 128, '#3a3a3e']]) ctx.cone(2.4, 3, x, ctx.engine.groundFn(x, z), z, cloth(c), { seg: 6, solid: true });
  for (const x of [12, 13.4]) ctx.box(.15, 1.8, .15, x, 0, 121, wood, { solid: false });
  ctx.box(1.8, .12, .3, 12.7, 1.5, 121, wood, { solid: false });
  for (let i = 0; i < 4; i++) ctx.cyl(.03, 2.3, 12.1 + i * .38, 0, 121.25, mat(null, { color: '#6a5a40' }), { seg: 4, solid: false });
  P.target(14, 131, Math.PI); P.target(18, 132, Math.PI);
  ctx.box(2.4, .9, 1.4, -12, 0, 121, wood); ctx.box(2.2, .02, 1.2, -12, .92, 121, mat(null, { color: '#d8c8a0' }), { solid: false });
  P.standard(-14, 126, 'stark', 6); P.standard(14, 126, 'stark', 6); P.barrel(19, 128); P.crate(-18, 124, 1, .3);
  ctx.poi(0, 128, 'Le camp de recrutement', 'Halvard engage les bras, le capitaine Rodrik les transforme en soldats. Sur la table, une carte du Bois-aux-Loups couverte de pions noirs.', { color: '#c9a227' });
}
