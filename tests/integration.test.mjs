import test from 'node:test';
import assert from 'node:assert/strict';
import { REGIONS } from '../js/data/regions/index.js';
import { QUESTS } from '../js/quests/QuestRegistry.js';
import { DIALOGUES } from '../js/data/dialogues/index.js';
import { ITEMS } from '../js/data/items.js';
import { FACTIONS } from '../js/data/factions.js';
import { START_REGIONS } from '../js/core/GameState.js';
import { newGame, talk } from './helpers.mjs';
import { check } from '../js/core/Conditions.js';

test('chaque quête est jouable dans sa région : donneur, marqueurs, objets, groupes', () => {
  for (const [id, q] of Object.entries(QUESTS)) {
    const R = REGIONS[q.region]; assert.ok(R, `${id} : région ${q.region}`);
    const npcIds = new Set([...R.npcs.map(n => n.id), ...R.groups.flatMap(g => g.members.map(m => m.id))]);
    assert.ok(npcIds.has(q.giver), `${id} : donneur ${q.giver} absent de ${q.region}`);
    for (const step of Object.values(q.steps)) for (const o of step.objectives) {
      if (o.type === 'reach') assert.ok(R.markers.some(m => m.id === o.marker), `${id} : marqueur ${o.marker}`);
      if (o.type === 'interact') assert.ok(R.objects.some(m => m.id === o.object), `${id} : objet ${o.object}`);
      if (o.type === 'talk') assert.ok(npcIds.has(o.npc), `${id} : PNJ ${o.npc}`);
      if (o.type === 'defeat') { const g = R.groups.find(g => g.id === o.group); assert.ok(g && g.members.length >= o.count, `${id} : groupe ${o.group}`); }
      if (o.type === 'collect') assert.ok(R.objects.some(ob => ob.effects?.some(e => e.item === o.item)), `${id} : source de ${o.item}`);
    }
  }
});

test('données de région valides : factions, armes, armures, stocks, dialogues', () => {
  assert.deepEqual(Object.keys(REGIONS).sort(), [...START_REGIONS].sort());
  for (const R of Object.values(REGIONS)) {
    for (const n of [...R.npcs, ...R.groups.flatMap(g => g.members.map(m => ({ ...m, faction: g.faction })))]) {
      assert.ok(FACTIONS[n.faction], `${n.id} : faction ${n.faction}`);
      assert.ok(ITEMS[n.weapon ?? 'poings']?.type === 'weapon', `${n.id} : arme ${n.weapon}`);
      if (n.armor) assert.equal(ITEMS[n.armor]?.type, 'armor', `${n.id} : armure ${n.armor}`);
      for (const id of Object.keys(n.stock ?? {})) assert.ok(ITEMS[id], `${n.id} : stock ${id}`);
      if (n.merchant || ['quest', 'priest'].includes(n.role)) assert.ok(DIALOGUES[n.id] || n.barks, `${n.id} : pas de dialogue`);
    }
    const s = newGame(R.id).state;
    for (const n of R.npcs) check(n.when, s); // aucune condition invalide
    for (const g of R.groups) { check(g.when, s); if (Array.isArray(g.stance)) g.stance.forEach(x => check(x.when, s)); }
  }
});

test('Wat épargné devient apprenti à la forge (mémoire et conséquence)', () => {
  const g = newGame('winterfell'), R = REGIONS.winterfell, forgeWat = R.npcs.find(n => n.id === 'wat');
  talk(g, 'torvald', 'Je vous la ramène');
  talk(g, { id: 'wat', surrendered: true, faction: 'deserteurs' }, 'Épargner Wat');
  assert.ok(g.state.npcs.wat.flags.spared);
  assert.ok(!check(forgeWat.when, g.state), 'pas encore à la forge');
  g.bus.emit('marker:reached', { marker: 'wf_camp' }); g.effects([{ item: 'caisse_fer' }]); talk(g, 'torvald', 'La voici');
  assert.ok(check(forgeWat.when, g.state), 'Wat apparaît à la forge');
  assert.match(talk(g, 'wat').text, /Grâce à vous/);
});
