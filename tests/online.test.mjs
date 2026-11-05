import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame } from './helpers.mjs';
import { memoryStorage } from '../js/core/SaveManager.js';
import { ONLINE } from '../js/online/config.js';
import { claimPseudo, submitScore, top, identity } from '../js/online/Leaderboard.js';

test('classement local : pseudo unique (insensible à la casse) et tri par niveau', async () => {
  const a = memoryStorage(), g = newGame();
  assert.equal((await claimPseudo(a, 'ab')).ok, false, 'trop court');
  assert.ok((await claimPseudo(a, 'Aelor')).ok); g.state.player.level = 4; await submitScore(a, g.state);
  a.setItem('asoiaf-online', JSON.stringify({ pseudo: 'Brienne', token: 'x' })); g.state.player.level = 7; await submitScore(a, g.state);
  assert.equal((await claimPseudo(a, 'aelor')).ok, false, 'déjà pris');
  assert.deepEqual((await top(a)).map(r => r.pseudo), ['Brienne', 'Aelor']);
});

test('classement en ligne : appels au serveur (faux serveur qui applique l’unicité)', async () => {
  const taken = new Map(), calls = [];
  const fake = async (url, o = {}) => {
    calls.push(url); const body = o.body ? JSON.parse(o.body) : null;
    if (url.endsWith('/rpc/claim_pseudo')) { const k = body.p_pseudo.toLowerCase(); const ok = !taken.has(k); if (ok) taken.set(k, { token: body.p_token, pseudo: body.p_pseudo, level: 1, renown: 0, kills: 0 }); return { ok: true, json: async () => ok }; }
    if (url.endsWith('/rpc/submit_score')) { const p = taken.get(body.p_pseudo.toLowerCase()); const ok = p?.token === body.p_token; if (ok) Object.assign(p, { level: body.p_level, renown: body.p_renown, kills: body.p_kills }); return { ok: true, json: async () => ok }; }
    return { ok: true, json: async () => [...taken.values()].sort((a, b) => b.level - a.level) };
  };
  Object.assign(ONLINE, { url: 'https://exemple.supabase.co', anonKey: 'cle' });
  try {
    const me = memoryStorage(), other = memoryStorage(), g = newGame();
    assert.ok((await claimPseudo(me, 'Daenerys', fake)).ok);
    assert.equal((await claimPseudo(other, 'DAENERYS', fake)).ok, false, 'un autre joueur ne peut pas prendre le pseudo');
    g.state.player.level = 9; assert.equal(await submitScore(me, g.state, fake), true);
    other.setItem('asoiaf-online', JSON.stringify({ pseudo: 'Daenerys', token: 'faux' }));
    assert.equal(await submitScore(other, g.state, fake), false, 'sans le jeton secret, impossible de modifier le score');
    assert.equal((await top(me, fake))[0].level, 9);
    assert.ok(identity(me).token.length >= 32);
  } finally { Object.assign(ONLINE, { url: '', anonKey: '' }); }
});
