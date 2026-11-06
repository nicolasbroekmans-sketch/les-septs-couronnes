import { winterfellWalls } from './details/winterfellWalls.js';
import { winterfellCastle } from './details/winterfellCastle.js';
import { winterfellTown } from './details/winterfellTown.js';
import { winterfellMore } from './details/winterfellMore.js';

// WINTERFELL — d'après le plan du château : double enceinte avec douves gelées à l'ouest et à l'est, quatre
// portes (nord, est vers la route royale, ouest « porte du Chasseur », sud), bois sacré à l'ouest, Premier
// Donjon au nord-est, Grand Donjon au centre, Grand Hall au sud-est, Winter Town à l'est le long de la route royale,
// Bois-aux-Loups à l'ouest.
export const config = {
  hdri: 'kloofendal_overcast_puresky', exposure: 1, bg: .8, env: 1,
  fog: ['#b8c0ca', .0062], hemi: ['#d6dee8', '#4a4440', .62], sun: ['#e6ecf5', 1.4, [.35, .55, .5]],
  bloom: [.5, .6, .82], tint: '#eef3ff', sat: .74, contrast: 1.14, bounds: [-180, -130, 215, 90]
};

export async function build(ctx) {
  const { mat, rand } = ctx;
  const snow = mat('snow_03', { uv: 7, color: '#eef2f6', rough: .85 });
  const n2 = (x, z) => Math.sin(x * .021) * Math.cos(z * .017) * 6 + Math.sin(x * .05 + z * .03) * 2;
  const h = (x, z) => { const d = Math.max(0, Math.max(Math.abs(x - 17) - 200, Math.abs(z + 20) - 112)); return n2(x, z) * Math.min(1, d / 40) + d * .1; };
  ctx.terrain({ size: 900, seg: 180, height: h, mat: snow, splat: { slope: 'rocky_terrain_02', slopeTint: '#b8bcc0' } });
  winterfellWalls(ctx);
  winterfellCastle(ctx);
  winterfellTown(ctx);
  winterfellMore(ctx);
  // forêts : Bois-aux-Loups à l'ouest et au nord, pins épars ailleurs
  const pines = [];
  for (let i = 0; i < 560; i++) {
    const x = -180 + rand() * 400, z = -130 + rand() * 220;
    const inCastle = x > -72 && x < 72 && z > -80 && z < 48, inTown = x > 64 && x < 212 && z > -110 && z < 82, camp = Math.hypot(x + 105, z + 62) < 26;
    const wood = x < -72 || z < -84 || rand() < .12;
    if (!inCastle && !inTown && !camp && wood && Math.abs(z - 4) > 5) pines.push([x, z, .9 + rand() * .8]);
  }
  ctx.trees(pines, 'pine', { leaf: '#24362e' });
  ctx.poi(-130, -40, 'Le Bois-aux-Loups', 'Des pins noirs à perte de vue, à l’ouest du château. Les loups y chassent encore — et parfois, des hommes qui n’y ont rien à faire.');
  ctx.particles('snow');
  ctx.spawn(150, -14, Math.PI / 2);
  ctx.sound(
    { name: 'wind', volume: .55 },
    { name: 'fire', volume: .7, pos: [-2, 1, 22], ref: 3 },
    { name: 'anvil', volume: .8, pos: [-2, 1, 22], every: [1.4, 2.6], ref: 5 },
    { name: 'crowd', volume: .25, pos: [125, 0, -14], ref: 25 },
    { name: 'raven', volume: .6, every: [7, 15], randomPos: [0, 18, -20, 80], ref: 10 },
    { name: 'canal', volume: .35, pos: [-26, 0, -10], ref: 2, rate: .7 }
  );
}
