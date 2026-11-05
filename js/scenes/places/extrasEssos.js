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
    const { mat } = ctx, g = ctx.engine.groundFn, cloth = ['#8a6a4a', '#a07a50', '#6a5038', '#b08a5a'];
    for (let ring = 0; ring < 3; ring++) for (let i = 0; i < 10 + ring * 5; i++) {
      const a = i / (10 + ring * 5) * 6.28, r = 30 + ring * 12, x = 90 + Math.cos(a) * r, z = 40 + Math.sin(a) * r;
      ctx.cone(2.6, 3.4, x, g(x, z), z, mat(null, { color: cloth[(i + ring) % 4], flat: true }), { seg: 7, solid: true });
    }
    ctx.fire(90, g(90, 40), 40, 1.4);
    const horse = await ctx.gltf('horse');
    for (let i = 0; i < 18; i++) { const h = horse.clone(), x = 40 + (i % 6) * 9 + Math.random() * 3, z = 100 + Math.floor(i / 6) * 9; h.position.set(x, g(x, z), z); h.rotation.y = Math.random() * 6; ctx.add(h); }
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
  },
  async valyria(ctx) {
    const { THREE, mat, rand } = ctx, g = ctx.engine.groundFn;
    const lava = new THREE.MeshBasicMaterial({ color: '#ff5a10', toneMapped: false });
    for (let i = 0; i < 14; i++) { const x = (rand() - .5) * 180, z = (rand() - .5) * 180, l = 6 + rand() * 18, c = new THREE.Mesh(new THREE.BoxGeometry(.6 + rand(), .1, l), lava); c.position.set(x, g(x, z) + .03, z); c.rotation.y = rand() * 3; ctx.add(c); ctx.emitter('smoke', x, g(x, z), z, { count: 18, opacity: .2, box: [3, 16, 3] }); }
    ctx.poi(20, 20, 'Les failles', 'Le sol est fendu de veines de feu. Les marins qui reviennent de Valyria — il y en a peu — refusent d’en parler, et toussent jusqu’à la fin de leurs jours.', { color: '#ff6a3a' });
  }
};
