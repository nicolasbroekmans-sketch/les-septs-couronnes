// Intérieurs visitables : auberge, grande salle, maison. Construits à l'écart de la carte (même scène) et reliés à
// une porte extérieure : E pour entrer, E pour sortir. Chaque intérieur annonce qui l'habite (aubergiste, clients…).
let next = 0;
const ROOM = { inn: [18, 14, 5], hall: [16, 34, 9], house: [9, 8, 3.6], throne: [22, 44, 14], crypt: [9, 46, 4.4] };

/** Porte : point d'interaction qui téléporte vers `to` ({x,z,yaw}). */
export function door(ctx, x, z, label, to) { (ctx.engine.doors ??= []).push({ x, z, label, to }); }

export function room(ctx, kind, outside, o = {}) {
  const { mat, props: P } = ctx, [W, D, H] = ROOM[kind], cx = 3000 + (next++ % 12) * 90, cz = 3000, y = ctx.engine.groundFn(cx, cz) + .05;
  const wall = mat(o.wall ?? 'weathered_planks', { uv: 3, color: o.wallColor ?? '#8a6a4a' }), floor = mat(kind === 'hall' || kind === 'throne' ? 'cobblestone_floor_01' : 'weathered_planks', { uv: 3, color: o.floorColor ?? '#9a8466' });
  ctx.box(W + 2, .3, D + 2, cx, y - .3, cz, floor);
  for (const [x, z, w, d] of [[cx, cz - D / 2, W, .4], [cx, cz + D / 2, W, .4], [cx - W / 2, cz, .4, D], [cx + W / 2, cz, .4, D]]) ctx.box(w, H, d, x, y, z, wall);
  ctx.box(W, .3, D, cx, y + H, cz, wall, { solid: false });
  for (let k = -D / 2 + 3; k < D / 2; k += 4) ctx.box(W, .3, .3, cx, y + H - .4, cz + k, mat('weathered_planks', { uv: 2, color: '#4a3424' }), { solid: false });
  const inside = { x: cx, z: cz + D / 2 - 2, yaw: 0 };
  ctx.box(1.6, 2.4, .1, cx, y, cz + D / 2 - .25, mat('weathered_planks', { uv: 2, color: '#5a3a22' }), { solid: false });
  door(ctx, cx, cz + D / 2 - 1.2, 'Sortir', outside); door(ctx, outside.x, outside.z, o.label ?? 'Entrer', { ...inside, y });
  const people = [];
  if (kind === 'crypt') { crypt(ctx, cx, cz, y, W, D, o); (ctx.engine.rooms ??= []).push({ kind, people }); if (o.title) ctx.poi(cx, cz - D / 4, o.title, o.text ?? '', { y }); return inside; }
  ctx.fire(cx, y + .2, cz - D / 2 + 1.6, 1.1, { intensity: 30 }); ctx.box(3.2, 3.5, 1, cx, y, cz - D / 2 + .7, mat('castle_wall_slates', { uv: 2, color: '#6a6a6a' }));
  if (kind === 'inn') {
    ctx.box(6, 1.1, 1, cx + W / 2 - 4, y, cz - 1, mat('weathered_planks', { uv: 2, color: '#6a4a2a' }));
    for (let i = 0; i < 4; i++) P.barrel(cx + W / 2 - 1, cz - 4 + i * 1.2);
    for (const s of [-1, 1]) ctx.torch(cx + s * (W / 2 - .4), y + 2.4, cz + 2, { light: true, color: '#ffb36a' });
    for (const k of [-2, 3]) ctx.glow(cx, y + H - 1, cz + k, '#ffcf8a', 1.6);
    for (const [tx, tz] of [[-4, -1], [-4, 3], [1, 3]]) { ctx.box(2.4, .8, 1.2, cx + tx, y, cz + tz, mat('weathered_planks', { uv: 2, color: '#7a5a3a' })); P.bench(cx + tx, cz + tz - 1.1); P.bench(cx + tx, cz + tz + 1.1); }
    people.push({ role: 'merchant', name: o.keeper ?? 'L’aubergiste', x: cx + W / 2 - 4, z: cz - 2.2, yaw: 0, stock: { ration: 12, onguent: 3, vin_arbor: 4 } });
    for (const [tx, tz] of [[-4, -2.1], [-4, 1.9], [1, 4.1]]) people.push({ role: 'villager', name: 'Client', x: cx + tx, z: cz + tz, sit: true });
  }
  if (kind === 'hall' || kind === 'throne') {
    for (const s of [-1, 1]) { ctx.box(1.4, .85, D - 12, cx + s * 3.6, y, cz + 1, mat('weathered_planks', { uv: 2, color: '#6a4a2a' })); P.bench(cx + s * 2.4, cz + 1, Math.PI / 2); P.bench(cx + s * 4.8, cz + 1, Math.PI / 2); }
    ctx.box(W - 2, .6, 4, cx, y, cz - D / 2 + 4, floor);
    ctx.box(1.6, kind === 'throne' ? 4 : 2.2, 1.2, cx, y + .6, cz - D / 2 + 3.4, mat(null, { color: kind === 'throne' ? '#3a3a40' : '#5a3a22', metal: kind === 'throne' ? .7 : 0, rough: .5 }));
    if (kind === 'throne') for (let i = 0; i < 30; i++) ctx.box(.06, 1 + Math.random() * 2.5, .06, cx - .9 + Math.random() * 1.8, y + 1.5, cz - D / 2 + 3 + Math.random() * .8, mat(null, { color: '#5a5a62', metal: .9, rough: .3 }), { solid: false, rotY: Math.random() });
    for (let k = -D / 2 + 6; k < D / 2 - 4; k += 6) for (const s of [-1, 1]) { ctx.torch(cx + s * (W / 2 - .4), y + 2.6, cz + k, { light: k < 0 && s > 0 }); if (o.banner) P.banner(cx + s * (W / 2 - .3), y + H - 1.2, cz + k + 3, o.banner, s > 0 ? -Math.PI / 2 : Math.PI / 2, 1.2); }
    for (const [tx, tz] of [[-3.6, -2], [3.6, 4], [-3.6, 8]]) people.push({ role: 'villager', name: 'Convive', x: cx + tx + (tx < 0 ? -1.2 : 1.2), z: cz + tz, sit: true, yaw: tx < 0 ? Math.PI / 2 : -Math.PI / 2 });
    people.push({ role: 'guard', name: 'Garde de la salle', x: cx - 2, z: cz - D / 2 + 6, yaw: 0 });
  }
  if (kind === 'house') { ctx.box(2, .5, 1.2, cx - W / 2 + 1.4, y, cz - 1, mat(null, { color: '#a89070' })); ctx.box(1.4, .8, 1, cx + 2, y, cz, mat('weathered_planks', { uv: 2, color: '#7a5a3a' })); P.bench(cx + 2, cz + 1); people.push({ role: 'villager', name: 'Habitant', x: cx + 1.5, z: cz + .8 }); }
  (ctx.engine.rooms ??= []).push({ kind, people, title: o.title });
  if (o.title) ctx.poi(cx, cz - D / 4, o.title, o.text ?? '', { y });
  return inside;
}

