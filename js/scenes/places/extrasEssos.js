// Enrichissements des lieux d'Essos : ville basse et port de Pentos, khalasar de Vaes Dothrak (tentes, chevaux),
// bazar devant les murailles de Qarth, temple rouge et navires du fleuve à Volantis, failles de lave à Valyria.
import { village, harbor, road } from './kit.js';

export default {
  async pentos(ctx) {
    const { mat } = ctx;
    village(ctx, 100, 4, { style: 'essos', houses: 30, radius: 24, wall: mat('plastered_wall', { uv: 4, instanced: true }), roof: mat('clay_roof_tiles', { uv: 2.5, instanced: true }), tints: ['#fbf4e6', '#f2e4c8', '#fff6ea'], roofTints: ['#e0a080', '#d08a60'], stalls: 6, awnings: ['#2f6b70', '#c9a227', '#7a3a6e', '#b0201a'],
      avoid: (x, z) => z > 50, name: 'La ville basse', text: 'Des ruelles blanches qui descendent vers le port, des balcons fleuris et des marchands qui parlent six langues — surtout celle de l’or.' });
    road(ctx, 6, 24, 80, 8, { w: 5, color: '#e0d0b0', lanterns: true });
    await harbor(ctx, [[-40, 110, .4], [30, 120, -.3], [90, 140, 1.2]], { piers: [[-20, 76, 26, 0], [24, 76, 26, 0]] });
  },
  async vaesdothrak(ctx) {
    // (porte des chevaux plus bas)
    const { mat } = ctx, g = ctx.engine.groundFn, cloth = ['#8a6a4a', '#a07a50', '#6a5038', '#b08a5a'];
    for (let ring = 0; ring < 3; ring++) for (let i = 0; i < 10 + ring * 5; i++) {
      const a = i / (10 + ring * 5) * 6.28, r = 30 + ring * 12, x = 90 + Math.cos(a) * r, z = 40 + Math.sin(a) * r;
      ctx.cone(2.6, 3.4, x, g(x, z), z, mat(null, { color: cloth[(i + ring) % 4], flat: true }), { seg: 7, solid: true });
    }
    ctx.fire(90, g(90, 40), 40, 1.4);
    const horse = await ctx.gltf('horse');
    for (let i = 0; i < 18; i++) { const h = horse.clone(), x = 40 + (i % 6) * 9 + Math.random() * 3, z = 100 + Math.floor(i / 6) * 9; h.position.set(x, g(x, z), z); h.rotation.y = Math.random() * 6; ctx.add(h); }
    // la Porte des Chevaux (deux étalons de bronze cabrés dont les sabots se rejoignent) et la Voie des Dieux
    const bronze = mat(null, { color: '#7a5a2e', metal: .85, rough: .38 }), st = mat('rock_face', { uv: 3, color: '#a8988a' });
    for (const s2 of [-1, 1]) { const x = s2 * 9, y = g(x, 120); ctx.box(4, 3, 9, x, y, 120, st); ctx.box(3, 9, 5, x, y + 3, 120, bronze); ctx.box(2.4, 6, 2.2, x - s2 * 2.5, y + 11, 120, bronze, { rotY: 0 }); ctx.box(1.6, 2.6, 4, x - s2 * 4.5, y + 15, 120, bronze); }
    ctx.box(10, 1.2, 2, 0, g(0, 120) + 17, 120, bronze, { solid: false });
    ctx.poi(0, 128, 'La Porte des Chevaux', 'Deux étalons de bronze se cabrent l’un vers l’autre ; leurs sabots se rejoignent au-dessus de la route. On entre à Vaes Dothrak à pied, en baissant la tête.', { color: '#d8a860' });
    for (let k = 0; k < 14; k++) { const x = (k % 2 ? 1 : -1) * 8, z = 100 - k * 14, y = g(x, z); ctx.box(2, 5 + (k % 4) * 2, 2, x, y, z, st, { rotY: k }); ctx.box(2.4, 1.6, 1.8, x, y + 5 + (k % 4) * 2, z, st, { rotY: k * .7, solid: false }); }
    ctx.poi(12, 40, 'La Voie des Dieux', 'Des dieux volés à tous les peuples vaincus, alignés le long de la route : têtes de pierre, idoles brisées, statues sans nom.');
    ctx.poi(90, 72, 'Le khalasar', 'Cent tentes, mille chevaux, et un khal qui ne descend de selle que pour dormir. À Vaes Dothrak, aucune lame ne peut être tirée : c’est la seule paix que connaissent les cavaliers.', { color: '#ffb070' });
  },
  async qarth(ctx) {
    const { mat, props: P, rand } = ctx;
    P.market(0, 150, 14, 10, ['#b0201a', '#e0b050', '#2f6b70', '#7a3a6e', '#d97a2a']);
    for (let i = 0; i < 8; i++) P.cart(-30 + i * 8, 178 + (i % 2) * 3, rand());
    const palms = []; for (let i = 0; i < 40; i++) palms.push([-70 + rand() * 140, 130 + rand() * 70, .9 + rand() * .4]); ctx.trees(palms.filter(([x]) => Math.abs(x) > 18), 'palm', { leaf: '#4a7a3a' });
    ctx.poi(0, 168, 'Le bazar des caravanes', 'Soie de Yi Ti, épices d’Asshai, œufs « de dragon » à trois sous. Devant les murailles de Qarth, tout se vend ; derrière, tout s’achète.', { color: '#ffb070' });
  },
  async volantis(ctx) {
    const { mat } = ctx, red = mat('large_sandstone_blocks', { uv: 4, color: '#b0442a' });
    for (let k = 0; k < 5; k++) ctx.box(50 - k * 9, 6, 50 - k * 9, 100, k * 6, 95, red);
    for (const [x, z] of [[72, 67], [128, 67], [72, 123], [128, 123]]) ctx.fire(x, ctx.engine.groundFn(x, z), z, 1.6);
    ctx.poi(100, 64, 'Le temple rouge', 'Le plus grand temple du Maître de la Lumière : des marches de pierre rouge et des feux qui ne s’éteignent jamais. Ses prêtres promettent que la nuit est sombre et pleine de terreurs.', { color: '#ff6a3a' });
    await harbor(ctx, [[18, 120, 0], [-20, -140, Math.PI], [22, -220, .1]]);
    // le Long Pont comme sur l'image : arches en plein cintre, tours à flèches sur le tablier ; la vieille ville à l'est
    const st = mat('large_sandstone_blocks', { uv: 4, color: '#cdb594' }), slate = mat('grey_roof_01', { uv: 2, color: '#6a6458' });
    for (let k = -4; k < 4; k++) for (let j = 0; j < 7; j++) { const a2 = j / 6 * Math.PI, x = k * 11 + 5.5 + Math.cos(a2) * 3.5; ctx.box(1.6, 1.4, 8, x, -2.6 + Math.sin(a2) * 2.6, 0, st, { solid: false }); }
    for (const x of [-46, -14, 18, 46]) { ctx.tower(x, 9, { w: 4.5, h: 18, y: 1, mat: st, roof: slate, roofH: 6 }); }
    for (const [x, z, h] of [[110, -40, 34], [140, -20, 28], [128, -70, 40], [150, -50, 24]]) { ctx.tower(x, z, { w: 7, h, mat: st, round: true, roof: slate, roofH: 9 }); }
    ctx.poi(120, 10, 'La vieille ville', 'Derrière le Mur Noir, les palais des Anciens Sangs et leurs tours. On n’y entre que sur invitation — ou par effraction.');
  }
};
