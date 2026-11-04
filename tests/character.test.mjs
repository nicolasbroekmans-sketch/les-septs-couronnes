import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlayer, validateCreation } from '../js/player/Character.js';
import { derive } from '../js/player/Stats.js';
import { CREATION } from './helpers.mjs';

test('validation de la création', () => {
  assert.equal(validateCreation(CREATION).length, 0);
  assert.ok(validateCreation({ ...CREATION, name: 'A' }).length > 0);
  assert.ok(validateCreation({ ...CREATION, age: 12 }).length > 0);
  assert.throws(() => createPlayer({ ...CREATION, classId: 'mage' }));
});

test('classe, origine et âge modifient vraiment les statistiques', () => {
  const g = createPlayer(CREATION), a = createPlayer({ ...CREATION, classId: 'archer' });
  assert.equal(g.attrs.constitution, 8, 'guerrier 7 + bonus du Nord 1');
  assert.ok(derive(g).melee > derive(a).melee, 'le guerrier frappe plus fort au corps à corps');
  assert.ok(derive(a).ranged > derive(g).ranged, 'l’archer tire mieux');
  assert.ok(derive(g).maxHp > derive(a).maxHp);
  const old = createPlayer({ ...CREATION, age: 50 });
  assert.equal(old.attrs.intelligence, g.attrs.intelligence + 1);
  assert.equal(createPlayer({ ...CREATION, classId: 'vagabond' }).skillPoints, 2);
});

test('équipement initial équipé et difficulté appliquée', () => {
  const p = createPlayer(CREATION);
  assert.equal(p.equipped.weapon, 'epee_longue');
  assert.equal(p.equipped.armor, 'brigandine');
  const hard = createPlayer({ ...CREATION, difficulty: 'difficile' });
  assert.ok(derive(hard).taken > derive(p).taken);
  assert.ok(derive(hard).melee < derive(p).melee);
});
