// Petit perceptron multicouche (MLP) : propagation avant, rétropropagation pour l'entraînement supervisé,
// sérialisation. Utilisé pour les décisions tactiques des PNJ (voir ai/Tactics.js).
export class MLP {
  /** sizes ex. [11, 16, 7] ; weights optionnels { W: [[...]], b: [[...]] } */
  constructor(sizes, weights = null, rng = Math.random) {
    this.sizes = sizes;
    this.W = weights?.W ?? sizes.slice(1).map((n, l) => Array.from({ length: n * sizes[l] }, () => (rng() * 2 - 1) * Math.sqrt(2 / sizes[l])));
    this.b = weights?.b ?? sizes.slice(1).map(n => new Array(n).fill(0));
  }
  /** Renvoie les activations de chaque couche (tanh cachée, softmax sortie). */
  forward(x) {
    const acts = [Array.from(x)];
    for (let l = 0; l < this.W.length; l++) {
      const inp = acts[l], n = this.sizes[l + 1], m = this.sizes[l], W = this.W[l], out = new Array(n);
      for (let i = 0; i < n; i++) { let s = this.b[l][i]; for (let j = 0; j < m; j++) s += W[i * m + j] * inp[j]; out[i] = s; }
      acts.push(l === this.W.length - 1 ? softmax(out) : out.map(Math.tanh));
    }
    return acts;
  }
  predict(x) { return this.forward(x).at(-1); }
  /** Une étape de descente de gradient (entropie croisée) sur un exemple étiqueté. */
  train(x, label, lr = .05) {
    const acts = this.forward(x);
    let delta = acts.at(-1).map((p, i) => p - (i === label ? 1 : 0));
    for (let l = this.W.length - 1; l >= 0; l--) {
      const inp = acts[l], m = this.sizes[l], W = this.W[l], prev = new Array(m).fill(0);
      for (let i = 0; i < delta.length; i++) {
        for (let j = 0; j < m; j++) { prev[j] += W[i * m + j] * delta[i]; W[i * m + j] -= lr * delta[i] * inp[j]; }
        this.b[l][i] -= lr * delta[i];
      }
      delta = prev.map((g, j) => g * (1 - inp[j] * inp[j]));
    }
    return -Math.log(Math.max(1e-9, acts.at(-1)[label]));
  }
  flat() { return [...this.W.flat(), ...this.b.flat()]; }
  setFlat(v) {
    let k = 0;
    this.W = this.W.map(w => w.map(() => v[k++]));
    this.b = this.b.map(b => b.map(() => v[k++]));
    return this;
  }
  toJSON() { return { sizes: this.sizes, W: this.W.map(w => w.map(x => +x.toFixed(5))), b: this.b.map(b => b.map(x => +x.toFixed(5))) }; }
  static from(json) { return new MLP(json.sizes, json); }
}
export function softmax(v) {
  const m = Math.max(...v), e = v.map(x => Math.exp(x - m)), s = e.reduce((a, b) => a + b, 0);
  return e.map(x => x / s);
}
export const argmax = v => v.reduce((bi, x, i) => (x > v[bi] ? i : bi), 0);
