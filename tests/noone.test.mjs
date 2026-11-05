import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, talk } from './helpers.mjs';
import { computeDamage, npcStats } from '../js/combat/DamageSystem.js';
import { ITEMS } from '../js/data/items.js';

const beggars = ['kl_beggar_1', 'kl_beggar_2', 'kl_beggar_3'].map(id => ({ id, role: 'beggar', faction: 'peuple' }));
function toGift(g) {
  talk(g, 'etranger', 'Je prends la pièce');
  assert.equal(g.quests.status('kl_noone'), 'active');
  for (const b of beggars) talk(g, b, 'Donner une pièce');
  assert.equal(g.state.quests.kl_noone.step, 'name');
  const v = talk(g, 'etranger', '{name}'.replace('{name}', 'Aelor'));
  assert.match(v.text, /qui a un nom/, 'donner son nom est la mauvaise réponse');
  talk(g, 'etranger', 'Personne');
  assert.equal(g.state.quests.kl_noone.step, 'gift');
}

test('Personne : aumônes, la bonne réponse, puis le don discret', () => {
  const g = newGame('kingslanding'); toGift(g);
  g.effects([{ flag: 'noone_clean', value: true }]); g.bus.emit('npc:defeated', { group: 'kl_morrec' });
  talk(g, 'etranger', 'Valar dohaeris');
  assert.equal(g.state.quests.kl_noone.outcome, 'faceless');
  assert.ok(g.state.player.inventory.some(s => s.id === 'dague_fer'));
  assert.ok(g.state.player.cosmetics.owned.includes('titre_personne'), 'titre légendaire « Personne »');
  assert.ok(!g.state.player.inventory.some(s => s.id === 'piece_fer'));
});

test('Personne : vu pendant le don, ou refus', () => {
  const seen = newGame('kingslanding'); toGift(seen);
  seen.effects([{ flag: 'noone_clean', value: false }]); seen.bus.emit('npc:defeated', { group: 'kl_morrec' });
  talk(seen, 'etranger', 'Je ferai mieux');
  assert.equal(seen.state.quests.kl_noone.outcome, 'seen');
  const no = newGame('kingslanding'); toGift(no);
  talk(no, 'etranger', 'Je refuse');
  assert.equal(no.state.quests.kl_noone.outcome, 'refused');
});

test('attaque sournoise : dégâts doublés, triplés avec le talent', () => {
  const S = npcStats({ force: 5 }), d = { stats: { ...S, armor: 0 }, facing: false };
  const base = computeDamage({ weapon: ITEMS.dague, stats: S }, d, () => 1).amount;
  assert.ok(Math.abs(computeDamage({ weapon: ITEMS.dague, stats: S, sneak: true }, d, () => 1).amount - base * 2) <= 1);
  assert.ok(Math.abs(computeDamage({ weapon: ITEMS.dague, stats: { ...S, sneak: true }, sneak: true }, d, () => 1).amount - base * 3) <= 1.5);
});
