import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, talk } from './helpers.mjs';

const villager = { id: 'kl_folk_0', role: 'villager', faction: 'peuple', barks: ['Bonjour.'] };
const beggar = { id: 'kl_beggar_1', role: 'beggar', faction: 'peuple', barks: ['Une pièce…'] };

test('demander une pièce : refus ou don, et le passant s’en souvient', () => {
  let gave = 0, refused = 0;
  for (let i = 0; i < 40; i++) {
    const g = newGame('kingslanding'); g.rng = () => (i % 4 === 0 ? .1 : .9);
    const gold = g.state.player.gold, v = talk(g, villager, 'une pièce');
    if (g.state.player.gold === gold + 1) gave++; else { refused++; assert.ok(v.text.length > 5); }
    assert.match(talk(g, villager, 'une pièce').text, /Encore toi|lâches/, 'la deuxième demande est refusée');
  }
  assert.ok(gave > 0 && refused > gave, `${gave} dons, ${refused} refus`);
});

test('les rumeurs orientent vers les missions de la région', () => {
  const g = newGame('kingslanding');
  const v = talk(g, villager, 'nouvelles');
  assert.ok(g.regionDef.rumors.includes(v.text));
});

test('aumône aux mendiants : or, karma, gratitude, puis un secret', () => {
  const g = newGame('kingslanding'), p = g.state.player, gold = p.gold;
  talk(g, beggar, 'Donner une pièce');
  assert.equal(p.gold, gold - 1); assert.equal(p.karma, 1);
  talk(g, beggar, 'Donner dix pièces'); talk(g, beggar, 'Donner dix pièces');
  assert.equal(p.karma, 7); assert.ok(g.state.npcs.kl_beggar_1.relation >= 30);
  const before = p.gold; talk(g, beggar, 'en savoir long', 'Merci');
  assert.equal(p.gold, before + 35, 'la cache révélée rapporte de l’or');
  assert.ok(!talk(g, beggar).options.some(o => o.text.includes('en savoir long')), 'le secret ne se donne qu’une fois');
});