/** Cryptes : allée de rois de pierre assis, épée sur les genoux, loup à leurs pieds ; torches bleutées. */
function crypt(ctx, cx, cz, y, W, D, o) {
  const st = ctx.mat('castle_wall_slates', { uv: 2, color: '#7a7e84' }), iron = ctx.mat(null, { color: '#4a4a50', metal: .8, rough: .5 });
  for (let k = -D / 2 + 5, i = 0; k < D / 2 - 4; k += 5, i++) for (const s of [-1, 1]) {
    const x = cx + s * (W / 2 - 1.3), z = cz + k;
    ctx.box(1.8, .9, 1.4, x, y, z, st); ctx.box(.9, 1.3, .7, x, y + .9, z, st); ctx.box(.5, .45, .45, x, y + 2.2, z, st); ctx.box(1.2, .9, .25, x + s * .45, y + .9, z, st, { solid: false });
    ctx.box(.1, .06, 1.2, x - s * .5, y + 1.2, z, iron, { solid: false, rotY: Math.PI / 2 });
    ctx.box(.5, .55, 1, x - s * 1.4, y, z + .6, st); ctx.cone(.22, .5, x - s * 1.4, y + .55, z + 1.1, st, { seg: 4, rotY: 0 });
    if (i % 2 === 0) ctx.torch(x - s * .2, y + 2.8, z - 2.4, { light: k < 0 && s < 0, color: '#8ab0ff' });
  }
}
