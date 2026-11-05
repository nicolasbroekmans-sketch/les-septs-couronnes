// Châteaunoir, détails : palissade, bâtiments de bois supplémentaires, forge de l'armurier, tour du
// Lord Commandant, cour d'entraînement, braseros, bannières noires au corbeau, réserves de bois.
export function castleBlack(ctx) {
  const { mat, props: P } = ctx;
  const wood = mat('weathered_planks', { uv: 3, color: '#8d7660' }), stone = mat('castle_wall_slates', { normal: 'castle_wall_slates_nor', uv: 5, color: '#8f969e' });
  const roof = mat('grey_roof_tiles', { uv: 3, color: '#c5ced6' });
  // palissade de pieux autour du camp (ouverte côté Mur et côté route)
  for (let a = .15; a < Math.PI * .85; a += .045) ctx.cyl(.28, 4.5, Math.cos(a) * 62, 0, -12 + Math.sin(a) * 70, wood, { seg: 6 });
  // bâtiments de bois instanciés (dortoirs, réserves, écuries)
  const lots = [[-58, -30, 8, 14], [-58, -8, 8, 12], [58, -30, 8, 14], [58, -6, 8, 12], [-20, 46, 12, 8], [22, 46, 12, 8], [-48, 32, 10, 8], [48, 32, 10, 8]]
    .map(([x, z, w, d]) => ({ x, z, w, d, h: 4 + (Math.abs(x) % 3) }));
  ctx.houses(lots, { wall: mat('weathered_planks', { uv: 3, instanced: true }), roof: mat('grey_roof_tiles', { uv: 3, instanced: true }), tints: ['#6a5a4a', '#5a4a3a', '#7a6a58'], roofTints: ['#e9eef2', '#dfe5ea'], windows: '#ffb05a', roofH: .7 });
  // tour du Lord Commandant (pierre) et tour du Roi
  ctx.tower(-24, -40, { w: 9, h: 22, mat: stone, roof });
  ctx.tower(26, -46, { w: 7, h: 28, mat: stone, round: true });
  ctx.poi(-24, -33, 'La tour du Lord Commandant', 'On y garde le corbeau qui parle et les registres de mille ans de patrouilles. La porte n’est jamais fermée ; on n’entre pourtant jamais sans frapper.');
  // forge de l'armurier
  ctx.box(9, 4, .5, 44, 0, 14, wood); ctx.roof(10, 2, 7, 44, 4, 17, roof);
  ctx.box(2.4, 1, 1.6, 42, 0, 17, stone); ctx.fire(42, 1.1, 17, .5, { intensity: 30 });
  ctx.box(.6, .8, 1, 46, 0, 18, mat(null, { color: '#2b2b2e', metal: .8, rough: .4 }));
  ctx.poi(44, 21, 'La forge de l’armurier', 'Ici on répare les épées ébréchées et les cottes déchirées. Le feu ne s’éteint jamais : le froid attendrait.');
  // cour d'entraînement, cibles, réserves
  for (let i = 0; i < 4; i++) P.target(-14 + i * 4, 26, Math.PI);
  P.woodpile(-30, 18, 0); P.woodpile(30, 26, 1.2); P.woodpile(-40, -18, .4);
  for (const [x, z] of [[-10, -14], [-9, -15], [10, -14], [36, 2], [37, 3], [-36, 2]]) P.barrel(x, z);
  for (const [x, z] of [[11, -15], [-37, 3], [38, 1]]) P.crate(x, z, 1, x);
  P.cart(-6, 50, .2);
  // bannières noires au corbeau
  for (const x of [-8, 8]) P.banner(x, 7.5, -18.8, 'garde', 0, 1.3);
  P.standard(-4, 56, 'garde', 7); P.standard(4, 56, 'garde', 7);
  for (const [x, z] of [[-44, 0], [44, -20], [0, 40]]) { ctx.box(1, 1, 1, x, 0, z, stone); ctx.fire(x, 1, z, .6, { light: false }); }
}
