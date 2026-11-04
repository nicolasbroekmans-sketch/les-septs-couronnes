// Physique légère et sans dépendance : boîtes de collision indexées par grille spatiale,
// sol (terrain + dessus de boîtes franchissables), collisions cercle/boîte, lancer de rayon.
export const STEP = .5;

export class Physics {
  constructor(cell = 8) { this.cell = cell; this.static = []; this.dynamic = []; this.hash = new Map(); this.groundFn = () => 0; this.stamp = 0; }
  /** c : { minX, minY, minZ, maxX, maxY, maxZ, dynamic?, noMap? } */
  add(c) {
    if (c.dynamic) { this.dynamic.push(c); return c; }
    this.static.push(c);
    for (const k of this.cells(c.minX, c.minZ, c.maxX, c.maxZ)) { if (!this.hash.has(k)) this.hash.set(k, []); this.hash.get(k).push(c); }
    return c;
  }
  *cells(x0, z0, x1, z1) {
    const s = this.cell;
    for (let i = Math.floor(x0 / s); i <= Math.floor(x1 / s); i++) for (let j = Math.floor(z0 / s); j <= Math.floor(z1 / s); j++) yield i * 73856093 ^ j * 19349663;
  }
  near(x0, z0, x1, z1) {
    const out = [], st = ++this.stamp;
    for (const k of this.cells(x0, z0, x1, z1)) for (const c of this.hash.get(k) ?? []) if (c._s !== st) { c._s = st; out.push(c); }
    return out.concat(this.dynamic);
  }
  groundAt(x, z, feet = Infinity) {
    let g = this.groundFn(x, z);
    for (const c of this.near(x, z, x, z)) if (x > c.minX - .05 && x < c.maxX + .05 && z > c.minZ - .05 && z < c.maxZ + .05 && c.maxY <= feet + STEP && c.maxY > g) g = c.maxY;
    return g;
  }
  /** Repousse un cercle (pos {x,z}) hors des boîtes qui dépassent la hauteur d'une marche. */
  collide(pos, feet, r = .38, height = 1.8) {
    for (const c of this.near(pos.x - r, pos.z - r, pos.x + r, pos.z + r)) {
      if (c.maxY <= feet + STEP || c.minY >= feet + height) continue;
      const dx = pos.x - Math.max(c.minX, Math.min(pos.x, c.maxX)), dz = pos.z - Math.max(c.minZ, Math.min(pos.z, c.maxZ)), d = Math.hypot(dx, dz);
      if (d >= r) continue;
      if (d > 1e-5) { pos.x += dx / d * (r - d); pos.z += dz / d * (r - d); continue; }
      const o = [[c.minX - r - pos.x, 0], [c.maxX + r - pos.x, 0], [0, c.minZ - r - pos.z], [0, c.maxZ + r - pos.z]].sort((a, b) => Math.abs(a[0] + a[1]) - Math.abs(b[0] + b[1]))[0];
      pos.x += o[0]; pos.z += o[1];
    }
  }
  solidAt(x, y, z) {
    for (const c of this.near(x, z, x, z)) if (x > c.minX && x < c.maxX && z > c.minZ && z < c.maxZ && y > c.minY && y < c.maxY) return true;
    return false;
  }
  /** Fraction [0,1] du segment A→B avant le premier obstacle (boîte ou terrain). 1 = dégagé. */
  raycast(a, b, ignoreBelow = 0) {
    let best = 1;
    const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
    for (const c of this.near(Math.min(a.x, b.x), Math.min(a.z, b.z), Math.max(a.x, b.x), Math.max(a.z, b.z))) {
      if (c.maxY - c.minY < ignoreBelow) continue;
      let t0 = 0, t1 = best;
      for (const [o, d, lo, hi] of [[a.x, dx, c.minX, c.maxX], [a.y, dy, c.minY, c.maxY], [a.z, dz, c.minZ, c.maxZ]]) {
        if (Math.abs(d) < 1e-9) { if (o < lo || o > hi) { t0 = 2; break; } continue; }
        let u = (lo - o) / d, v = (hi - o) / d; if (u > v) [u, v] = [v, u];
        t0 = Math.max(t0, u); t1 = Math.min(t1, v); if (t0 > t1) break;
      }
      if (t0 <= t1 && t0 < best) best = Math.max(0, t0);
    }
    for (let k = 1; k <= 12; k++) { const t = k / 12 * best; if (a.y + dy * t < this.groundFn(a.x + dx * t, a.z + dz * t)) { best = Math.max(0, (k - 1) / 12 * best); break; } }
    return best;
  }
  /** Ligne de vue entre deux points (yeux) : vraie si aucun obstacle. */
  sees(a, b) { return this.raycast(a, b) > .97; }
  all() { return this.static.concat(this.dynamic); }
}
