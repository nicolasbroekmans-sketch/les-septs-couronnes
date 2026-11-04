import test from 'node:test';
import assert from 'node:assert/strict';
import { SaveManager, memoryStorage, migrate } from '../js/core/SaveManager.js';
import { newGame, talk } from './helpers.mjs';
import { learn } from '../js/player/Progression.js';
import { GameCore } from '../js/game/GameCore.js';

test('sauvegarde → chargement : état identique et partie reprise', () => {
  const g = newGame('winterfell'), sm = new SaveManager(memoryStorage());
  talk(g, 'torvald', 'Je vous la ramène');
  g.bus.emit('marker:reached', { marker: 'wf_camp' });
  learn(g.state.player, 'lame_aiguisee');
  g.state.player.position = [12, 0, -40];
  sm.save('slot1', g.state, 'test');
  const loaded = sm.load('slot1');
  assert.deepEqual(loaded, JSON.parse(JSON.stringify(g.state)));
  const resumed = new GameCore(loaded);
  assert.equal(resumed.state.quests.wf_iron.step, 'recover', 'la quête reprend à la bonne étape');
  resumed.bus.emit('inventory:changed', {});
  assert.deepEqual(resumed.state.player.skills, ['lame_aiguisee']);
  assert.equal(sm.list()[0].name, 'Aelor');
  assert.equal(sm.load('absent'), null);
  sm.storage.setItem('asoiaf-rpg:autre', '{"x":1}');
  assert.equal(sm.list().length, 1, 'les entrées sans métadonnées sont ignorées');
});

test('migration d’une ancienne version et refus d’une version future', () => {
  const s = JSON.parse(JSON.stringify(newGame().state));
  s.version = 0; delete s.stats; delete s.player.bounty;
  const m = migrate(s);
  assert.equal(m.version, 1); assert.deepEqual(m.player.bounty, {}); assert.ok(m.stats);
  assert.throws(() => migrate({ ...m, version: 99 }));
});
