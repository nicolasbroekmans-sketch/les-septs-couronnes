// Braavos, d'après la carte : l'Île des Dieux au centre (temples et jardins), le Palais du Seigneur de la Mer et le
// Port Pourpre au nord-est, la Ville Noyée à l'ouest, le Marché aux poissons au sud, l'aqueduc d'eau douce qui
// arrive du sud, l'anneau d'îles boisées qui ferme la lagune.
import { dome } from '../places/kit.js';

export async function braavosMap(ctx, gods) {
  const { mat, props: P, rand } = ctx;
  const stone = mat('old_stone_wall', { uv: 4, color: '#a8a296' }), marble = mat('marble_01', { uv: 5, color: '#ece6dc' }), green = mat('grass_ground', { uv: 4, color: '#a8b890' });
  const copper = mat(null, { color: '#5a9a8a', metal: .5, rough: .4 }), purple = mat(null, { color: '#6a2a7a', rough: .9 });
  // Île des Dieux : pelouse, temples (dômes, colonnades), arbres
  const { cx, cz } = gods;
  ctx.box(26, .06, 24, cx, 1.53, cz, green, { solid: false, cast: false });
  for (const [dx, dz, r, col] of [[-6, -5, 4, copper], [6, 5, 3.4, mat(null, { color: '#c8a040', metal: .6, rough: .3 })], [7, -6, 2.8, marble]]) { ctx.cyl(r, 5, cx + dx, 1.5, cz + dz, marble, { seg: 16 }); dome(ctx, cx + dx, 6.5, cz + dz, r, col, { spire: col }); }
  for (let k = 0; k < 6; k++) ctx.cyl(.4, 5, cx - 9 + k * 1.6, 1.5, cz + 7, marble, { seg: 8 });
  const tr = []; for (let k = 0; k < 18; k++) tr.push([cx + (rand() - .5) * 24, cz + (rand() - .5) * 22, .6 + rand() * .4]); ctx.trees(tr.filter(([x, z]) => Math.hypot(x - cx + 6, z - cz + 5) > 5 && Math.hypot(x - cx - 6, z - cz - 5) > 4.5), 'round', { leaf: '#4a7a3a' });
  ctx.poi(cx, cz + 13, 'L’Île des Dieux', 'Ici, chaque dieu a son temple : le Lion de la Nuit, le Seigneur de Lumière, la Mère Rhoyne, le Dieu Pâle… À Braavos, on prie qui l’on veut, tant qu’on paie ses dettes.', { color: '#c8e0a0' });
  // Palais du Seigneur de la Mer (nord-est) sur sa plate-forme
  ctx.box(46, 5, 26, 100, -3.5, -156, stone);
  ctx.box(34, 12, 14, 100, 1.5, -158, marble); for (const s of [-1, 1]) { ctx.cyl(3.4, 18, 100 + s * 19, 1.5, -158, marble, { seg: 14 }); dome(ctx, 100 + s * 19, 19.5, -158, 3.6, copper, { spire: copper }); }
  dome(ctx, 100, 13.5, -158, 7, copper, { spire: copper });
  for (let k = -5; k <= 5; k++) ctx.cyl(.45, 9, 100 + k * 3, 1.5, -150, marble, { seg: 8 });
  ctx.poi(100, -140, 'Le Palais du Seigneur de la Mer', 'Le Seigneur de la Mer y donne des banquets où l’on sert des plats que personne n’a jamais vus. Ses zèbres et ses girafes errent dans les jardins.', { color: '#8fd0c0' });
  // Port Pourpre (nord) : quais et navires aux voiles pourpres
  ctx.box(60, 1.4, 8, 40, -.5, -150, mat('weathered_planks', { uv: 3, color: '#8a6e52' }));
  const ship = await ctx.gltf('ship');
  [[20, -162, 1.5], [44, -164, 1.6], [66, -161, 1.4]].forEach(([x, z, r], i) => { const s = ship.clone(); s.position.set(x, -.9, z); s.rotation.y = r; s.traverse(o => { if (o.isMesh && o.material?.color && o.material.color.getHSL({}).l > .7) { o.material = o.material.clone(); o.material.color.set('#7a3a8a'); } }); ctx.add(s); ctx.update(t => (s.position.y = -.9 + Math.sin(t * .7 + i) * .2)); });
  ctx.poi(40, -143, 'Le Port Pourpre', 'Le port des navires braaviens : coques violettes, voiles pourpres. Les étrangers, eux, doivent mouiller au Port du Chiffonnier.', { color: '#c8a0e0' });
  // Ville Noyée (ouest) : maisons et tours à moitié englouties
  for (let k = 0; k < 14; k++) { const x = -132 + rand() * 6, z = -150 + k * 16 + rand() * 4, h = 2 + rand() * 5; ctx.box(5 + rand() * 3, h + 4, 5, x, -4, z, stone, { rotY: (rand() - .5) * .3, solid: false }); if (rand() < .5) ctx.roof(6, 2, 6, x, h, z, mat('red_slate_roof_tiles_01', { uv: 2, color: '#8a6a5a' }), { rotY: rand() }); }
  for (const z of [-90, -20]) ctx.tower(-136, z, { w: 5, h: 12, y: -3, mat: stone, round: true });
  ctx.poi(-118, -60, 'La Ville Noyée', 'Un quartier entier s’est enfoncé dans la lagune. Les toits affleurent à marée basse ; les enfants y plongent pour trouver des pièces, et parfois pire.');
  // Marché aux poissons (sud), relié par une passerelle
  ctx.box(36, 5, 18, 26, -3.5, 63, stone); ctx.box(4, .3, 12, 26, 1.4, 50, mat('weathered_planks', { uv: 2, color: '#8a6e52' }));
  P.market(26, 63, 7, 6, ['#3a6a8a', '#8a3a3a', '#6a6a3a', '#3a5a4a']);
  for (let k = 0; k < 10; k++) P.barrel(10 + k * 3.4, 70.5);
  ctx.poi(26, 56, 'Le Marché aux poissons', 'Anguilles, huîtres, crabes et poulpes. Les poissonnières de Braavos ont la langue plus acérée que les épées des spadassins.', { color: '#8fc0e0' });
  // aqueduc d'eau douce arrivant du sud
  for (let z = 72; z < 420; z += 12) { ctx.box(3, 16, 3, -30, -4, z, stone); ctx.box(3.2, 2.4, 12, -30, 12, z + 6, stone, { solid: false }); }
  ctx.poi(-24, 80, 'L’aqueduc d’eau douce', 'L’eau douce arrive du continent sur des arches de pierre. Sans lui, Braavos boirait la lagune ; avec lui, elle boit du vin.');
  // anneau d'îles boisées autour de la lagune
  const ring = []; for (let k = 0; k < 220; k++) { const a = rand() * 6.28, x = Math.cos(a) * (300 + rand() * 40), z = -160 + Math.sin(a) * (300 + rand() * 40); if (Math.abs(x) > 60 || z > -300) ring.push([x, z, 1 + rand()]); }
  ctx.trees(ring, 'round', { leaf: '#3a5a3a' });
  for (let k = 0; k < 16; k++) { const a = k / 16 * 6.28; if (Math.abs(Math.cos(a)) < .2 && Math.sin(a) < 0) continue; ctx.cyl(40, 6, Math.cos(a) * 320, -5, -160 + Math.sin(a) * 320, mat('rock_face', { uv: 8, color: '#6a6a5a' }), { seg: 9, solid: false }); }
}
