import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame } from './helpers.mjs';
import { recruit, capacity, troopCount, setFollowers, followerSlots, applyLosses, strength, army } from '../js/player/Army.js';
import { BATTLES } from '../js/data/battles.js';
import { UNITS } from '../js/data/units.js';
import { check } from '../js/core/Conditions.js';

test('recrutement : or, capacité, niveau requis', () => {
  const g = newGame(), p = g.state.player; p.gold = 2000;
  assert.ok(recruit(g, 'levee', 5).ok); assert.equal(p.gold, 2000 - 75);
  assert.match(recruit(g, 'homme_armes', 1).reason, /Niveau 3/);
  p.level = 5; p.renown = 20;
  assert.ok(recruit(g, 'chevalier', 1).ok);
  assert.match(recruit(g, 'levee', capacity(p)).reason, /Capacité/);
  assert.equal(troopCount(p), 6); assert.ok(strength(p) > 6);
});

test('compagnons : pris dans les troupes, limités par les places', () => {
  const g = newGame(), p = g.state.player; p.gold = 500; recruit(g, 'levee', 2); recruit(g, 'archer', 1);
  assert.equal(followerSlots(p), 1);
  assert.ok(!setFollowers(p, ['levee', 'archer']), 'trop de compagnons au niveau 1');
  p.level = 6; assert.ok(setFollowers(p, ['levee', 'archer']));
  assert.ok(!setFollowers(p, ['archer', 'archer']), 'pas assez d’archers');
  applyLosses(p, { archer: 1 });
  assert.deepEqual(army(p).followers, ['levee'], 'un compagnon mort quitte l’escorte');
});

test('batailles : ~100 combattants, conditions de déblocage valides', () => {
  for (const [id, b] of Object.entries(BATTLES)) {
    if (b.prologue) continue;
    const n = Object.values(b.enemy.units).reduce((a, x) => a + x, 0) + Object.values(b.allies.units).reduce((a, x) => a + x, 0);
    assert.ok(n >= 60 && n <= 80, `${id} : ${n} soldats PNJ (+ armée du joueur jusqu’à ~30)`);
    for (const u of [...Object.keys(b.enemy.units), ...Object.keys(b.allies.units)]) assert.ok(UNITS[u]);
    const g = newGame(b.region); assert.equal(check(b.requires, g.state), false, 'verrouillée au départ');
  }
});

// --- Bataille simulée sans rendu : vrais soldats, vrais cerveaux, vrai combat ---
import { Soldier } from '../js/game/Soldier.js';
import { SoldierBrain } from '../js/ai/SoldierBrain.js';
import { makeHostility } from '../js/game/Hostility.js';
import { resolveMelee } from '../js/combat/CombatSystem.js';
import { createRng } from '../js/core/Random.js';
import { talk } from './helpers.mjs';

const flat = { collide() {}, groundAt: () => 0, groundFn: () => 0, sees: () => true, solidAt: () => false, raycast: () => null, all: () => [] };
function simulate(nA, nB, seconds = 120) {
  const g = newGame(), hostile = makeHostility({ core: g, region: null }), rng = createRng(7);
  const battle = { order: 'charge', started: true, ended: false, routed: { A: false, B: false }, escaped: s => { s.fled = true; s.fighter.go?.('dead'); s.gone = true; } };
  const actors = [];
  for (const [team, n, z0, dir] of [['A', nA, 20, 1], ['B', nB, -20, -1]]) for (let i = 0; i < n; i++) {
    const x = (i % 10 - 4.5) * 2.2, z = z0 + dir * Math.floor(i / 10) * 2.4, s = new Soldier(i % 4 ? 'levee' : 'homme_armes', team, x, 0, z, dir > 0 ? 0 : Math.PI);
    s.brain = new SoldierBrain(s, battle); s.brain.slot = { x, z }; s.hostileTo = o => hostile(s, o); actors.push(s);
  }
  const W = { actors, physics: flat, nav: null, player: null, hour: 12, night: false, pathBudget: 3, rng, hostile, emit() {}, stealth: () => 1, fear: () => 0, alertAllies() {}, surrender() {}, escaped: battle.escaped };
  const dt = 1 / 20; let deaths = 0;
  for (let t = 0; t < seconds; t += dt) {
    for (const a of actors) if (a.alive && !a.gone) { const v = a.brain.update(dt, W); a.move(v.x * dt, v.z * dt, dt, flat); }
    for (const a of actors) {
      if (a.gone) continue; a.fighter.update(dt);
      if (a.fighter.state === 'active') for (const h of resolveMelee(a, actors.filter(o => !o.gone), rng)) if (h.killed) deaths++;
    }
    const alive = k => actors.filter(a => a.team === k && a.alive && !a.gone).length;
    if (!battle.routed.A && alive('A') <= nA * .3) battle.routed.A = true;
    if (!battle.routed.B && alive('B') <= nB * .3) battle.routed.B = true;
    if (!alive('A') || !alive('B')) break;
  }
  const left = k => actors.filter(a => a.team === k && a.alive && !a.gone).length;
  return { deaths, A: left('A'), B: left('B') };
}

