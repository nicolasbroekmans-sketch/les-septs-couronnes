import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame } from './helpers.mjs';
import { checkGift, rollGift, equipCosmetic, lookFromCosmetics, GIFT_INTERVAL, secondsToGift } from '../js/player/Rewards.js';
import { upgrade, upgradeCost, upgradeLevel, MAX_UPGRADE } from '../js/economy/Upgrades.js';
import { derive } from '../js/player/Stats.js';
import { COSMETICS } from '../js/data/cosmetics.js';
import { createRng } from '../js/core/Random.js';

test('cadeau mystère toutes les 15 minutes de jeu, jamais avant', () => {
  const g = newGame(), s = g.state, seen = [];
  g.bus.on('gift:opened', x => seen.push(x));
  s.stats.playTime = GIFT_INTERVAL - 1;
  assert.equal(checkGift(g), null);
  assert.equal(secondsToGift(s), 1);
  s.stats.playTime = GIFT_INTERVAL;
  assert.ok(checkGift(g, createRng(1)));
  assert.equal(checkGift(g), null, 'pas deux cadeaux d’affilée');
  assert.equal(seen.length, 1); assert.equal(s.rewards.nextGift, GIFT_INTERVAL * 2);
});

test('le tirage privilégie les objets non possédés et respecte les raretés', () => {
  const s = newGame().state, rng = createRng(5), counts = {};
  for (let i = 0; i < 2000; i++) { const g = rollGift(s, rng); counts[g.rarity] = (counts[g.rarity] ?? 0) + 1; if (g.kind === 'cosmetic') assert.ok(COSMETICS[g.id]); }
  assert.ok(counts.commun > counts.rare && counts.rare > counts.epique && counts.epique > counts.legendaire);
  s.player.cosmetics = { owned: Object.keys(COSMETICS), equipped: {} };
  for (let i = 0; i < 50; i++) assert.equal(rollGift(s, rng).kind, 'loot', 'tout possédé : butin à la place');
});

test('équiper une cosmétique change l’apparence et le titre', () => {
  const p = newGame().state.player;
  assert.ok(!equipCosmetic(p, 'cape_doree'), 'non possédée');
  p.cosmetics = { owned: ['cape_doree', 'titre_hardi'], equipped: {} };
  equipCosmetic(p, 'cape_doree'); equipCosmetic(p, 'titre_hardi');
  assert.deepEqual([lookFromCosmetics(p).cloak, lookFromCosmetics(p).title], ['#c9a227', 'le Hardi']);
  equipCosmetic(p, 'cape_doree'); assert.equal(lookFromCosmetics(p).cloak, null, 'second clic : retiré');
});

test('forge : amélioration payante, effet réel, plafond', () => {
  const g = newGame(), p = g.state.player; p.gold = 5000;
  const before = derive(p).melee, armor0 = derive(p).armor;
  for (let i = 0; i < MAX_UPGRADE; i++) assert.ok(upgrade(g, 'epee_longue').ok);
  assert.equal(upgradeLevel(p, 'epee_longue'), MAX_UPGRADE);
  assert.equal(upgradeCost(p, 'epee_longue'), null); assert.equal(upgrade(g, 'epee_longue').ok, false);
  assert.ok(Math.abs(derive(p).melee / before - 1.36) < 1e-9, '+12 % par niveau');
  upgrade(g, 'brigandine'); assert.ok(derive(p).armor > armor0);
  p.gold = 0; assert.equal(upgrade(g, 'brigandine').reason, 'Pas assez d’or.');
});
