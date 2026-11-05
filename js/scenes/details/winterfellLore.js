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
  // Porte sud : herse relevée, têtes de loup, grandes bannières sur le rempart extérieur, vapeur des sources dans les murs
  const iron = mat(null, { color: '#2e2e32', metal: .8, rough: .45 }), grey = mat('castle_wall_slates', { uv: 3, color: '#8d9298' });
  for (let k = -3.5; k <= 3.5; k += .7) ctx.box(.12, 3.2, .12, k, 6.5, 25.2, iron, { solid: false });
  for (let y = 6.8; y < 9.6; y += .8) ctx.box(7.4, .12, .12, 0, y, 25.2, iron, { solid: false });
  for (const s of [-1, 1]) { const x = s * 6.8; ctx.box(1.4, 1.2, .8, x, 7, 26.9, grey, { solid: false }); for (const e of [-.4, .4]) ctx.cone(.22, .6, x + e, 8.2, 26.9, grey, { seg: 4 }); ctx.box(.5, .4, .6, x, 6.9, 27.4, grey, { solid: false }); }
  for (let x = -45; x <= 45; x += 15) if (Math.abs(x) > 8) P.banner(x, 9.4, 26.7, 'stark', 0, 2.1);
  for (const [x, z] of [[-30, 25], [30, 25], [-55, -30], [55, -30], [0, -85]]) ctx.emitter('steam', x, 8, z, { box: [10, 8, 3], count: 30, opacity: .18 });
  ctx.poi(0, 30, 'La porte de Winterfell', 'Deux têtes de loup gardent la herse. Au-dessus, sur le rempart, les bannières grises claquent dans le vent : ici commence le Nord.', { color: '#c8d0d8' });
  // Tour de la bibliothèque
  ctx.tower(32, -32, { w: 6, h: 20, mat: grey, round: true, roof: mat('grey_roof_tiles', { uv: 2, color: '#8a9298' }), roofH: 7 });
  ctx.poi(32, -27.5, 'La tour de la bibliothèque', 'Des rayonnages jusqu’au toit, des cartes du Nord et des chroniques que personne n’a lues depuis cent ans. Le mestre y monte chaque soir.');
  // Grand Donjon : rangées de fenêtres, cheminées ; Grand Hall : contreforts et portail ; chemin de ronde en bois ; arches de la cour
  const win = mat(null, { color: '#1a1612', emissive: '#ff9a3a', ei: .35 }), timber = mat('medieval_wood', { uv: 2, color: '#6a5440' });
  for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) ctx.box(1.1, 1.8, .25, -18.5 + k * 4.2, 4 + r * 4.8, -42.9, win, { solid: false });
  for (const x of [-16, -2, 2]) ctx.box(1.4, 6, 1.4, x, 22, -52, grey);
  for (let z = -52; z <= -28; z += 6) for (const s of [-1, 1]) ctx.box(1.2, 8, 2.4, 18 + s * 7.6, 0, z, grey);
  ctx.box(5, 6, .8, 18, 0, -24.9, grey, { solid: false }); ctx.box(3.6, 4.6, .3, 18, 0, -24.4, mat('medieval_wood', { uv: 2, color: '#3a2a1c' }), { solid: false });
  for (let x = -30; x <= 30; x += .9) { if (Math.abs(x) < 4.5) continue; ctx.box(.9, .15, 1.8, x, 9.6, 5.4, timber, { solid: false }); if (Math.round(x / .9) % 3 === 0) ctx.box(.12, 1.1, .12, x, 9.75, 4.6, timber, { solid: false }); }
  for (let x = -30; x <= 30; x += 6) if (Math.abs(x) > 4.5) ctx.box(.25, 9.6, .25, x, 0, 6, timber, { solid: false });
  for (const [x, z] of [[-14, -6], [14, -6]]) { ctx.box(1.2, 5, 1.2, x - 2.6, 0, z, grey); ctx.box(1.2, 5, 1.2, x + 2.6, 0, z, grey); ctx.box(6.4, 1.2, 1.2, x, 5, z, grey, { solid: false }); }
  ctx.poi(0, -4, 'La cour d’honneur', 'Les arches de pierre, le chemin de ronde en bois au-dessus, les cris des écuyers à l’entraînement : le cœur de Winterfell bat ici.');
}