test('bataille simulée : les deux lignes se rencontrent, des soldats meurent, le camp le plus fort l’emporte', () => {
  const r = simulate(40, 20);
  assert.ok(r.deaths >= 10, `morts : ${r.deaths}`);
  assert.ok(r.A > r.B, `survivants A=${r.A} B=${r.B}`);
});

test('camps : un soldat n’attaque jamais son propre camp ; le héros et ses compagnons sont du camp A', () => {
  const g = newGame(), hostile = makeHostility({ core: g, region: null });
  const a = new Soldier('levee', 'A', 0, 0, 0, 0), b = new Soldier('levee', 'B', 1, 0, 0, 0), a2 = new Soldier('archer', 'A', 2, 0, 0, 0);
  const hero = { kind: 'player', alive: true, def: {} }, mate = { kind: 'npc', alive: true, def: { follower: true } };
  assert.ok(hostile(a, b)); assert.ok(!hostile(a, a2)); assert.ok(hostile(hero, b)); assert.ok(!hostile(hero, a)); assert.ok(hostile(mate, b)); assert.ok(!hostile(hero, mate));
});

test('dialogues : le recruteur ouvre l’armée, le capitaine ne lance la bataille que si elle est débloquée', () => {
  const g = newGame('winterfell'), seen = []; g.bus.on('ui:army', () => seen.push('army')); g.bus.on('battle:start', ({ id }) => seen.push(id));
  talk(g, { id: 'wf_recruteur', role: 'recruiter', faction: 'stark' }, 'engager');
  assert.deepEqual(seen, ['army']);
  assert.throws(() => talk(g, { id: 'wf_capitaine', role: 'captain', faction: 'stark' }, 'je suis prêt'), /introuvable/);
  g.state.player.level = 3; g.state.quests.wf_iron = { state: 'completed', step: null, log: [] };
  talk(g, { id: 'wf_capitaine', role: 'captain', faction: 'stark' }, 'je suis prêt');
  assert.deepEqual(seen, ['army', 'bataille_bois']);
});

test('prologue : environ 100 contre 100, avec archers et cavaliers', () => {
  const b = BATTLES.prologue, sum = u => Object.values(u).reduce((a, x) => a + x, 0);
  assert.ok(sum(b.allies.units) >= 95 && sum(b.enemy.units) >= 95, `${sum(b.allies.units)} contre ${sum(b.enemy.units)}`);
  for (const side of [b.allies, b.enemy]) { assert.ok(side.units.archer > 0); assert.ok(side.units.cavalier > 0); }
  assert.ok(UNITS.cavalier.mounted);
  const c = new Soldier('cavalier', 'A', 0, 0, 0, 0), l = new Soldier('levee', 'A', 0, 0, 0, 0);
  assert.ok(c.stats.moveSpeed > l.stats.moveSpeed * 1.5, 'les cavaliers vont plus vite');
});

test('conseiller : explique quoi faire pour débloquer la bataille, puis désigne le recruteur et le capitaine', async () => {
  const { advise } = await import('../js/game/Advisor.js');
  const { REGIONS } = await import('../js/data/regions/index.js');
  const g = newGame('winterfell'), R = REGIONS.winterfell, battle = () => advise(g, R).find(a => a.kind === 'battle');
  assert.match(battle().text, /niveau 3/); assert.match(battle().text, /Le fer volé/);
  assert.ok(advise(g, R).some(a => a.kind === 'offer' && a.npc === 'torvald'), 'Torvald a une mission');
  g.state.player.level = 3; g.state.quests.wf_iron = { state: 'completed', step: null, log: [] };
  assert.equal(battle().npc, 'wf_recruteur', 'sans troupes : aller voir le recruteur');
  g.state.player.army = { troops: { levee: 10 }, followers: [] };
  assert.equal(battle().npc, 'wf_capitaine', 'avec une armée : aller voir le capitaine');
  assert.match(talk(g, { id: 'wf_capitaine', role: 'captain', faction: 'stark' }).options.map(o => o.text).join('|'), /je suis prêt/);
});
