// Entraînement reproductible du réseau tactique des PNJ.
//  1. Pré-entraînement supervisé : imiter l'IA utilitaire (enseignant) sur des situations aléatoires.
//  2. Stratégie d'évolution (OpenAI-ES, échantillons antithétiques) : maximiser la fitness dans le
//     simulateur de duel, qui utilise les vrais modules Fighter + DamageSystem.
//  3. Évaluation sur des duels jamais vus, comparée à l'aléatoire et à l'utilitaire.
// Usage : node tools/train-tactics.mjs   → écrit js/ai/tactics-weights.js et tools/ai-report.json
import { writeFileSync } from 'node:fs';
import { MLP, argmax } from '../js/ai/NeuralModel.js';
import { utilityScores, ACTIONS, FEATURES } from '../js/ai/Tactics.js';
import { evaluate } from '../js/ai/DuelSim.js';
import { createRng } from '../js/core/Random.js';

const SEED = 2026, rng = createRng(SEED), t0 = Date.now();
const BIN = new Set([6, 7, 10]);
const sample = () => FEATURES.map((_, i) => (BIN.has(i) ? (rng() < .5 ? 1 : 0) : rng()));
const teacher = f => argmax(utilityScores(f));

// 1. Pré-entraînement
const net = new MLP([FEATURES.length, 16, ACTIONS.length], null, rng);
const train = Array.from({ length: 20000 }, () => { const f = sample(); return [f, teacher(f)]; });
const test = Array.from({ length: 4000 }, () => { const f = sample(); return [f, teacher(f)]; });
const acc = (m, set) => set.filter(([f, y]) => argmax(m.predict(f)) === y).length / set.length;
for (let epoch = 0; epoch < 25; epoch++) {
  for (let i = train.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [train[i], train[j]] = [train[j], train[i]]; }
  for (const [f, y] of train) net.train(f, y, epoch < 15 ? .03 : .01);
}
const imitation = acc(net, test);
console.log(`Pré-entraînement : précision d'imitation ${(imitation * 100).toFixed(1)} %`);

// 2. Stratégie d'évolution
const policyOf = m => f => ACTIONS[argmax(m.predict(f))];
const fitnessOf = (vec, seed, n) => evaluate(policyOf(new MLP(net.sizes).setFlat(vec)), n, seed).fitness;
let theta = net.flat();
const POP = 40, SIGMA = .04, LR = .03, GENS = +(process.env.GENS ?? 120), N = 48;
const pretrainedVal = fitnessOf(theta, 90000, 120);
let best = { theta: theta.slice(), val: pretrainedVal, gen: 0 };
const gauss = () => Math.sqrt(-2 * Math.log(rng() + 1e-12)) * Math.cos(2 * Math.PI * rng());
for (let gen = 1; gen <= GENS; gen++) {
  const seed = 10000 + gen * 100, eps = [], fit = [];
  for (let k = 0; k < POP / 2; k++) {
    const e = theta.map(gauss); eps.push(e, e.map(x => -x));
    fit.push(fitnessOf(theta.map((t, i) => t + SIGMA * e[i]), seed, N), fitnessOf(theta.map((t, i) => t - SIGMA * e[i]), seed, N));
  }
  const order = fit.map((f, i) => [f, i]).sort((a, b) => a[0] - b[0]), rankW = new Array(POP);
  order.forEach(([, i], r) => (rankW[i] = r / (POP - 1) - .5));
  theta = theta.map((t, j) => t + LR / (POP * SIGMA) * eps.reduce((s, e, i) => s + rankW[i] * e[j], 0));
  if (gen % 5 === 0 || gen === GENS) {
    const val = fitnessOf(theta, 90000, 120);
    if (val > best.val) best = { theta: theta.slice(), val, gen };
    console.log(`Génération ${gen} : fitness validation ${val.toFixed(3)} (meilleure ${best.val.toFixed(3)} @${best.gen})`);
  }
}

// 3. Évaluation finale sur 400 duels inédits
const TEST_SEED = 50000, NT = 400;
const randomPol = (f, r) => ACTIONS[Math.floor(r() * ACTIONS.length)];
const utilityPol = f => ACTIONS[teacher(f)];
const evolved = new MLP(net.sizes).setFlat(best.theta);
const results = {
  random: evaluate(randomPol, NT, TEST_SEED), utility: evaluate(utilityPol, NT, TEST_SEED),
  nn_imitation: evaluate(policyOf(net), NT, TEST_SEED), nn_evolved: evaluate(policyOf(evolved), NT, TEST_SEED)
};
const chosen = results.nn_evolved.fitness >= results.nn_imitation.fitness ? 'nn_evolved' : 'nn_imitation';
const final = chosen === 'nn_evolved' ? evolved : net;
const fmt = r => ({ winRate: +r.winRate.toFixed(3), survival: +r.survival.toFixed(3), fitness: +r.fitness.toFixed(3) });
const report = {
  seed: SEED, architecture: net.sizes, features: FEATURES, actions: ACTIONS, imitationAccuracy: +imitation.toFixed(3),
  es: { population: POP, sigma: SIGMA, lr: LR, generations: GENS, duelsPerEval: N, bestGeneration: best.gen },
  testDuels: NT, results: Object.fromEntries(Object.entries(results).map(([k, v]) => [k, fmt(v)])), chosen,
  seconds: Math.round((Date.now() - t0) / 1000)
};
writeFileSync('tools/ai-report.json', JSON.stringify(report, null, 2));
writeFileSync('js/ai/tactics-weights.js', `// Poids du réseau tactique — GÉNÉRÉ par tools/train-tactics.mjs (graine ${SEED}). Ne pas éditer à la main.
// Politique retenue : ${chosen}. Victoires sur ${NT} duels de test : aléatoire ${fmt(results.random).winRate}, utilitaire ${fmt(results.utility).winRate}, réseau ${fmt(results[chosen]).winRate}.
export default ${JSON.stringify(final.toJSON())};\n`);
console.log(JSON.stringify(report.results, null, 1), '\nRetenu :', chosen, `(${report.seconds} s)`);
