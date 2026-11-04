import test from 'node:test';
import assert from 'node:assert/strict';
import { MLP, argmax } from '../js/ai/NeuralModel.js';
import { TacticalBrain, features, ACTIONS } from '../js/ai/Tactics.js';
import { duel, evaluate } from '../js/ai/DuelSim.js';
import { NavGrid } from '../js/ai/Pathfinding.js';
import { createRng } from '../js/core/Random.js';

test('MLP : l’entraînement réduit vraiment l’erreur (XOR)', () => {
  const rng = createRng(3), m = new MLP([2, 8, 2], null, rng), data = [[[0, 0], 0], [[0, 1], 1], [[1, 0], 1], [[1, 1], 0]];
  const loss = () => data.reduce((s, [x, y]) => s - Math.log(m.predict(x)[y]), 0);
  const before = loss();
  for (let e = 0; e < 3000; e++) for (const [x, y] of data) m.train(x, y, .1);
  assert.ok(loss() < before * .2);
  assert.deepEqual(data.map(([x]) => argmax(m.predict(x))), [0, 1, 1, 0]);
  const copy = MLP.from(JSON.parse(JSON.stringify(m.toJSON())));
  assert.deepEqual(argmax(copy.predict([0, 1])), 1, 'sérialisation fidèle');
});

test('IA utilitaire : décisions cohérentes selon la situation', () => {
  const b = new TacticalBrain(null), base = { distance: 1.5, reach: 2, hp: 1, stamina: 1, targetHp: 1, allies: 0, enemies: 1, threat: false, ranged: false, morale: .6, aggression: .8, targetBlocking: false };
  assert.equal(b.decide(features(base), 'utility').action, 'attack');
  assert.equal(b.decide(features({ ...base, hp: .1, morale: .1 }), 'utility').action, 'flee');
  assert.ok(['dodge', 'defend'].includes(b.decide(features({ ...base, threat: true, aggression: .2 }), 'utility').action));
  assert.equal(b.decide(features({ ...base, ranged: true, distance: 1, reach: 14 }), 'utility').action, 'retreat', 'l’archer recule si on le colle');
});

test('simulateur de duel : déterministe à graine égale', () => {
  const pol = f => new TacticalBrain(null).decide(f, 'utility').action;
  assert.deepEqual(duel(pol, 7), duel(pol, 7));
  const rand = (f, rng) => ACTIONS[Math.floor(rng() * ACTIONS.length)];
  assert.ok(evaluate(pol, 60).fitness > evaluate(rand, 60).fitness, 'l’utilitaire bat une politique aléatoire');
});

test('A* : contourne un mur et échoue proprement si la cible est enfermée', () => {
  const g = new NavGrid([0, 0, 20, 20], 1).bake([[9, 0, 0, 10, 3, 15]], () => 0, 0);
  const path = g.find({ x: 2, z: 5 }, { x: 18, z: 5 });
  assert.ok(path && path.length >= 3, 'chemin trouvé');
  assert.ok(path.some(p => p.z > 15), 'le chemin passe au bout du mur');
  for (let i = 1; i < path.length; i++) assert.ok(g.clear(path[i - 1], path[i]), 'chaque segment est dégagé');
  const box = new NavGrid([0, 0, 20, 20], 1).bake([[4, 0, 4, 16, 3, 5], [4, 0, 15, 16, 3, 16], [4, 0, 4, 5, 3, 16], [15, 0, 4, 16, 3, 16]], () => 0, 0);
  assert.equal(box.find({ x: 1, z: 1 }, { x: 10, z: 10 }), null);
});

test('poids livrés : le réseau entraîné bat l’IA utilitaire sur des duels inédits', async () => {
  const w = (await import('../js/ai/tactics-weights.js')).default, m = MLP.from(w);
  assert.deepEqual(m.sizes, [11, 16, 7]);
  const nn = evaluate(f => ACTIONS[argmax(m.predict(f))], 200, 70000);
  const util = evaluate(f => new TacticalBrain(null).decide(f, 'utility').action, 200, 70000);
  assert.ok(nn.fitness > util.fitness, `réseau ${nn.fitness.toFixed(3)} vs utilitaire ${util.fitness.toFixed(3)}`);
  const b = new TacticalBrain(w), d = b.decide(features({ distance: 1, reach: 2, hp: .9, stamina: .9, targetHp: .8, allies: 1, enemies: 1, threat: false, ranged: false, morale: .6, aggression: .7, targetBlocking: false }));
  assert.ok(ACTIONS.includes(d.action) && Math.abs(d.probs.reduce((a, x) => a + x, 0) - 1) < 1e-6);
});
