// Champ de bataille générique (plaine ou neige) : collines douces, deux camps, palissades, étendards.
import { BATTLES } from '../data/battles.js';

const THEMES = {
  plaine: { ground: ['brown_mud', '#a8a070'], fog: ['#d8c8a8', .004], sun: ['#ffd9a0', 2.8, [-.5, .4, .4]], hemi: ['#ffe8c8', '#5a4a30', .5], leaf: '#4a5a32', particles: 'dust', ambience: 'wind' },
  neige: { ground: ['snow_02', '#e8eef2'], fog: ['#c3cad2', .006], sun: ['#e6ecf5', 1.6, [.35, .55, .5]], hemi: ['#dfe7f0', '#4a4440', .6], leaf: '#2c3f33', particles: 'snow', ambience: 'blizzard' }
};
export const config = id => { const b = BATTLES[id], t = THEMES[b.theme]; return { hdri: b.hdri, exposure: 1, bg: 1, env: 1, fog: t.fog, hemi: t.hemi, sun: t.sun, bloom: [.45, .5, .85], bounds: [-90, -140, 90, 90] }; };

export async function build(ctx, id) {
  const b = BATTLES[id], t = THEMES[b.theme], { mat, props: P, rand } = ctx;
  const h = (x, z) => Math.sin(x * .03) * Math.cos(z * .025) * 2.2 + Math.max(0, Math.abs(x) - 70) * .25;
  ctx.terrain({ size: 500, seg: 120, height: h, mat: mat(t.ground[0], { uv: 6, color: t.ground[1], rough: 1 }) });
  const trees = []; for (let i = 0; i < 160; i++) { const x = (rand() < .5 ? -1 : 1) * (80 + rand() * 120), z = -200 + rand() * 330; trees.push([x, z, 1 + rand()]); }
  ctx.trees(trees, 'pine', { leaf: t.leaf });
  const allyHouse = { guet: 'baratheon', stark: 'stark', garde: 'garde' }[b.allies.faction] ?? 'stark';
  for (const [z, house, cloth] of [[52, allyHouse, '#4a5a7a'], [-112, b.enemy.faction === 'greyjoy' ? 'garde' : 'lannister', '#6a3a2a']]) {
    for (let i = 0; i < 5; i++) ctx.cone(3, 3.6, -30 + i * 15, h(-30 + i * 15, z + 8 * Math.sign(z)), z + 8 * Math.sign(z), mat(null, { color: cloth, flat: true }), { seg: 6, solid: true });
    for (const x of [-24, 0, 24]) P.standard(x, z, house, 8);
    for (let x = -40; x <= 40; x += 2.4) ctx.cyl(.22, 2.6, x, h(x, z + 4 * Math.sign(z)) - .3, z + 4 * Math.sign(z), mat('weathered_planks', { uv: 2, color: '#7a5a3a' }), { seg: 5 });
    ctx.fire(-12, h(-12, z + 14 * Math.sign(z)), z + 14 * Math.sign(z), .9);
  }
  ctx.poi(-34, 62, b.name, b.desc, { color: '#ff6a4a' });
  ctx.particles(t.particles);
  ctx.spawn(0, 42, 0);
  ctx.sound({ name: t.ambience, volume: .45 }, { name: 'crowd', volume: .35 });
}
