// Winterfell, compléments d'après les sources : passerelle couverte entre le Grand Donjon et l'armurerie, chemin de
// ronde en bois de l'enceinte intérieure, cimetière du Premier Donjon, trois bassins chauds sous la maison des hôtes,
// mare noire au pied du barral, cour d'entraînement et lices, roukerie du mestre (corbeaux), auberge de la Bûche
// Fumante à Winter Town, ponts couverts, galeries chauffées par les sources.
export function winterfellMore(ctx) {
  const { THREE, mat, props: P, rand } = ctx;
  const stone = mat('castle_wall_slates', { uv: 4, color: '#a8acb0' }), timber = mat('medieval_wood', { uv: 2, color: '#6a5440' }), slate = mat('grey_roof_01', { uv: 3, color: '#8a929a' });
  const dark = mat('old_stone_wall', { uv: 3, color: '#7a7e82' }), water = mat(null, { color: '#2a4a48', rough: .05, metal: .3 });
  // passerelle couverte Grand Donjon (26,-24) → armurerie (2,-30)
  ctx.box(15, .4, 2.4, 10.5, 9.5, -27, timber, { solid: false }); ctx.box(15, 2, .15, 10.5, 9.9, -28.2, timber, { solid: false }); ctx.box(15, 2, .15, 10.5, 9.9, -25.8, timber, { solid: false });
  ctx.roof(3, 1.2, 15.4, 10.5, 11.9, -27, slate, { rotY: Math.PI / 2 }); for (let x = 4; x <= 16; x += 6) ctx.box(.4, 9.5, .4, x, 0, -27, timber);
  ctx.poi(10, -21, 'La passerelle couverte', 'Elle relie le Grand Donjon à l’armurerie au-dessus de la cour. Par sa fenêtre, on voit tout ce qui se passe en bas — les enfants Stark le savent bien.');
  // chemin de ronde en bois le long de l'enceinte intérieure (côtés sud et ouest)
  for (let x = -46; x <= 46; x += 1) { if (Math.abs(x) < 6) continue; ctx.box(1, .15, 2, x, 12.6, 25.5, timber, { solid: false, cast: false }); if (x % 4 === 0) ctx.box(.15, 12.6, .15, x, 0, 24.6, timber, { solid: false }); }
  for (let z = -56; z <= 24; z += 1) { if (Math.abs(z + 4) < 6) continue; ctx.box(2, .15, 1, -47.5, 12.6, z, timber, { solid: false, cast: false }); if (z % 4 === 0) ctx.box(.15, 12.6, .15, -46.6, 0, z, timber, { solid: false }); }
  // cimetière du Premier Donjon
  for (let i = 0; i < 12; i++) { const x = 40 + (i % 4) * 2.4, z = -34 + Math.floor(i / 4) * 2.2; ctx.box(.7, .9 + rand() * .5, .2, x, 0, z, dark, { rotY: (rand() - .5) * .3 }); }
  ctx.poi(44, -30, 'Le cimetière du Premier Donjon', 'De vieilles pierres penchées, aux noms effacés. Les Stark n’y reposent pas — ils ont les cryptes — mais leurs fidèles, si.');
  // trois bassins chauds sous les fenêtres de la maison des hôtes
  for (let k = 0; k < 3; k++) { const x = -16 + k * 4.4, z = -14; const p = new THREE.Mesh(new THREE.CircleGeometry(1.7, 20), water.clone()); p.material.color.set('#3b6f6a'); p.rotation.x = -Math.PI / 2; p.position.set(x, .07, z); ctx.add(p); ctx.emitter('steam', x, 0, z, { box: [3, 4, 3], count: 25, opacity: .3 }); }
  ctx.poi(-12, -11, 'Les bassins de la maison des hôtes', 'Trois petits bassins nourris par une source chaude, sous les fenêtres des invités. L’hiver, on y voit fumer l’eau comme une marmite.');
  // mare noire au pied du barral
  const mare = new THREE.Mesh(new THREE.CircleGeometry(3, 24), new THREE.MeshStandardMaterial({ color: '#0e1414', roughness: .02, metalness: .4 })); mare.rotation.x = -Math.PI / 2; mare.position.set(-32, .06, -17); ctx.add(mare);
  ctx.poi(-36, -12, 'La mare noire', 'Au pied de l’arbre-cœur, une eau froide et noire où Lord Stark vient nettoyer sa grande épée, Glace, après chaque exécution.');
  // cour d'entraînement : lices, râtelier, mannequins, bottes de paille
  P.fence(-14, 2, -5, 2); P.fence(-14, 11, -5, 11);
  for (let k = 0; k < 5; k++) ctx.box(.06, 2.2, .06, -14 + k * .35, 0, 6, mat(null, { color: '#7a6a50' }), { solid: false });
  ctx.box(2, .15, .3, -13.3, 1.8, 6, timber, { solid: false }); P.hay(-15, 9); P.hay(14, 4, .8);
  ctx.poi(0, 7, 'La cour d’entraînement', 'Les fils Stark y apprennent l’épée sous l’œil du maître d’armes, et les filles parfois aussi, quand il regarde ailleurs. Les flèches se plantent dans les cibles… ou à côté.');
  // roukerie : corbeaux posés sur la tourelle du mestre et sur la tour brisée
  const crowM = mat(null, { color: '#101012', rough: .6 });
  for (const [x, y, z] of [[-44, 18.4, 18], [-43, 18.4, 19.5], [14, 24.4, -60], [16, 24.6, -64], [12, 24.4, -65], [-45, 18.4, 16.8]]) { ctx.box(.25, .25, .5, x, y, z, crowM, { solid: false }); ctx.cone(.06, .2, x, y + .15, z + .3, crowM, { seg: 3, rotY: 0, solid: false }); }
  ctx.poi(-42, 25, 'La roukerie', 'Des dizaines de corbeaux, chacun dressé pour un château du Nord. Les messages arrivent par les airs, plus vite que n’importe quel cavalier — les mauvaises nouvelles surtout.');
  // Winter Town : l'auberge de la Bûche Fumante
  ctx.box(14, 6, 9, 186, 0, -40, timber); ctx.roof(15, 3.5, 10, 186, 6, -40, mat('thatch_roof_angled', { uv: 3, color: '#c8b090' }), { rotY: Math.PI / 2 });
  ctx.box(1.2, 4, 1.2, 191, 6, -40, dark); ctx.emitter('smoke', 191, 10, -40, { count: 30, opacity: .25, box: [2, 14, 2] });
  ctx.box(1.6, 1, .1, 186, 3.4, -35.4, mat(null, { color: '#5a3a22' }), { solid: false }); ctx.torch(183, 2.8, -35.3, { light: true });
  ctx.poi(186, -32, 'La Bûche Fumante', 'L’auberge de Winter Town. Une bière épaisse, un feu qui ne s’éteint jamais, et des chanteurs qui répètent les mêmes ballades depuis trois générations.', { color: '#ffb36a' });
  // galeries chauffées : vapeur des tuyaux le long des murs du Grand Donjon et du Grand Hall
  for (const [x, z] of [[17, -24], [35, -24], [28, 23], [18, 18], [38, 18]]) ctx.emitter('steam', x, 1, z, { box: [2, 5, 2], count: 15, opacity: .2 });
  ctx.poi(34, -14, 'Les murs chauds', 'Les sources chaudes coulent dans les murs du Grand Donjon par des tuyaux de cuivre. Dans les couloirs, on se réchauffe les mains contre la pierre.');
}
