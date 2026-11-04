import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, talk } from './helpers.mjs';
import { addItem, removeItem, equip, consume, count } from '../js/player/Inventory.js';
import { addXp, learn, xpForLevel, canLearn } from '../js/player/Progression.js';
import { changeRep, rank, hostileToPlayer } from '../js/factions/Reputation.js';
import { price } from '../js/economy/Markets.js';
import { buy, sell, steal } from '../js/economy/Trading.js';
import { derive } from '../js/player/Stats.js';
import { WorldClock } from '../js/world/WorldClock.js';

test('inventaire : ajout, retrait, équipement, consommation', () => {
  const p = newGame().state.player;
  addItem(p, 'epee_chateau'); assert.ok(equip(p, 'epee_chateau'));
  assert.equal(derive(p).weaponId, 'epee_chateau');
  assert.ok(removeItem(p, 'epee_chateau')); assert.equal(p.equipped.weapon, null, 'arme retirée = déséquipée');
  const v = { hp: 10, maxHp: 100, stamina: 0, maxStamina: 100 };
  assert.ok(consume(p, 'onguent', v)); assert.equal(v.hp, 55);
  assert.throws(() => addItem(p, 'inexistant'));
});

test('progression : niveaux, points, prérequis des talents', () => {
  const p = newGame().state.player;
  assert.equal(addXp(p, 1000), 3, '1000 × 1,09 = 1090 XP : 100 + 283 + 520 consommés');
  assert.equal(p.level, 4); assert.equal(p.skillPoints, 4);
  assert.ok(p.xp < xpForLevel(4));
  assert.ok(!canLearn(p, 'garde_de_fer'), 'prérequis manquant');
  assert.ok(learn(p, 'lame_aiguisee')); assert.ok(learn(p, 'garde_de_fer'));
  assert.ok(derive(p).block > .7);
});

test('réputation : propagation, rangs, hostilité', () => {
  const s = newGame().state, stark0 = s.factions.stark, tully0 = s.factions.tully;
  changeRep(s, 'stark', 40);
  assert.equal(s.factions.stark, stark0 + 40);
  assert.ok(s.factions.tully > tully0, 'les alliés des Stark apprécient');
  assert.equal(rank(30), 'Amical'); assert.equal(rank(50), 'Allié');
  assert.ok(hostileToPlayer(s, 'bandits'));
  assert.ok(!hostileToPlayer(s, 'stark'));
});

test('commerce : prix locaux, achat, vente, vol et mémoire du marchand', () => {
  const g = newGame('kingslanding', { classId: 'marchand' }), p = g.state.player;
  const npc = { id: 'dalla', faction: 'peuple', stock: { epee_longue: 1, onguent: 3 } };
  assert.ok(price('epee_longue', 'buy', p) > price('epee_longue', 'sell', p));
  assert.ok(price('epee_longue', 'buy', p, { weapon: 1.3 }) > price('epee_longue', 'buy', p));
  const gold = p.gold, r = buy(g, npc, 'epee_longue');
  assert.ok(r.ok); assert.equal(p.gold, gold - r.cost); assert.equal(count(p, 'epee_longue'), 1);
  assert.equal(buy(g, npc, 'epee_longue').reason, 'Rupture de stock.');
  assert.ok(sell(g, npc, 'vin_arbor').ok);
  assert.ok(steal(g, npc, 'onguent', () => 0).ok, 'vol réussi');
  const caught = steal(g, npc, 'onguent', () => .99);
  assert.ok(caught.caught); assert.ok(p.bounty.guet > 0);
  assert.equal(buy(g, npc, 'onguent').ok, false, 'le marchand refuse après le vol');
  assert.match(talk(g, { id: 'dalla', merchant: true, faction: 'peuple' }).text, /souviens/);
});

test('horloge : jour, nuit, météo', () => {
  const t = { day: 1, minutes: 22 * 60 }, c = new WorldClock(t);
  assert.ok(c.isNight); c.advance(10 * 60, 'nord');
  assert.equal(t.day, 2); assert.ok(!c.isNight); assert.ok(t.weather);
});
