// Navigation : grille de passage construite à partir des boîtes de collision, recherche A* (8 directions),
// lissage du chemin par ligne de vue.
export class NavGrid {
  constructor(bounds, cell = 1) {
    const [x0, z0, x1, z1] = bounds;
    Object.assign(this, { x0, z0, cell, w: Math.ceil((x1 - x0) / cell), h: Math.ceil((z1 - z0) / cell) });
    this.block = new Uint8Array(this.w * this.h);
  }
  /** colliders : objets {minX…maxZ} ou tableaux [minX, minY, minZ, maxX, maxY, maxZ] ; ground(x,z) ; marge = rayon d'agent. */
  bake(colliders, ground = () => 0, margin = .4, step = .5) {
    for (const raw of colliders) {
      const c = Array.isArray(raw) ? raw : [raw.minX, raw.minY, raw.minZ, raw.maxX, raw.maxY, raw.maxZ];
      if (raw.dynamic) continue;
      const g = ground((c[0] + c[3]) / 2, (c[2] + c[5]) / 2);
      if (c[4] - g <= step || c[1] - g > 2) continue;
      const [i0, j0] = this.idx(c[0] - margin, c[2] - margin), [i1, j1] = this.idx(c[3] + margin, c[5] + margin);
      for (let j = Math.max(0, j0); j <= Math.min(this.h - 1, j1); j++) for (let i = Math.max(0, i0); i <= Math.min(this.w - 1, i1); i++) this.block[j * this.w + i] = 1;
    }
    return this;
  }
  idx(x, z) { return [Math.floor((x - this.x0) / this.cell), Math.floor((z - this.z0) / this.cell)]; }
  center(i, j) { return { x: this.x0 + (i + .5) * this.cell, z: this.z0 + (j + .5) * this.cell }; }
  free(i, j) { return i >= 0 && j >= 0 && i < this.w && j < this.h && !this.block[j * this.w + i]; }
  /** Ligne de vue sur la grille (pas d'un demi-cellule). */
  clear(a, b) {
    const d = Math.hypot(b.x - a.x, b.z - a.z), n = Math.ceil(d / (this.cell * .5));
    for (let k = 1; k < n; k++) { const [i, j] = this.idx(a.x + (b.x - a.x) * k / n, a.z + (b.z - a.z) * k / n); if (!this.free(i, j)) return false; }
    return true;
  }
  nearestFree(i, j) {
    for (let r = 0; r < 6; r++) for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) if (this.free(i + di, j + dj)) return [i + di, j + dj];
    return null;
  }
  /** A* ; renvoie une liste de points {x,z} lissée, ou null. */
  find(from, to, maxNodes = 20000) {
    const s = this.nearestFree(...this.idx(from.x, from.z)), e = this.nearestFree(...this.idx(to.x, to.z));
    if (!s || !e) return null;
    const W = this.w, key = (i, j) => j * W + i, goal = key(...e);
    const g = new Map([[key(...s), 0]]), came = new Map(), open = new Heap();
    const hfn = (i, j) => { const dx = Math.abs(i - e[0]), dz = Math.abs(j - e[1]); return dx + dz + (Math.SQRT2 - 2) * Math.min(dx, dz); };
    open.push(key(...s), hfn(...s));
    let n = 0;
    while (open.size && n++ < maxNodes) {
      const k = open.pop();
      if (k === goal) return this.smooth(this.rebuild(came, k), from, to);
      const i = k % W, j = (k / W) | 0;
      for (const [di, dj] of DIRS) {
        const ni = i + di, nj = j + dj;
        if (!this.free(ni, nj) || (di && dj && (!this.free(i + di, j) || !this.free(i, j + dj)))) continue;
        const nk = key(ni, nj), cost = g.get(k) + (di && dj ? Math.SQRT2 : 1);
        if (cost < (g.get(nk) ?? Infinity)) { g.set(nk, cost); came.set(nk, k); open.push(nk, cost + hfn(ni, nj)); }
      }
    }
    return null;
  }
  rebuild(came, k) { const out = []; while (k !== undefined) { out.push(this.center(k % this.w, (k / this.w) | 0)); k = came.get(k); } return out.reverse(); }
  smooth(pts, from, to) {
    pts[0] = { x: from.x, z: from.z }; pts.push({ x: to.x, z: to.z });
    const out = [pts[0]];
    let i = 0;
    while (i < pts.length - 1) { let j = pts.length - 1; while (j > i + 1 && !this.clear(pts[i], pts[j])) j--; out.push(pts[j]); i = j; }
    return out;
  }
}
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

class Heap { // tas binaire minimal (clé, priorité)
  constructor() { this.k = []; this.p = []; }
  get size() { return this.k.length; }
  push(k, p) { this.k.push(k); this.p.push(p); let i = this.k.length - 1; while (i > 0) { const q = (i - 1) >> 1; if (this.p[q] <= this.p[i]) break; this.swap(i, q); i = q; } }
  pop() {
    const top = this.k[0], lk = this.k.pop(), lp = this.p.pop();
    if (this.k.length) { this.k[0] = lk; this.p[0] = lp; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < this.k.length && this.p[l] < this.p[m]) m = l; if (r < this.k.length && this.p[r] < this.p[m]) m = r; if (m === i) break; this.swap(i, m); i = m; } }
    return top;
  }
  swap(a, b) { [this.k[a], this.k[b]] = [this.k[b], this.k[a]]; [this.p[a], this.p[b]] = [this.p[b], this.p[a]]; }
}
