import test from 'node:test';
import assert from 'node:assert/strict';
import { validateQuests } from '../js/quests/QuestRegistry.js';
import { addItem } from '../js/player/Inventory.js';
import { newGame, talk } from './helpers.mjs';

test('toutes les quêtes sont structurellement valides', () => assert.deepEqual(validateQuests(), []));

test('Winterfell — Le fer volé, de bout en bout, puis quête débloquée', () => {
  const g = newGame('winterfell'), p = g.state.player, gold = p.gold;
  talk(g, 'torvald', 'Je vous la ramène');
  assert.equal(g.quests.status('wf_iron'), 'active');
  g.bus.emit('marker:reached', { marker: 'wf_camp' });
  assert.equal(g.state.quests.wf_iron.step, 'recover');
  g.bus.emit('marker:reached', { marker: 'wf_camp' }); // répété : sans effet
  assert.equal(g.state.quests.wf_iron.step, 'recover');
  addItem(p, 'caisse_fer', 1, g.bus);
  assert.equal(g.state.quests.wf_iron.step, 'back');
  talk(g, 'torvald', 'La voici');
  assert.equal(g.quests.status('wf_iron'), 'completed');
  assert.equal(p.gold, gold + 90);
  assert.equal(g.state.factions.stark, 15 + 15);
  assert.ok(!p.inventory.some(s => s.id === 'caisse_fer'), 'la caisse est rendue');
  talk(g, 'torvald', 'J’irai la voir');
  assert.equal(g.quests.status('wf_wolves'), 'active');
  talk(g, 'maege');
  assert.equal(g.quests.status('wf_wolves'), 'completed');
});

test('Une quête n’est jamais validée sans ses conditions réelles', () => {
  const g = newGame('winterfell');
  talk(g, 'torvald', 'Je vous la ramène');
  g.bus.emit('quest:signal', { quest: 'wf_iron', signal: 'give' }); // signal prématuré
  assert.equal(g.quests.status('wf_iron'), 'active');
  assert.equal(g.state.quests.wf_iron.step, 'find');
});

test('Port-Réal — trois issues : combat, négociation, trahison', () => {
  const fight = newGame('kingslanding');
  talk(fight, 'orwyn', 'J’accepte');
  fight.bus.emit('object:used', { object: 'kl_wreck' });
  assert.ok(fight.state.world.flags.kl_ambush, 'l’embuscade est déclenchée');
  fight.bus.emit('marker:reached', { marker: 'kl_camp' });
  for (let i = 0; i < 4; i++) fight.bus.emit('npc:defeated', { group: 'kl_bandits' });
  assert.equal(fight.state.quests.kl_bandits.step, 'back_fight');
  talk(fight, 'orwyn');
  assert.equal(fight.state.quests.kl_bandits.outcome, 'fight');
  assert.ok(fight.quests.canStart('kl_letter'), 'nouvelle quête débloquée');

  const peace = newGame('kingslanding', { classId: 'noble' });
  talk(peace, 'orwyn', 'J’accepte');
  peace.bus.emit('object:used', { object: 'kl_wreck' }); peace.bus.emit('marker:reached', { marker: 'kl_camp' });
  talk(peace, 'nerys', 'Le Guet prépare');
  assert.equal(peace.state.quests.kl_bandits.step, 'back_peace', 'le noble réussit le test de persuasion');

  const weak = newGame('kingslanding', { classId: 'guerrier' });
  talk(weak, 'orwyn', 'J’accepte');
  weak.bus.emit('object:used', { object: 'kl_wreck' }); weak.bus.emit('marker:reached', { marker: 'kl_camp' });
  const v = talk(weak, 'nerys', 'Le Guet prépare');
  assert.match(v.text, /comique/, 'le guerrier peu charismatique échoue');

  const bad = newGame('kingslanding', { classId: 'noble' });
  talk(bad, 'orwyn', 'J’accepte');
  bad.bus.emit('object:used', { object: 'kl_wreck' }); bad.bus.emit('marker:reached', { marker: 'kl_camp' });
  const before = bad.state.player.gold;
  talk(bad, 'nerys', 'prochain convoi', 'Marché conclu');
  assert.equal(bad.state.player.gold, before + 90);
  talk(bad, 'orwyn', 'j’ai fait un marché');
  assert.equal(bad.state.quests.kl_bandits.outcome, 'betray_exposed');
  assert.match(talk(bad, 'orwyn').text, /ce que vous avez fait/, 'Orwyn se souvient de la trahison');
});

test('Le Mur — choix moral et échec si le donneur meurt', () => {
  for (const [frag, outcome] of [['Pars', 'free'], ['Tu viens avec nous', 'prisoner'], ['La loi du Mur', 'execute']]) {
    const g = newGame('wall');
    talk(g, 'aldous', 'Je viens avec vous');
    talk(g, { id: 'wall_recruteur', role: 'recruiter', faction: 'garde' }, 'Ils viennent avec moi');
    assert.equal(g.state.player.army.followers.length, 2, 'deux patrouilleurs suivent le héros');
    g.bus.emit('marker:reached', { marker: 'wall_tunnel' });
    g.bus.emit('marker:reached', { marker: 'wall_grove' });
    for (let i = 0; i < 3; i++) g.bus.emit('npc:defeated', { group: 'wall_wildlings' });
    talk(g, 'ygra', frag);
    talk(g, 'aldous');
    assert.equal(g.state.quests.wall_patrol.outcome, outcome);
  }
  const g = newGame('wall');
  talk(g, 'aldous', 'Je viens avec vous');
  g.bus.emit('npc:killed', { npc: 'aldous' });
  assert.equal(g.quests.status('wall_patrol'), 'failed');
});

test('Le Mur — expédition au Poing des Premiers Hommes, loin au nord', () => {
  const g = newGame('wall');
  g.state.quests.wall_patrol = { state: 'completed', step: null, log: [] }; g.state.quests.wall_report = { state: 'completed', step: null, log: [] };
  talk(g, 'aldous', 'J’irai au Poing');
  assert.equal(g.quests.status('wall_fist'), 'active');
  g.bus.emit('marker:reached', { marker: 'wall_creek' });
  g.bus.emit('marker:reached', { marker: 'wall_fist' });
  assert.equal(g.state.quests.wall_fist.step, 'cache');
  g.bus.emit('object:used', { object: 'wall_cache' });
  assert.equal(g.state.quests.wall_fist.step, 'dead'); assert.ok(g.state.world.flags.fist_dead, 'les morts se lèvent');
  for (let i = 0; i < 5; i++) g.bus.emit('npc:defeated', { group: 'wall_wights' });
  talk(g, 'aldous');
  assert.equal(g.quests.status('wall_fist'), 'completed');
});
