import test from 'node:test';
import assert from 'node:assert/strict';
import { computeDamage, npcStats } from '../js/combat/DamageSystem.js';
import { Fighter } from '../js/combat/Fighter.js';
import { resolveMelee } from '../js/combat/CombatSystem.js';
import { ITEMS } from '../js/data/items.js';

const S = npcStats({ force: 5 }), never = () => 1, always = () => 0;
const atk = (o = {}) => ({ weapon: ITEMS.epee_longue, stats: S, heavy: false, ...o });
const def = (o = {}) => ({ stats: { ...S, armor: 0 }, blocking: false, parrying: false, facing: true, ...o });

test('dégâts : base, lourd, critique, armure', () => {
  const base = computeDamage(atk(), def(), never).amount;
  assert.ok(computeDamage(atk({ heavy: true }), def(), never).amount > base * 1.6);
  assert.ok(computeDamage(atk(), def(), always).crit);
  assert.ok(computeDamage(atk(), def({ stats: { ...S, armor: .4 } }), never).amount < base * .7);
  const mace = computeDamage({ ...atk(), weapon: ITEMS.masse }, def({ stats: { ...S, armor: .4 } }), never).amount;
  assert.ok(mace > computeDamage({ ...atk(), weapon: { ...ITEMS.masse, armorPierce: 0 } }, def({ stats: { ...S, armor: .4 } }), never).amount, 'la masse perce l’armure');
});

test('parade, garde et garde brisée', () => {
  const base = computeDamage(atk(), def(), never).amount;
  const blocked = computeDamage(atk(), def({ blocking: true }), never);
  assert.ok(blocked.blocked && blocked.amount < base * .5 && !blocked.guardBreak);
  assert.ok(computeDamage(atk({ heavy: true }), def({ blocking: true }), never).guardBreak);
  const parried = computeDamage(atk(), def({ blocking: true, parrying: true }), never);
  assert.ok(parried.parried && parried.amount === 0);
  assert.ok(!computeDamage(atk(), def({ blocking: true, facing: false }), never).blocked, 'on ne pare pas dans le dos');
});

test('Fighter : phases d’attaque, endurance, esquive, mort', () => {
  const f = new Fighter({ maxHp: 50, maxStamina: 100, weapon: ITEMS.epee_courte, stats: S });
  assert.ok(f.attack(false));
  assert.equal(f.state, 'windup');
  assert.ok(f.stamina < 100);
  assert.ok(!f.attack(false), 'impossible d’enchaîner pendant l’élan');
  let t = 0; while (f.state === 'windup') { f.update(.01); t += .01; }
  assert.equal(f.state, 'active');
  assert.ok(Math.abs(t - ITEMS.epee_courte.windup / S.attackSpeed) < .03);
  while (f.state !== 'idle') f.update(.01);
  assert.ok(f.dodge());
  f.update(.1); assert.ok(f.invulnerable);
  while (f.state !== 'idle') f.update(.01);
  assert.ok(f.takeHit({ amount: 999 }));
  assert.equal(f.state, 'dead');
});

test('résolution spatiale : portée, arc et ennemis multiples', () => {
  const mk = (id, x, z, yaw = 0) => ({ id, pos: { x, z }, yaw, radius: .4, stats: S, fighter: new Fighter({ maxHp: 50, maxStamina: 80, weapon: ITEMS.epee_longue, stats: S }), hostileTo: o => o.id !== 'a' });
  const a = mk('a', 0, 0); a.hostileTo = () => true;
  const front = mk('front', 0, -1.5, Math.PI), behind = mk('behind', 0, 2), far = mk('far', 0, -5), side = mk('side', -1.2, -1.2, Math.PI);
  a.fighter.attack(false); while (a.fighter.state !== 'active') a.fighter.update(.01);
  const hits = resolveMelee(a, [a, front, behind, far, side], never);
  assert.deepEqual(hits.map(h => h.target.id), ['front'], 'une seule cible, la plus proche, devant');
  assert.equal(resolveMelee(a, [a, front, side], never).length, 1, 'chaque cible n’est touchée qu’une fois par coup');
  a.stats = { ...S, cleave: true };
  a.fighter.go('idle'); a.fighter.stamina = 80; a.fighter.attack(true); while (a.fighter.state !== 'active') a.fighter.update(.01);
  assert.equal(resolveMelee(a, [a, front, side], never).length, 2, 'Tourbillon : l’attaque lourde touche tout l’arc');
});
