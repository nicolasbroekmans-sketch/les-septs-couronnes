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

test('se relever après la mort : primes effacées, gardes apaisés', async () => {
  const { pardon, hostileToPlayer } = await import('../js/factions/Reputation.js');
  const g = newGame('kingslanding'), s = g.state;
  s.player.bounty = { guet: 200 }; s.world.flags['provoked:kl_guards'] = true; s.factions.guet = -80;
  assert.ok(hostileToPlayer(s, 'guet'));
  pardon(s);
  assert.ok(!hostileToPlayer(s, 'guet')); assert.equal(s.world.flags['provoked:kl_guards'], undefined);
  s.player.bounty = { guet: 50 };
  assert.ok(!hostileToPlayer(s, 'guet'), 'une petite prime ne déclenche pas l’attaque à vue');
});

test('vol à la tire : réussite (or, mémoire), échec (prime, rancune), pas deux fois la même poche', async () => {
  const { pickpocket, pickChance } = await import('../js/economy/Pickpocket.js');
  const g = newGame('kingslanding'), p = g.state.player, gold = p.gold;
  assert.ok(pickChance(p, { sneaking: true, behind: true, watchers: 0 }) > pickChance(p, { sneaking: false, behind: false, watchers: 2 }), 'accroupi et dans le dos : plus facile ; sous les yeux des gardes : plus dur');
  const ok = pickpocket(g, { id: 'passant', role: 'merchant' }, { sneaking: true, behind: true, watchers: 0, law: 'guet' }, () => 0);
  assert.ok(ok.ok && p.gold > gold && ok.gold >= 8);
  assert.equal(pickpocket(g, { id: 'passant', role: 'merchant' }, {}, () => 0).ok, false, 'poches déjà vides');
  const ko = pickpocket(g, { id: 'garde', role: 'guard' }, { watchers: 1, law: 'guet' }, () => .99);
  assert.ok(ko.caught); assert.equal(p.bounty.guet, 30); assert.ok(g.state.npcs.garde.relation < 0);
});

test('contrats : trois offres par lieu et par jour ; chasse, pli et collecte payés à la remise', async () => {
  const C = await import('../js/world/Contracts.js');
  const { REGIONS } = await import('../js/data/regions/index.js');
  const g = newGame('winterfell'), s = g.state, R = REGIONS.winterfell, gold = s.player.gold;
  const list = C.offers(s, R); assert.equal(list.length, 3); assert.deepEqual(list.map(o => o.kind).sort(), ['collect', 'deliver', 'hunt']);
  assert.deepEqual(C.offers(s, R).map(o => o.id), list.map(o => o.id), 'mêmes offres le même jour');
  for (const o of list) assert.ok(C.accept(s, o).ok);
  assert.equal(C.offers(s, R).length, 0, 'offres acceptées retirées du tableau');
  const hunt = list.find(o => o.kind === 'hunt'); for (let i = 0; i < 3; i++) C.onDefeated(s, 'contract_' + hunt.id);
  assert.ok(C.turnIn(g, hunt.id)); assert.equal(s.player.gold, gold + hunt.reward);
  const pli = list.find(o => o.kind === 'deliver');
  talk(g, { id: pli.npc, role: R.npcs.find(n => n.id === pli.npc).role, faction: 'stark' }, 'J’ai un pli');
  assert.equal(C.book(s).active.some(c => c.id === pli.id), false, 'pli remis et payé');
  const col = list.find(o => o.kind === 'collect'); assert.equal(C.turnIn(g, col.id), null, 'pas encore les objets');
  s.player.inventory.push({ id: col.item, qty: 2 }); assert.ok(C.turnIn(g, col.id));
});
