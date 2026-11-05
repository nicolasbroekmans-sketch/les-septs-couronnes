// Briques de décor partagées par les lieux : dôme, village (place, puits, étals, maisons), port, route bordée.
export function dome(ctx, x, y, z, r, m, o = {}) {
  const { THREE } = ctx, d = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 12, 0, Math.PI * 2, 0, o.half === false ? Math.PI : Math.PI / 2), m);
  d.position.set(x, y, z); d.scale.y = o.sy ?? 1; d.castShadow = true; d.receiveShadow = true; d.userData.merge = true; ctx.add(d);
  if (o.spire) ctx.cone(r * .12, r * .9, x, y + r * (o.sy ?? 1), z, o.spire, { seg: 8, solid: false });
  return d;
}

/** Village : maisons en couronne autour d'une place (puits, étals, lanternes), clôtures et tas de bois autour. */
export function village(ctx, cx, cz, o = {}) {
  const { props: P, rand } = ctx, g = ctx.engine.groundFn, n = o.houses ?? 16, R = o.radius ?? 26, lots = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + rand() * .2, r = R + (i % 2) * 11 + rand() * 4, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
    if (o.avoid?.(x, z)) continue;
    lots.push({ x, z, w: 5 + rand() * 3, d: 5 + rand() * 2, h: (o.hMin ?? 3.2) + rand() * (o.hVar ?? 2.5), rot: -a + Math.PI / 2 });
  }
  ctx.houses(lots, { wall: o.wall, roof: o.roof, tints: o.tints ?? ['#e8d8c0', '#d8c6aa', '#cbbfae'], roofTints: o.roofTints ?? ['#8a6a4a', '#7a5a3a', '#9a7a5a'], windows: o.windows ?? '#ffb05a', roofH: o.roofH ?? .6, flat: o.flat });
  P.well(cx, cz);
  if (o.market !== false) P.market(cx + 9, cz, o.stalls ?? 4, 5, o.awnings ?? ['#6a2a2a', '#3a4a5a', '#6a5a3a', '#2a3a2a']);
  for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; P.lantern(cx + Math.cos(a) * (R - 8), cz + Math.sin(a) * (R - 8)); }
  for (const l of lots) { const k = rand(), x = l.x + (rand() - .5) * 6, z = l.z + (rand() - .5) * 6; if (o.avoid?.(x, z)) continue; if (k < .3) P.woodpile(x, z, rand() * 3); else if (k < .5) P.barrel(x, z); else if (k < .65) P.hay(x, z, .8); else if (k < .8) P.crate(x, z, .9, rand()); }
  if (o.banner) { P.standard(cx - 6, cz - 6, o.banner, 7); P.standard(cx + 6, cz + 6, o.banner, 7); }
  if (o.name) ctx.poi(cx, cz + 4, o.name, o.text ?? '', { color: o.color });
  return lots;
}

/** Port : jetées en bois, pieux, navires qui tanguent (modèle GLTF). */
export async function harbor(ctx, list, o = {}) {
  const wood = ctx.mat('weathered_planks', { uv: 3, color: o.wood ?? '#8a6e52' });
  for (const [x, z, len, rot] of o.piers ?? []) {
    ctx.box(5, 1.4, len, x, -.4, z, wood, { rotY: rot ?? 0 });
    for (let k = -len / 2; k < len / 2; k += 6) ctx.cyl(.3, 4, x + 2.8 * Math.cos(rot ?? 0), -3, z + k, wood, { solid: false });
  }
  const ship = await ctx.gltf('ship');
  list.forEach(([x, z, r], i) => {
    const s = ship.clone(); s.position.set(x, -.9, z); s.rotation.y = r; ctx.add(s);
    ctx.update(t => { s.position.y = -.9 + Math.sin(t * .8 + i) * .15; s.rotation.z = Math.sin(t * .6 + i) * .03; });
  });
}

/** Route bordée de bornes et de lanternes entre deux points. */
export function road(ctx, x0, z0, x1, z1, o = {}) {
  const g = ctx.engine.groundFn, n = Math.ceil(Math.hypot(x1 - x0, z1 - z0) / (o.step ?? 14)), m = o.mat ?? ctx.mat('brown_mud', { uv: 4, color: o.color ?? '#a89878', rough: 1 });
  for (let i = 0; i < n; i++) {
    const t = i / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, len = Math.hypot(x1 - x0, z1 - z0) / n;
    ctx.box(o.w ?? 5, .06, len + .5, x, g(x, z) + .02, z, m, { rotY: Math.atan2(x1 - x0, z1 - z0), solid: false, cast: false });
    if (o.lanterns && i % 2) ctx.props.lantern(x + (o.w ?? 5) * .7, z);
  }
}
