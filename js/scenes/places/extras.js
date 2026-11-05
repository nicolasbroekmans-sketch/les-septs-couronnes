// Enrichissements des lieux « légers » de Westeros : bourgs, lices, vignes, ports, drakkars, bannières.
import { village, harbor, road } from './kit.js';

export default {
  // HAUTJARDIN : le bourg au pied du château, les lices de tournoi et leurs pavillons, les vignes, la route des roses
  async highgarden(ctx) {
    const { mat, props: P, rand } = ctx, g = ctx.engine.groundFn;
    village(ctx, 130, 20, { style: 'bief', houses: 30, radius: 30, banner: 'tyrell', wall: mat('plastered_wall', { uv: 4, instanced: true }), roof: mat('clay_roof_tiles', { uv: 2.5, instanced: true }),
      tints: ['#fbf6ec', '#f4ead6', '#fff8ee'], roofTints: ['#7fa0a8', '#6a8a92', '#c08050'], windows: '#ffd890', name: 'Le bourg de Hautjardin', text: 'Des maisons blanches aux volets verts, des fontaines et des marchés de fleurs. Même les forgerons, ici, ont des rosiers devant la porte.', color: '#ffd0e0' });
    road(ctx, 0, 90, 100, 26, { w: 5, color: '#c8b890', lanterns: true });
    // trois enceintes concentriques de murs blancs autour du château, et la Mander au sud
    const white = mat('rough_plaster_03', { uv: 5, color: '#fbf6ec' }), slate = mat(null, { color: '#d8b040', metal: .45, rough: .35 });
    for (const [x0, z0, x1, z1, h] of [[-52, -136, 52, -53, 9], [-64, -148, 64, -44, 7]]) ctx.ring(x0, z0, x1, z1, { h, t: 2.5, mat: white, gate: 'S', gateW: 7, round: true, towerW: 6, towerExtra: 5, towerRoof: slate });
    ctx.water({ y: -.3, z: 185, w: 900, d: 40, color: '#3a6a6a' });
    // tours élancées à toits coniques dorés et fanions verts, comme sur la peinture
    for (const [x, z, w, h] of [[-26, -112, 5, 40], [26, -112, 5, 36], [-8, -84, 4, 44], [8, -84, 4, 40], [-34, -78, 4, 30], [34, -78, 4, 30], [0, -118, 6, 50]]) {
      ctx.tower(x, z, { w, h, mat: white, round: true, roof: slate, roofH: w * 2.2 });
      ctx.cyl(w * .6, 1, x, h * .7, z, white, { seg: 12, solid: false });
      P.banner(x, h + w * 2.2 + .5, z, 'tyrell', rand() * 6, .7);
    }
    ctx.poi(0, -42, 'Les trois enceintes', 'Trois murs blancs, l’un dans l’autre, comme les pétales d’une rose. Aucune armée ne les a jamais franchis ; on les a toujours ouverts de l’intérieur, avec des sourires.');
    ctx.poi(40, 170, 'La Mander', 'Le fleuve le plus doux du royaume. Il charrie des barges de blé, de vin et de roses vers Villevieille.');
    // lices : barrière centrale, tribunes, pavillons colorés, écus
    const LX = -95, LZ = 30, wood = mat('weathered_planks', { uv: 2, color: '#d8c8a0' });
    for (let k = -30; k <= 30; k += 2.5) ctx.box(.15, 1.3, .15, LX, g(LX, LZ + k), LZ + k, wood, { solid: false });
    ctx.box(.12, .12, 62, LX, g(LX, LZ) + 1.2, LZ, wood, { solid: false });
    for (const s of [-1, 1]) { // tribunes à gradins sous un dais de toile
      for (let k = 0; k < 4; k++) ctx.box(1.4, .9 + k * .9, 38, LX + s * (12 + k * 1.4), g(LX, LZ), LZ, wood);
      for (const z of [-19, 0, 19]) ctx.box(.2, 5.6, .2, LX + s * 17.5, g(LX, LZ), LZ + z, wood, { solid: false });
      ctx.box(7, .12, 40, LX + s * 14.6, g(LX, LZ) + 5.5, LZ, mat(null, { color: s < 0 ? '#3f6a34' : '#d8b040', rough: 1 }), { solid: false });
      for (let i = 0; i < 8; i++) P.banner(LX + s * 11.2, g(LX, LZ) + 4.6, LZ - 17 + i * 4.9, i % 2 ? 'tyrell' : 'baratheon', s > 0 ? -Math.PI / 2 : Math.PI / 2, .5);
    }
    const cloth = ['#3f6a34', '#d8b040', '#8b0000', '#5a7aa8', '#f4f2ec', '#d97a2a'];
    for (let i = 0; i < 10; i++) { const x = LX - 34 + (i % 2) * 8, z = LZ - 30 + i * 7; ctx.cone(2.6, 4.2, x, g(x, z), z, mat(null, { color: cloth[i % cloth.length], flat: true }), { seg: 8, solid: true }); P.banner(x, g(x, z) + 6, z, ['tyrell', 'lannister', 'baratheon', 'arryn', 'stark', 'martell'][i % 6], Math.PI / 2, .8); }
    ctx.poi(LX, LZ + 36, 'Les lices', 'Chaque printemps, les chevaliers du royaume viennent y rompre des lances pour un sourire de la Reine des Roses. Les sourires coûtent plus cher que les lances.', { color: '#ffd0e0' });
    // vignes en rangs
    for (let r = 0; r < 14; r++) for (let k = 0; k < 18; k++) { const x = 52 + k * 3.2, z = -125 + r * 3.4; ctx.box(.5, 1.1, .5, x, g(x, z), z, mat(null, { color: '#4a7a2a' }), { solid: false, cast: false }); }
    ctx.poi(78, -76, 'Les vignes de la Rose', 'Du vin doré, doux comme une promesse et traître comme elle. Les Tyrell en envoient à toutes les tables qui comptent.');
  },
  // PYK : drakkars dans la baie, bannières à la seiche, remparts sur les îles
  async pyke(ctx) {
    const { mat, props: P } = ctx;
    await harbor(ctx, [[40, 100, .2], [-40, 120, -.3], [90, 20, 1.6], [-100, -10, 1.4]]);
    for (const [x, z, r] of [[0, 40, 18], [-30, 0, 12], [12, -30, 12], [-10, -70, 14]]) P.banner(x + r * .42, 36, z, 'greyjoy', -Math.PI / 2, 1.6);
    const stone = mat('castle_wall_slates', { uv: 4, color: '#6a6e74' });
    for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28; if (Math.abs(a - 4.2) < .5) continue; ctx.box(3.4, 1.4, .8, Math.cos(a) * 16.5, 24, 40 + Math.sin(a) * 16.5, stone, { rotY: -a + Math.PI / 2 }); }
    ctx.poi(30, 90, 'La flotte de fer', 'Des drakkars noirs aux voiles de la seiche. Les Fer-nés ne paient pas le prix du fer : ils le prennent.', { y: 0, color: '#d8b040' });
  }
};
